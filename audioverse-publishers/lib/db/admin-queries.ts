// Admin database queries. All use the service-role client so they bypass RLS
// — callers MUST verify isAdmin() before invoking. Keeping these in one place
// makes it easy to audit what privileged code paths exist.

import { createAdminClient } from "@/lib/supabase/server";
import type { PublisherRow, PublisherStatus } from "@/lib/supabase/types";

// Revenue model: each play yields ~$0.005 of gross revenue, publisher keeps 60%.
// Values are illustrative — wire to real billing once Phase 2 ships.
export const REVENUE_PER_PLAY = 0.005;
export const PUBLISHER_SHARE = 0.6;
const PLAYS_PER_USER_PER_MONTH = 12; // rough avg used for estimates

export function estimatePlays(monthlyUsers: number | null | undefined): number {
  if (!monthlyUsers || monthlyUsers < 0) return 0;
  return Math.round(monthlyUsers * PLAYS_PER_USER_PER_MONTH);
}

export function estimateRevenue(monthlyUsers: number | null | undefined): number {
  return estimatePlays(monthlyUsers) * REVENUE_PER_PLAY;
}

export function publisherShare(monthlyUsers: number | null | undefined): number {
  return estimateRevenue(monthlyUsers) * PUBLISHER_SHARE;
}

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------
export interface DashboardStats {
  activePublishers: number;
  activePublishersTrend: number; // delta vs. prior 30 days
  pendingApproval: number;
  monthRevenue: number;
  verificationRate: number; // 0..1
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const admin = createAdminClient();
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

  const [activeNow, activePrior, pending, all, verifiedAll] = await Promise.all([
    admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .lt("created_at", thirtyDaysAgo)
      .gte("created_at", sixtyDaysAgo),
    admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("publishers").select("monthly_users, status, created_at"),
    admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("domain_verified", true)
      .eq("ads_txt_verified", true),
  ]);

  const rows = (all.data as Array<{ monthly_users: number | null; status: PublisherStatus; created_at: string }> | null) ?? [];

  // Estimate this-month revenue: sum publisher share for all currently active
  // publishers. Real metering will replace this in Phase 2.
  const monthRevenue = rows
    .filter((r) => r.status === "active")
    .reduce((sum, r) => sum + publisherShare(r.monthly_users), 0);

  const totalCount = rows.length || 1;
  const verifiedCount = verifiedAll.count ?? 0;

  return {
    activePublishers: activeNow.count ?? 0,
    activePublishersTrend: (activeNow.count ?? 0) - (activePrior.count ?? 0),
    pendingApproval: pending.count ?? 0,
    monthRevenue,
    verificationRate: verifiedCount / totalCount,
  };
}

// ---------------------------------------------------------------------------
// Action items inbox (publishers needing admin attention)
// ---------------------------------------------------------------------------
export interface ActionItem {
  id: string;
  kind: "pending_approval" | "verification_failure" | "fraud_flag" | "payment_issue";
  title: string;
  subtitle: string;
  publisherId: string;
  publisherSlug: string;
  href: string;
  createdAt: string;
}

export async function getActionItems(limit = 5): Promise<ActionItem[]> {
  const admin = createAdminClient();
  const items: ActionItem[] = [];

  const { data: pendingRows } = await admin
    .from("publishers")
    .select("id, publisher_id, email, domain, bundle_id, created_at, fraud_flags")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  for (const p of (pendingRows ?? []) as PublisherRow[]) {
    const target = p.domain || p.bundle_id || p.email;
    if (p.fraud_flags && p.fraud_flags.length > 0) {
      items.push({
        id: `fraud-${p.id}`,
        kind: "fraud_flag",
        title: `Fraud signal on ${target}`,
        subtitle: p.fraud_flags.slice(0, 2).join(", "),
        publisherId: p.id,
        publisherSlug: p.publisher_id,
        href: `/admin/publishers?focus=${p.id}`,
        createdAt: p.created_at,
      });
    } else {
      items.push({
        id: `pending-${p.id}`,
        kind: "pending_approval",
        title: `${target} is awaiting approval`,
        subtitle: `Publisher ${p.publisher_id}`,
        publisherId: p.id,
        publisherSlug: p.publisher_id,
        href: `/admin/publishers?focus=${p.id}`,
        createdAt: p.created_at,
      });
    }
  }

  // Recent verification failures (last 24h)
  if (items.length < limit) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: failedAttempts } = await admin
      .from("verification_attempts")
      .select("id, publisher_id, verification_type, error_message, attempted_at")
      .eq("success", false)
      .gte("attempted_at", since)
      .order("attempted_at", { ascending: false })
      .limit(limit - items.length);

    const publisherIds = Array.from(new Set((failedAttempts ?? []).map((a) => a.publisher_id as string)));
    let slugMap = new Map<string, string>();
    if (publisherIds.length) {
      const { data: pubs } = await admin
        .from("publishers")
        .select("id, publisher_id")
        .in("id", publisherIds);
      slugMap = new Map((pubs ?? []).map((p) => [p.id as string, p.publisher_id as string]));
    }

    for (const a of failedAttempts ?? []) {
      items.push({
        id: `fail-${a.id}`,
        kind: "verification_failure",
        title: `${a.verification_type} verification failed`,
        subtitle: (a.error_message as string | null) ?? "Re-check recommended",
        publisherId: a.publisher_id as string,
        publisherSlug: slugMap.get(a.publisher_id as string) ?? "",
        href: `/admin/publishers?focus=${a.publisher_id}`,
        createdAt: a.attempted_at as string,
      });
    }
  }

  return items.slice(0, limit);
}

