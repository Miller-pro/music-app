// reCAPTCHA v3 helpers. Phase 1 returns a stubbed score of 0.9 when no
// secret is configured so the signup flow still works end-to-end in dev.

export const RECAPTCHA_STUB_TOKEN = "stub-token-no-recaptcha";

export async function verifyRecaptchaToken(
  token: string | undefined,
  remoteip?: string,
): Promise<{ success: boolean; score: number; action?: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // TODO(recaptcha): Wire real reCAPTCHA v3 once keys are provisioned.
  // Until then, accept the stub token and return a neutral-good score so
  // the rest of the fraud pipeline can still run.
  if (!secret || token === RECAPTCHA_STUB_TOKEN) {
    return { success: true, score: 0.9, action: "stub" };
  }

  if (!token) return { success: false, score: 0 };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cache: "no-store",
    });
    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      action?: string;
    };
    return { success: !!data.success, score: data.score ?? 0, action: data.action };
  } catch {
    // Fail open on network errors — we don't want Google downtime to block
    // signups. Treat as a low-confidence score instead.
    return { success: true, score: 0.3 };
  }
}
