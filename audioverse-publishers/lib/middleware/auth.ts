import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NotFoundError, UnauthorizedError } from "./errors";
import type { PublisherRow } from "@/lib/supabase/types";

/** Throws UnauthorizedError if the request has no valid session. */
export async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  return { user, supabase };
}

/** Fetch the caller's publisher row. Throws NotFoundError if missing. */
export async function requirePublisher(userId: string): Promise<PublisherRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("No publisher account for this user");
  return data as PublisherRow;
}

/** Same, but returns null if missing (no throw). */
export async function getPublisher(userId: string): Promise<PublisherRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("publishers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as PublisherRow | null) ?? null;
}
