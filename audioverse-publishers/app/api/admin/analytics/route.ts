import { NextResponse } from "next/server";
import { apiRoute, ValidationError } from "@/lib/middleware/errors";
import { getAnalytics } from "@/lib/db/admin-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = apiRoute(async (request) => {
  const url = new URL(request.url);
  const range = parseInt(url.searchParams.get("range") ?? "30", 10);
  if (![7, 30, 90].includes(range)) {
    throw new ValidationError("range must be 7, 30, or 90");
  }
  const analytics = await getAnalytics(range);
  return NextResponse.json(analytics);
});
