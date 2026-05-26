import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/middleware/auth";
import { apiRoute, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/middleware/errors";
import { isAdmin } from "@/lib/utils/admin-auth";
import { logAdminAction } from "@/lib/db/admin-queries";

export const runtime = "nodejs";

export const POST = apiRoute(async (request, context: { params: { id: string } }) => {
  const { user } = await requireAuth();
  if (!isAdmin(user)) throw new UnauthorizedError("Admin only");

  const body = (await request.json().catch(() => null)) as { reason?: string } | null;
  const reason = body?.reason?.trim();
  if (!reason) throw new ValidationError("Rejection reason is required", "reason");
  if (reason.length > 1000) throw new ValidationError("Reason is too long");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("publishers")
    .update({ status: "rejected" })
    .eq("id", context.params.id)
    .select("id, publisher_id, status")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Publisher not found");

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? "",
    publisherId: context.params.id,
    action: "rejected",
    reason,
    metadata: { publisher_id: data.publisher_id as string },
  });

  return NextResponse.json({ ok: true, publisher: data });
});
