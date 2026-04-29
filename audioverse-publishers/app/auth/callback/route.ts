import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth & magic-link callback. Supabase redirects the browser here with a
// `code` query param; we exchange it for a session cookie and bounce to
// the originally requested page.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";
  const errorDescription = url.searchParams.get("error_description");

  const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent("Missing authorization code")}`,
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error.message)}`,
    );
  }

  // Only allow relative paths as `next` to prevent open-redirect abuse.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
