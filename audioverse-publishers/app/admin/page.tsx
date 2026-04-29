import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/middleware/auth";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { relativeTime } from "@/lib/utils/relative-time";
import type { PublisherRow, PublisherStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Admin — AudioVerse Publishers" };

const STATUS_OPTIONS: (PublisherStatus | "all")[] = [
  "all",
  "incomplete",
  "pending",
  "active",
  "suspended",
  "rejected",
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  const admin = createAdminClient();

  const statusFilter = (STATUS_OPTIONS as string[]).includes(searchParams.status ?? "")
    ? (searchParams.status as PublisherStatus | "all")
    : "all";
  const q = (searchParams.q ?? "").trim();

  let query = admin
    .from("publishers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (q) query = query.or(`email.ilike.%${q}%,domain.ilike.%${q}%,bundle_id.ilike.%${q}%`);

  const { data } = await query;
  const publishers = (data ?? []) as PublisherRow[];

  // Quick KPIs — separate head-only counts so we don't pull full rows.
  const [total, activeThisWeek, pendingCount, failedCount] = await Promise.all([
    admin.from("publishers").select("id", { count: "exact", head: true }),
    admin
      .from("publishers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    admin.from("publishers").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin
      .from("verification_attempts")
      .select("id", { count: "exact", head: true })
      .eq("success", false)
      .gte("attempted_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Admin</h1>
          <p className="text-sm text-white/50">{user.email}</p>
        </div>
        <Link href="/dashboard" className="av-btn-secondary">
          Back to dashboard
        </Link>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-4">
        <Kpi label="Total publishers" value={total.count ?? 0} />
        <Kpi label="Active (last 7d)" value={activeThisWeek.count ?? 0} />
        <Kpi label="Pending review" value={pendingCount.count ?? 0} />
        <Kpi label="Failed checks (24h)" value={failedCount.count ?? 0} />
      </section>

      <section className="av-card">
        <form className="mb-4 flex flex-wrap items-end gap-3" action="/admin">
          <div className="flex-1 min-w-[200px]">
            <label className="av-label" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="email, domain, or bundle id"
              className="av-input"
            />
          </div>
          <div>
            <label className="av-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusFilter}
              className="av-input"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="av-btn-primary">
            Apply
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Publisher ID</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2 pr-3">Users</th>
                <th className="py-2 pr-3">Flags</th>
                <th className="py-2 pr-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {publishers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-white/50">
                    No publishers match.
                  </td>
                </tr>
              ) : (
                publishers.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-primary">{p.publisher_id}</td>
                    <td className="py-2.5 pr-3 text-white/80">{p.email}</td>
                    <td className="py-2.5 pr-3 font-mono text-white/70">
                      {p.domain || p.bundle_id || "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-white/70">
                      {p.monthly_users?.toLocaleString() ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      {p.fraud_flags?.length ? (
                        <span className="rounded bg-status-pending/10 px-1.5 py-0.5 text-xs text-status-pending">
                          {p.fraud_flags.length}
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-white/50">{relativeTime(p.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-bg-elevated p-4">
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