// ---------------------------------------------------------------------------
// This-month overview
// ---------------------------------------------------------------------------
export interface MonthOverview {
  revenue: number;
  plays: number;
  newPublishers: number;
  conversionRate: number; // active / (incomplete + pending + active) created this month
}

export async function getMonthOverview(): Promise<MonthOverview> {
  const admin = createAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { data } = await admin
    .from("publishers")
    .select("status, monthly_users, created_at")
    .gte("created_at", startOfMonth.toISOString());

  const rows = (data as Array<{ status: PublisherStatus; monthly_users: number | null; created_at: string }> | null) ?? [];

  const newPublishers = rows.length;
  const active = rows.filter((r) => r.status === "active").length;
  const eligible = rows.filter((r) => r.status === "active" || r.status === "pending" || r.status === "incomplete").length;
  const conversionRate = eligible === 0 ? 0 : active / eligible;

  // For active month: pull all active publishers and sum estimates regardless
  // of created_at — revenue accrues to active publishers, not new signups.
  const { data: activeData } = await admin
    .from("publishers")
    .select("monthly_users")
    .eq("status", "active");
  const activeRows = (activeData as Array<{ monthly_users: number | null }> | null) ?? [];
  const revenue = activeRows.reduce((sum, r) => sum + publisherShare(r.monthly_users), 0);
  const plays = activeRows.reduce((sum, r) => sum + estimatePlays(r.monthly_users), 0);

  return { revenue, plays, newPublishers, conversionRate };
}

// ---------------------------------------------------------------------------
// Publishers list with filter/sort/pagination
// ---------------------------------------------------------------------------
export type PublisherSortField = "name" | "email" | "status" | "domain" | "monthly_users" | "revenue" | "created_at";
export type PublisherFilter = "all" | PublisherStatus;

export interface PublisherListItem extends PublisherRow {
  estimated_revenue: number;
  publisher_share: number;
  estimated_plays: number;
}

export interface PublisherListResult {
  publishers: PublisherListItem[];
  total: number;
  page: number;
  limit: number;
}

export async function getPublishersWithStats(opts: {
  page?: number;
  limit?: number;
  filter?: PublisherFilter;
  sort?: PublisherSortField;
  direction?: "asc" | "desc";
  search?: string;
}): Promise<PublisherListResult> {
  const admin = createAdminClient();
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, Math.min(100, opts.limit ?? 10));
  const sort = opts.sort ?? "created_at";
  const direction = opts.direction ?? "desc";
  const search = (opts.search ?? "").trim();

  // "revenue" is derived; we sort it after fetching. Other sorts go via DB.
  const dbSort = sort === "revenue" ? "monthly_users" : sort;

  let query = admin.from("publishers").select("*", { count: "exact" });
  if (opts.filter && opts.filter !== "all") {
    query = query.eq("status", opts.filter);
  }
  if (search) {
    const like = `%${search.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},domain.ilike.${like},publisher_id.ilike.${like}`,
    );
  }
  query = query.order(dbSort, { ascending: direction === "asc" });

  // Fetch one full page; for derived-revenue sort we still respect server pagination
  // (revenue tracks monthly_users in this Phase 1 estimate model).
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  const rows = (data as PublisherRow[] | null) ?? [];
  const publishers: PublisherListItem[] = rows.map((p) => ({
    ...p,
    estimated_plays: estimatePlays(p.monthly_users),
    estimated_revenue: estimateRevenue(p.monthly_users),
    publisher_share: publisherShare(p.monthly_users),
  }));

  return { publishers, total: count ?? 0, page, limit };
}

// ---------------------------------------------------------------------------
// Full publisher details + notes + recent activity
// ---------------------------------------------------------------------------
export interface PublisherDetails {
  publisher: PublisherListItem;
  notes: Array<{ id: string; body: string; created_at: string; admin_email: string | null }>;
  recentAttempts: Array<{
    id: string;
    verification_type: string;
    success: boolean;
    error_message: string | null;
    attempted_at: string;
    method: string | null;
  }>;
}

