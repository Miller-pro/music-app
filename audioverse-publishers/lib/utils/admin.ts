// Pure admin-identity logic — the single source of truth for "is this email
// the configured admin." Kept free of server-only imports (next/headers,
// next/navigation, supabase server client) so it is safe to import from the
// edge middleware as well as Server Components and Route Handlers.
//
// The check is env-driven (ADMIN_EMAIL) so we can rotate the address without a
// code deploy. The hard-coded fallback is the one canonical admin address.

import type { User } from "@supabase/supabase-js";

const DEFAULT_ADMIN = "dean@m-innovation-group.com";

export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN).toLowerCase();
}

export function isAdmin(
  user: Pick<User, "email"> | { email?: string | null } | null | undefined,
): boolean {
  const email = user?.email?.toLowerCase();
  if (!email) return false;
  return email === adminEmail();
}
