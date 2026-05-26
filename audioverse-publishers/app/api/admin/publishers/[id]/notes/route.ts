import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { apiRoute, UnauthorizedError, ValidationError } from "@/lib/middleware/errors";
import { isAdmin } from "@/lib/utils/admin-auth";
import { logAdminAction } from "@/lib/db/admin-queries";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export const POST = apiRoute(async (request, context: { params: { id: string } }) => {
  const { user } = await requireAuth();
  if (!isAdmin(user)) throw new UnauthorizedError("Admin only");

  const body = (await request.json().catch(() => null)) as { body?: string } | null;
  const text = body?.body?.trim();
  if (!text) throw new ValidationError("Note body required", "body");
  if (text.length > 5000) throw new ValidationError("Note is too long");

  await logAdminAction({
    adminId: user.id,
    adminEmail: user.email ?? "",
    publisherId: context.params.id,
    action: "note",
    reason: text,
  });

  return NextResponse.json({ ok: true });
});

export const GET = apiRoute(async (_req, context: { params: { id: string } }) => {
  const { user } = await requireAuth();
  if (!isAdmin(user)) throw new UnauthorizedError("Admin only");

  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("id, reason, created_at, metadata")
    .eq("publisher_id", context.params.id)
    .eq("action", "note")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    notes: (data ?? []).map((n) => ({
      id: n.id,
      body: n.reason ?? "",
      created_at: n.created_at,
      admin_email:
        ((n.metadata as Record<string, unknown> | null)?.admin_email as string | undefined) ?? null,
    })),
  });
});
