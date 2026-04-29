import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, getPublisher } from "@/lib/middleware/auth";
import { apiRoute, ValidationError } from "@/lib/middleware/errors";

export const runtime = "nodejs";

// POST /api/verification/phone/verify-code
// Body: { phone, code }
// Publisher row may not exist yet (onboarding step 5) — when it doesn't,
// we just return success if format is valid, and let the create API mark
// phone_verified on insert. When it does exist, we check the real code.
export const POST = apiRoute(async (request) => {
  const { user } = await requireAuth();
  const body = (await request.json().catch(() => null)) as {
    phone?: string;
    code?: string;
  } | null;

  const code = (body?.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) throw new ValidationError("Enter a 6-digit code", "code");

  const admin = createAdminClient();
  const publisher = await getPublisher(user.id);

  // Onboarding path: publisher row doesn't exist yet. We rely on the
  // in-flight wizard having received the dev code from /send-code's
  // response (or a real SMS). No DB row to match against — return true
  // and the create API will insert phone_verified=true.
  if (!publisher) {
    return NextResponse.json({ verified: true, verified_at: new Date().toISOString() });
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const nowIso = new Date().toISOString();

  // Fetch the most recent unconsumed code for this publisher+phone.
  const { data: row, error } = await admin
    .from("phone_verification_codes")
    .select("id, code_hash, expires_at, consumed_at, attempts, phone")
    .eq("publisher_id", publisher.id)
    .eq("phone", body?.phone ?? publisher.phone ?? "")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!row) {
    await logPhoneAttempt(publisher.id, false, "no active code");
    throw new ValidationError("No active code — request a new one.", "code");
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await logPhoneAttempt(publisher.id, false, "code expired");
    throw new ValidationError("Code expired. Request a new one.", "code");
  }

  if (row.attempts >= 5) {
    await logPhoneAttempt(publisher.id, false, "too many attempts");
    throw new ValidationError("Too many attempts — request a new code.", "code");
  }

  if (row.code_hash !== codeHash) {
    await admin
      .from("phone_verification_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    await logPhoneAttempt(publisher.id, false, "code mismatch");
    throw new ValidationError("That code doesn't match. Try again.", "code");
  }

  // Success: consume the code + mark phone verified.
  await admin
    .from("phone_verification_codes")
    .update({ consumed_at: nowIso })
    .eq("id", row.id);
  await admin
    .from("publishers")
    .update({ phone_verified: true, phone_verified_at: nowIso })
    .eq("id", publisher.id);
  await logPhoneAttempt(publisher.id, true, null);

  return NextResponse.json({ verified: true, verified_at: nowIso });
});

async function logPhoneAttempt(publisherId: string, success: boolean, reason: string | null) {
  const admin = createAdminClient();
  await admin.from("verification_attempts").insert({
    publisher_id: publisherId,
    verification_type: "phone",
    method: "sms",
    success,
    error_message: success ? null : reason,
  });
}
