import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/middleware/auth";
import { apiRoute, NotFoundError, UnauthorizedError } from "@/lib/middleware/errors";
import { isAdmin } from "@/lib/utils/admin-auth";
import { logAdminAction } from "@/lib/db/admin-queries";

export const runtime = "nodejs";

export const POST = apiRoute(async (_request, context: { params: { id: string } }) => {
  const { user } = await requireAuth();
  if (!isAdmin(user)) throw new UnauthorizedError("Admin only");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .update({ status: "active" })
    .eq("id", context.params.id)
    .select("id, publisher_id, status")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Publisher not found");

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? "",
    publisherId: context.params.id,
    action: "approved",
    metadata: { publisher_id: data.publisher_id as string },
  });

  return NextResponse.json({ ok: true, publisher: data });
});
