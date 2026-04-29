"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema, loginSchema } from "@/lib/validations/auth";
import { verifyRecaptchaToken } from "@/lib/utils/recaptcha";
import { getRequestMeta } from "@/lib/utils/request-meta";

export type AuthActionResult =
  | { ok: true; next: string }
  | { ok: false; error: string; field?: "email" | "password" | "termsAccepted" | "form" };

// ---------------------------------------------------------------------------
// Sign up (email + password)
// ---------------------------------------------------------------------------
export async function signUp(formData: {
  email: string;
  password: string;
  termsAccepted: boolean;
  recaptchaToken?: string;
}): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path[0] as AuthActionResult extends { field?: infer F } ? F : never;
    return { ok: false, error: issue.message, field };
  }

  const { email, password, recaptchaToken } = parsed.data;
  const { ip, userAgent } = getRequestMeta();

  // Fraud gate. Low scores don't block signup in Phase 1 — they're stored
  // on the publisher row so an admin can triage later. Adjust threshold
  // once we have real traffic data.
  const recaptcha = await verifyRecaptchaToken(recaptchaToken, ip);

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        signup_ip: ip,
        signup_user_agent: userAgent,
        recaptcha_score: recaptcha.score,
      },
    },
  });

  if (error) return { ok: false, error: humanizeAuthError(error.message), field: "form" };
  if (!data.user) return { ok: false, error: "Unexpected signup response", field: "form" };

  // Publisher row is created later in /onboarding step 1 once the user
  // picks a platform — we have nothing meaningful to insert yet.
  return { ok: true, next: "/onboarding" };
}

// ---------------------------------------------------------------------------
// Sign in (email + password)
// ---------------------------------------------------------------------------
export async function signIn(formData: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0] as "email" | "password" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { ok: false, error: humanizeAuthError(error.message), field: "form" };

  return { ok: true, next: "/dashboard" };
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
export async function signInWithGoogle(nextPath = "/onboarding"): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  if (data?.url) redirect(data.url);
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

// ---------------------------------------------------------------------------
// Error message humanization
// Supabase returns raw messages like "User already registered" — rewrite the
// common ones so they don't leak internals or confuse users.
// ---------------------------------------------------------------------------
function humanizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (m.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email before logging in. Check your inbox.";
  }
  if (m.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("weak password") || m.includes("password")) {
    return "Password doesn't meet requirements. Try a longer or more varied password.";
  }
  return "Something went wrong. Please try again.";
}
