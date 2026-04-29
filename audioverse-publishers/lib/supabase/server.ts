import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createJsClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from Server Component — middleware handles refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from Server Component — middleware handles refresh.
          }
        },
      },
    },
  );
}

// Service-role client: bypasses RLS. Only use in server-side API routes for
// privileged operations (e.g., creating a publisher row before the user's
// session cookie has been set). Never expose to the browser.
//
// Untyped by design for Phase 1 — supabase-js v2's Insert-type inference
// interacts poorly with hand-written Database types. Swap in generated
// types via `npx supabase gen types typescript` once a real project is
// linked; the call sites here cast to the concrete Row types from
// lib/supabase/types.ts where they care about shape.
export function createAdminClient() {
  return createJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
