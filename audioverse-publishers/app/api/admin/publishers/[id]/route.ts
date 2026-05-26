import { NextResponse } from "next/server";
import { apiRoute, NotFoundError } from "@/lib/middleware/errors";
import { getPublisherDetails } from "@/lib/db/admin-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = apiRoute(async (_request, context: { params: { id: string } }) => {
  const details = await getPublisherDetails(context.params.id);
  if (!details) throw new NotFoundError("Publisher not found");
  return NextResponse.json(details);
});
