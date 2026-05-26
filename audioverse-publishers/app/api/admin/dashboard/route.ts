import { NextResponse } from "next/server";
import { apiRoute } from "@/lib/middleware/errors";
import { getActionItems, getDashboardStats, getMonthOverview } from "@/lib/db/admin-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin gate is enforced in middleware.ts for /api/admin/*.
export const GET = apiRoute(async () => {
  const [stats, actionItems, thisMonth] = await Promise.all([
    getDashboardStats(),
    getActionItems(5),
    getMonthOverview(),
  ]);
  return NextResponse.json({ stats, actionItems, thisMonth });
});
