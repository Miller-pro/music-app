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

  const body = (await request.json().catch(() => null)) as { reason?: string; flag?: string } | null;
  const reason = body?.reason?.trim();
  const flag = (body?.flag ?? "admin_flagged").trim();
  if (!reason) throw new ValidationError("Reason is required", "reason");

  const admin = createAdminClient();
  const { data: current, error: readErr } = await admin
    .from("publishers")
    .select("id, publisher_id, fraud_flags")
    .eq("id", context.params.id)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!current) throw new NotFoundError("Publisher not found");

  const existing = ((current.fraud_flags as string[] | null) ?? []) as string[];
  const next = Array.from(new Set([...existing, flag]));

  const { error: updErr } = await admin
    .from("publishers")
    .update({ fraud_flags: next, status: "suspended" })
    .eq("id", context.params.id);
  if (updErr) throw updErr;

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? "",
    publisherId: context.params.id,
    action: "flagged",
    reason,
    metadata: { publisher_id: current.publisher_id as string, flag },
  });

  return NextResponse.json({ ok: true });
});
