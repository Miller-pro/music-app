import { NextResponse } from "next/server";
import { apiRoute, ValidationError } from "@/lib/middleware/errors";
import {
  getPublishersWithStats,
  type PublisherFilter,
  type PublisherSortField,
} from "@/lib/db/admin-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SORTS: PublisherSortField[] = [
  "name",
  "email",
  "status",
  "domain",
  "monthly_users",
  "revenue",
  "created_at",
];
const VALID_FILTERS: PublisherFilter[] = [
  "all",
  "incomplete",
  "pending",
  "active",
  "suspended",
  "rejected",
];

export const GET = apiRoute(async (request) => {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10", 10) || 10));
  const sortParam = url.searchParams.get("sort") ?? "created_at";
  const directionParam = url.searchParams.get("direction") ?? "desc";
  const filterParam = url.searchParams.get("filter") ?? "all";
  const search = url.searchParams.get("search") ?? "";

  const sort = VALID_SORTS.includes(sortParam as PublisherSortField)
    ? (sortParam as PublisherSortField)
    : "created_at";
  const filter = VALID_FILTERS.includes(filterParam as PublisherFilter)
    ? (filterParam as PublisherFilter)
    : "all";
  if (directionParam !== "asc" && directionParam !== "desc") {
    throw new ValidationError("direction must be asc or desc");
  }

  const result = await getPublishersWithStats({
    page,
    limit,
    sort,
    direction: directionParam,
    filter,
    search,
  });
  return NextResponse.json(result);
});
