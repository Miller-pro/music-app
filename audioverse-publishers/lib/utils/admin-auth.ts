// Admin authorization helpers. Single source of truth for "is this user an
// admin." The check is env-driven (ADMIN_EMAIL) so we can rotate the address
// without a code deploy.

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_ADMIN = "dean@m-innovation-group.com";

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN).toLowerCase();
}

export function isAdmin(user: Pick<User, "email"> | { email?: string | null } | null | undefined): boolean {
  const email = user?.email?.toLowerCase();
  if (!email) return false;
  return email === adminEmail();
}

/**
 * Gate a page or layout on admin status. Redirects unauthenticated users to
 * /auth/login and non-admin users to /dashboard. Returns the user when allowed.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}
