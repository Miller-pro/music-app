import { createAdminClient } from "@/lib/supabase/server";
import type { FraudCheckResult } from "@/types/api";
import type { PublisherRow } from "@/lib/supabase/types";

// Re-export from recaptcha helper for convenience at the call site.
export { verifyRecaptchaToken as getReCaptchaScore } from "./recaptcha";

// Domains that clearly aren't production. Extend as we see patterns.
const BAD_DOMAINS = new Set([
  "localhost",
  "127.0.0.1",
  "example.com",
  "example.org",
  "test.com",
  "test.test",
]);

// ---------------------------------------------------------------------------
// IP signup velocity check.
// Flags if >5 publishers have been created from this IP in 24h. We don't
// hard-block — status stays `incomplete` but the fraud flag goes on the
// row so an admin sees it during review.
// ---------------------------------------------------------------------------
export async function checkSignupIP(ip: string): Promise<FraudCheckResult> {
  if (!ip || ip === "127.0.0.1") return { suspicious: false, flags: [] };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("publishers")
    .select("id", { count: "exact", head: true })
    .eq("signup_ip", ip)
    .gte("created_at", since);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[fraud] IP check failed, continuing:", error.message);
    return { suspicious: false, flags: [] };
  }
  if ((count ?? 0) >= 5) {
    return {
      suspicious: true,
      flags: ["ip_velocity"],
      reasons: [`${count} signups from IP ${ip} in last 24h`],
    };
  }
  return { suspicious: false, flags: [] };
}

// ---------------------------------------------------------------------------
// Static pattern checks on the publisher payload.
// No DB hits — this runs before insert and on every fraud re-review.
// ---------------------------------------------------------------------------
export function detectSuspiciousPatterns(
  publisher: Partial<PublisherRow> & {
    domain?: string | null;
    bundle_id?: string | null;
    monthly_users?: number | null;
  },
): FraudCheckResult {
  const flags: string[] = [];
  const reasons: string[] = [];

  const domain = publisher.domain?.toLowerCase();
  if (domain && BAD_DOMAINS.has(domain)) {
    flags.push("blocked_domain");
    reasons.push(`Domain "${domain}" is a placeholder/test value`);
  }

  if (domain && /^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    flags.push("ip_as_domain");
    reasons.push("Domain is a raw IP address");
  }

  // "Unrealistic traffic" flag: >500k users for a brand-new account. Doesn't
  // block — big publishers do exist — but routes to manual review.
  if ((publisher.monthly_users ?? 0) > 500_000) {
    flags.push("high_traffic_claim");
    reasons.push(`Claims ${publisher.monthly_users?.toLocaleString()} monthly users`);
  }

  // Classic scam signature: generic @gmail.com w/ company field empty and
  // phone from a different country than primary_country. Skipped for
  // Phase 1 — false positives are too common — revisit with real data.

  return { suspicious: flags.length > 0, flags, reasons };
}

// ---------------------------------------------------------------------------
// Dup check: is this email/phone already attached to a different publisher?
// Called at create time. Dup email is usually benign (user made a 2nd
// account) but flag it for review so we can merge or reject.
// ---------------------------------------------------------------------------
export async function checkDuplicates(args: {
  email?: string;
  phone?: string;
  excludeUserId?: string;
}): Promise<FraudCheckResult> {
  const flags: string[] = [];
  const reasons: string[] = [];
  const admin = createAdminClient();

  if (args.email) {
    const { count } = await admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .ilike("email", args.email);
    if ((count ?? 0) > 0 && args.excludeUserId) {
      flags.push("duplicate_email");
      reasons.push("Email already used by another publisher");
    }
  }

  if (args.phone) {
    const { count } = await admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("phone", args.phone);
    if ((count ?? 0) > 0) {
      flags.push("duplicate_phone");
      reasons.push("Phone already verified on another publisher");
    }
  }

  return { suspicious: flags.length > 0, flags, reasons };
}

// ---------------------------------------------------------------------------
// Manual-review gate. Any flag, low reCAPTCHA, or big traffic sends to queue.
// ---------------------------------------------------------------------------
export function shouldRequireManualReview(
  publisher: Partial<PublisherRow> & { recaptcha_score?: number | null },
): boolean {
  if ((publisher.fraud_flags?.length ?? 0) > 0) return true;
  if ((publisher.monthly_users ?? 0) > 100_000) return true;
  const score = publisher.recaptcha_score;
  if (typeof score === "number" && score < 0.5) return true;
  return false;
}
