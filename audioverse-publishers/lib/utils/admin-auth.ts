// Admin authorization helpers for server contexts. The pure email-matching
// logic (adminEmail/isAdmin) lives in ./admin so it can also be imported from
// the edge middleware; this module re-exports it and adds requireAdmin, which
// needs server-only APIs (next/navigation + the supabase server client).

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "./admin";

export { adminEmail, isAdmin } from "./admin";

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
