import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/middleware/auth";
import { apiRoute, NotFoundError, UnauthorizedError } from "@/lib/middleware/errors";
import { isAdmin } from "@/lib/utils/admin-auth";
import { logAdminAction } from "@/lib/db/admin-queries";

export const runtime = "nodejs";

// Stub: in Phase 1, "re-check" just records intent and flips ads_txt_last_checked
// so the dashboard reflects a fresh attempt. The real ads.txt fetcher lives in
// /api/verification/ads-txt and is plumbed in for the publisher's own session.
export const POST = apiRoute(async (_req, context: { params: { id: string } }) => {
  const { user } = await requireAuth();
  if (!isAdmin(user)) throw new UnauthorizedError("Admin only");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .update({ ads_txt_last_checked: new Date().toISOString() })
    .eq("id", context.params.id)
    .select("id, publisher_id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new NotFoundError("Publisher not found");

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? "",
    publisherId: context.params.id,
    action: "rechecked",
    metadata: { publisher_id: data.publisher_id as string },
  });

  return NextResponse.json({ ok: true });
});