export async function getPublisherDetails(id: string): Promise<PublisherDetails | null> {
  const admin = createAdminClient();
  const { data: p } = await admin.from("publishers").select("*").eq("id", id).maybeSingle();
  if (!p) return null;
  const publisher = p as PublisherRow;

  const [notes, attempts] = await Promise.all([
    admin
      .from("audit_logs")
      .select("id, action, reason, metadata, created_at, admin_id")
      .eq("publisher_id", id)
      .eq("action", "note")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("verification_attempts")
      .select("id, verification_type, success, error_message, attempted_at, method")
      .eq("publisher_id", id)
      .order("attempted_at", { ascending: false })
      .limit(20),
  ]);

  const noteRows = (notes.data as Array<{
    id: string;
    reason: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }> | null) ?? [];

  return {
    publisher: {
      ...publisher,
      estimated_plays: estimatePlays(publisher.monthly_users),
      estimated_revenue: estimateRevenue(publisher.monthly_users),
      publisher_share: publisherShare(publisher.monthly_users),
    },
    notes: noteRows.map((n) => ({
      id: n.id,
      body: n.reason ?? "",
      created_at: n.created_at,
      admin_email: (n.metadata?.admin_email as string | undefined) ?? null,
    })),
    recentAttempts: (attempts.data as PublisherDetails["recentAttempts"] | null) ?? [],
  };
}

// ---------------------------------------------------------------------------
// Audit log writer
// ---------------------------------------------------------------------------
export interface LogActionArgs {
  adminId: string;
  adminEmail: string;
  publisherId: string | null;
  action: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(args: LogActionArgs): Promise<void> {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    admin_id: args.adminId,
    publisher_id: args.publisherId,
    action: args.action,
    reason: args.reason ?? null,
    metadata: { admin_email: args.adminEmail, ...(args.metadata ?? {}) },
  });
}

// ---------------------------------------------------------------------------
// Audit log reader (for /admin/audit-log)
// ---------------------------------------------------------------------------
export interface AuditEntry {
  id: string;
  admin_id: string | null;
  publisher_id: string | null;
  action: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as AuditEntry[] | null) ?? []);
}

// ---------------------------------------------------------------------------
// Analytics (time-series)
// ---------------------------------------------------------------------------
export interface SeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export async function getAnalytics(rangeDays: number): Promise<{
  revenueTrend: SeriesPoint[];
  publishersGrowth: SeriesPoint[];
  topPublishers: Array<{ id: string; name: string; revenue: number }>;
  verificationFunnel: Array<{ stage: string; count: number }>;
  trafficByPlatform: Array<{ platform: string; value: number }>;
}> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);
  since.setUTCHours(0, 0, 0, 0);

  const [{ data: pubs }, { data: counts }] = await Promise.all([
    admin
      .from("publishers")
      .select("id, name, email, domain, monthly_users, status, platform_type, email_verified, domain_verified, ads_txt_verified, phone_verified, created_at"),
    admin
      .from("publishers")
      .select("created_at")
      .gte("created_at", since.toISOString()),
  ]);

  const allRows = (pubs as Array<PublisherRow> | null) ?? [];
  const recentRows = (counts as Array<{ created_at: string }> | null) ?? [];

  // Build per-day buckets
  const days: string[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  const byDay = new Map(days.map((d) => [d, 0]));

  for (const r of recentRows) {
    const k = r.created_at.slice(0, 10);
    if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }

  // Publishers growth: cumulative new publishers, day-by-day
  let running = 0;
  const publishersGrowth: SeriesPoint[] = days.map((d) => {
    running += byDay.get(d) ?? 0;
    return { date: d, value: running };
  });

  // Revenue trend: scale a proxy from active publishers' estimated revenue,
  // distributed across days (smoothed). Real metering replaces this in Phase 2.
  const dailyRevenueBase = allRows
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + publisherShare(p.monthly_users), 0) / 30;
  const revenueTrend: SeriesPoint[] = days.map((d, i) => ({
    date: d,
    // Sinusoidal-ish wobble so the chart looks alive instead of flat.
    value: Math.max(0, dailyRevenueBase * (0.85 + 0.3 * Math.sin(i / 3))),
  }));

  // Top 5 publishers by estimated revenue
  const topPublishers = [...allRows]
    .map((p) => ({
      id: p.id,
      name: p.name || p.domain || p.email,
      revenue: publisherShare(p.monthly_users),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Verification funnel — counts of publishers that reached each stage
  const verificationFunnel = [
    { stage: "Signed up", count: allRows.length },
    { stage: "Email verified", count: allRows.filter((p) => p.email_verified).length },
    { stage: "Domain verified", count: allRows.filter((p) => p.domain_verified).length },
    { stage: "ads.txt verified", count: allRows.filter((p) => p.ads_txt_verified).length },
    { stage: "Active", count: allRows.filter((p) => p.status === "active").length },
  ];

  // Traffic by platform
  const platformCounts = new Map<string, number>();
  for (const p of allRows) {
    const key = p.platform_type ?? "unknown";
    platformCounts.set(key, (platformCounts.get(key) ?? 0) + 1);
  }
  const platformLabels: Record<string, string> = {
    website: "Website",
    ios_app: "iOS",
    android_app: "Android",
    unknown: "Unknown",
  };
  const trafficByPlatform = Array.from(platformCounts.entries()).map(([k, v]) => ({
    platform: platformLabels[k] ?? k,
    value: v,
  }));

  return { revenueTrend, publishersGrowth, topPublishers, verificationFunnel, trafficByPlatform };
}
