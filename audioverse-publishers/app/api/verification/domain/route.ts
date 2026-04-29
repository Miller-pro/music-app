import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, requirePublisher } from "@/lib/middleware/auth";
import { apiRoute, ValidationError } from "@/lib/middleware/errors";
import {
  verifyDomainDNS,
  verifyDomainHtmlFile,
  verifyDomainMetaTag,
} from "@/lib/utils/verification";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import type { DomainVerificationMethod } from "@/lib/supabase/types";

export const runtime = "nodejs";

// POST /api/verification/domain
// Body: { method }
// The domain + token come from the authenticated publisher's row — we don't
// accept them from the client to prevent one user triggering verifications
// on behalf of another.
export const POST = apiRoute(async (request) => {
  const { user } = await requireAuth();
  const publisher = await requirePublisher(user.id);

  // Rate limit: 10 verify attempts per publisher per 5 minutes. Prevents
  // loops thrashing external sites.
  const rl = checkRateLimit(`verify-domain:${publisher.id}`, 10, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts. Please wait a bit.", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    method?: DomainVerificationMethod;
  } | null;
  if (!body?.method) throw new ValidationError("Missing method");

  const targetDomain = resolveTargetDomain(publisher);
  if (!targetDomain) {
    throw new ValidationError(
      "No domain on file. Complete your profile before verifying.",
    );
  }

  const admin = createAdminClient();
  const token = publisher.domain_verification_token;
  const { method } = body;

  const result =
    method === "meta_tag"
      ? await verifyDomainMetaTag(targetDomain, token)
      : method === "dns_txt"
        ? await verifyDomainDNS(targetDomain, token)
        : method === "html_file"
          ? await verifyDomainHtmlFile(targetDomain, token)
          : { success: false, error: "Unknown verification method" };

  // Audit log, regardless of outcome. This is the source of truth for the
  // dashboard Activity Log.
  await admin.from("verification_attempts").insert({
    publisher_id: publisher.id,
    verification_type: "domain",
    method,
    success: result.success,
    error_message: result.success ? null : (result.error ?? null),
    metadata: {
      domain: targetDomain,
      detail: "detail" in result ? result.detail : undefined,
    },
  });

  if (result.success) {
    await admin
      .from("publishers")
      .update({
        domain_verified: true,
        domain_verified_at: new Date().toISOString(),
        domain_verification_method: method,
      })
      .eq("id", publisher.id);
  }

  return NextResponse.json({
    verified: result.success,
    method,
    checked_at: new Date().toISOString(),
    error: result.error,
  });
});

function resolveTargetDomain(publisher: {
  platform_type: "website" | "ios_app" | "android_app" | null;
  domain: string | null;
  developer_url: string | null;
}): string | null {
  if (publisher.platform_type === "website") return publisher.domain;
  if (publisher.developer_url) {
    try {
      return new URL(publisher.developer_url).hostname;
    } catch {
      return null;
    }
  }
  return null;
}
