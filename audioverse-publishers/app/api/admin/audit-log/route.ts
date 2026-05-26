import { NextResponse } from "next/server";
import { apiRoute } from "@/lib/middleware/errors";
import { getAuditLog } from "@/lib/db/admin-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = apiRoute(async (request) => {
  const url = new URL(request.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") ?? "100", 10) || 100));
  const entries = await getAuditLog(limit);
  return NextResponse.json({ entries });
});
