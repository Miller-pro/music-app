import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/middleware/auth";
import { apiRoute, ConflictError, ValidationError } from "@/lib/middleware/errors";
import { generatePublisherId, isValidPublisherId } from "@/lib/utils/publisher-id";
import { generateVerificationToken } from "@/lib/utils/verification-token";
import { getRequestMeta } from "@/lib/utils/request-meta";
import { verifyRecaptchaToken } from "@/lib/utils/recaptcha";
import {
  checkDuplicates,
  checkSignupIP,
  detectSuspiciousPatterns,
  shouldRequireManualReview,
} from "@/lib/utils/fraud-detection";
import type { PublisherCreateRequest } from "@/types/api";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// POST /api/publishers/create
// Called at the end of onboarding Step 6. Atomically creates the publisher
// row with all the collected state, runs fraud checks, logs verification
// attempts for anything the wizard already verified (domain, phone).
// ---------------------------------------------------------------------------
export const POST = apiRoute(async (request) => {
  const { user } = await requireAuth();
  const body = (await request.json().catch(() => null)) as PublisherCreateRequest | null;
  if (!body) throw new ValidationError("Invalid JSON body");

  // The onboarding wizard enforces these client-side, but clients lie. Use
  // Zod termsSchema contents here as a last line of defense.
  if (!body.tos_accepted || !body.privacy_accepted || !body.data_consent) {
    throw new ValidationError("You must accept Terms, Privacy, and data processing consent");
  }
  if (!body.platform_type) throw new ValidationError("Missing platform");

  const { ip, userAgent } = getRequestMeta();
  const recaptcha = await verifyRecaptchaToken(body.recaptcha_token, ip);

  // Publisher ID: prefer the one the client showed the user (they may have
  // copied it from the ads.txt step). Reject malformed ids and generate
  // fresh on unique-constraint collisions below.
  let publisher_id =
    body.publisher_id && isValidPublisherId(body.publisher_id)
      ? body.publisher_id
      : generatePublisherId();

  const domain_verification_token =
    body.domain_verification_token || generateVerificationToken();

  // Fraud signals — run in parallel, they're independent DB reads.
  const [ipCheck, dupCheck, patternCheck] = await Promise.all([
    checkSignupIP(ip),
    checkDuplicates({ email: user.email ?? undefined, phone: body.phone, excludeUserId: user.id }),
    Promise.resolve(
      detectSuspiciousPatterns({
        domain: body.domain,
        bundle_id: body.bundle_id,
        monthly_users: body.monthly_users,
      }),
    ),
  ]);

  const fraud_flags = [...ipCheck.flags, ...dupCheck.flags, ...patternCheck.flags];
  const status = shouldRequireManualReview({
    fraud_flags,
    monthly_users: body.monthly_users,
    recaptcha_score: recaptcha.score,
  })
    ? "pending"
    : "incomplete";

  const admin = createAdminClient();

  // Insert with a retry loop on publisher_id collision — practically never
  // fires, but we'd rather retry than 500.
  let insertResult;
  for (let attempt = 0; attempt < 5; attempt++) {
    const payload = {
      user_id: user.id,
      email: user.email!,
      name: body.name ?? null,
      company: body.company ?? null,
      phone: body.phone ?? null,
      phone_verified: !!body.phone_verified,
      phone_verified_at: body.phone_verified ? new Date().toISOString() : null,
      platform_type: body.platform_type,
      domain: body.domain ?? null,
      bundle_id: body.bundle_id ?? null,
      developer_url: body.developer_url ?? null,
      app_store_url: body.app_store_url || null,
      app_name: body.app_name ?? null,
      publisher_id,
      email_verified: !!user.email_confirmed_at,
      email_verified_at: user.email_confirmed_at ?? null,
      domain_verified: !!body.domain_verified,
      domain_verified_at: body.domain_verified ? new Date().toISOString() : null,
      domain_verification_method: body.domain_verification_method ?? null,
      domain_verification_token,
      ads_txt_verified: !!body.ads_txt_verified,
      ads_txt_verified_at: body.ads_txt_verified ? new Date().toISOString() : null,
      status,
      monthly_users: body.monthly_users ?? null,
      primary_country: body.primary_country ?? null,
      signup_ip: ip,
      signup_user_agent: userAgent,
      recaptcha_score: recaptcha.score,
      fraud_flags,
      consented_at: new Date().toISOString(),
      data_processing_consent: !!body.data_consent,
      email_preferences: { email_consent: !!body.email_consent },
    };

    const res = await admin.from("publishers").insert(payload).select("*").single();

    if (!res.error) {
      insertResult = res;
      break;
    }

    // Postgres unique-violation codes: 23505 for publisher_id, user_id.
    if (res.error.code === "23505") {
      if (res.error.message.includes("publisher_id")) {
        publisher_id = generatePublisherId();
        continue;
      }
      if (res.error.message.includes("user_id")) {
        throw new ConflictError("A publisher account already exists for this user");
      }
    }
    throw res.error;
  }

  if (!insertResult?.data) {
    throw new ConflictError("Couldn't allocate a unique publisher ID — try again");
  }

  const publisher = insertResult.data;

  // Log the verification attempts that happened client-side during the
  // wizard so the audit trail starts full.
  const attempts: Array<Record<string, unknown>> = [];
  if (body.domain_verified) {
    attempts.push({
      publisher_id: publisher.id,
      verification_type: "domain",
      method: body.domain_verification_method,
      success: true,
    });
  }
  if (body.phone_verified) {
    attempts.push({
      publisher_id: publisher.id,
      verification_type: "phone",
      method: "sms",
      success: true,
    });
  }
  if (attempts.length) {
    await admin.from("verification_attempts").insert(attempts);
  }

  return NextResponse.json({ publisher });
});
