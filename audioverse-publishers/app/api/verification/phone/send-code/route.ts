import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, getPublisher } from "@/lib/middleware/auth";
import { apiRoute, RateLimitError, ValidationError } from "@/lib/middleware/errors";
import { phoneField } from "@/lib/validations/onboarding";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

const CODE_EXPIRY_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;
const WINDOW_MS = 5 * 60_000;

// POST /api/verification/phone/send-code
// Body: { phone }
// Publisher may not exist yet (onboarding step 5 runs before create), so
// we key the rate limiter on phone + user id.
export const POST = apiRoute(async (request) => {
  const { user } = await requireAuth();
  const body = (await request.json().catch(() => null)) as { phone?: string } | null;
  const parsed = phoneField.safeParse(body?.phone ?? "");
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid phone", "phone");
  }
  const phone = parsed.data;

  // In-memory RL keyed on (user, phone). Authoritative DB check below.
  const rlKey = `sms:${user.id}:${phone}`;
  const rl = checkRateLimit(rlKey, MAX_PER_WINDOW, WINDOW_MS);
  if (!rl.allowed) throw new RateLimitError(rl.retryAfterMs ?? WINDOW_MS);

  const code = (crypto.randomInt(0, 1_000_000)).toString().padStart(6, "0");
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  const admin = createAdminClient();
  const publisher = await getPublisher(user.id);

  // If the publisher row exists, enforce the DB-backed 3-in-5-min rule too.
  // This catches attackers who wipe in-memory state via cold starts.
  if (publisher) {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count } = await admin
      .from("phone_verification_codes")
      .select("id", { count: "exact", head: true })
      .eq("publisher_id", publisher.id)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_PER_WINDOW) {
      throw new RateLimitError(WINDOW_MS);
    }

    await admin.from("phone_verification_codes").insert({
      publisher_id: publisher.id,
      code_hash: codeHash,
      phone,
      expires_at: new Date(Date.now() + CODE_EXPIRY_MS).toISOString(),
    });
  }

  // TODO(twilio): Replace console.log with a real Twilio Messages.create()
  // call once TWILIO_ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER are set.
  if (!process.env.TWILIO_ACCOUNT_SID) {
    // eslint-disable-next-line no-console
    console.log(`[phone/send-code DEV] ${phone} → code ${code}`);
  } else {
    // eslint-disable-next-line no-console
    console.log("[phone/send-code] Twilio credentials present but integration pending");
  }

  const response: Record<string, unknown> = { sent: true };
  // Only expose dev_code when Twilio is unconfigured (dev mode) — prod
  // must never see this in the body.
  if (!process.env.TWILIO_ACCOUNT_SID) response.dev_code = code;

  return NextResponse.json(response);
});
