import type { Metadata } from "next";
import { Activity, CheckCircle2, Clock, DollarSign, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { ActionItems } from "@/components/admin/ActionItems";
import { QuickActions } from "@/components/admin/QuickActions";
import { RevenueCard } from "@/components/admin/RevenueCard";
import {
  getActionItems,
  getDashboardStats,
  getMonthOverview,
} from "@/lib/db/admin-queries";

export const metadata: Metadata = { title: "Command Center — AudioVerse Admin" };
export const dynamic = "force-dynamic";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default async function AdminHomePage() {
  const [stats, actionItems, monthly] = await Promise.all([
    getDashboardStats(),
    getActionItems(5),
    getMonthOverview(),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          AudioVerse Admin Panel
        </h1>
        <p className="text-sm text-white/50">
          Command center for publishers, verification, and revenue.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={Users}
            label="Active publishers"
            value={stats.activePublishers}
            trend={stats.activePublishersTrend}
            color="primary"
          />
          <StatsCard
            icon={Clock}
            label="Pending approval"
            value={stats.pendingApproval}
            color={stats.pendingApproval > 0 ? "danger" : "success"}
            hint={stats.pendingApproval > 0 ? "Needs review" : "All clear"}
          />
          <StatsCard
            icon={DollarSign}
            label="This month revenue"
            value={formatCurrency(stats.monthRevenue)}
            color="info"
            hint="Estimated"
          />
          <StatsCard
            icon={ShieldCheck}
            label="Verification rate"
            value={formatPercent(stats.verificationRate)}
            color="success"
            hint="Domain + ads.txt"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Action items
            </h2>
            <span className="text-xs text-white/40">{actionItems.length} pending</span>
          </div>
          <ActionItems items={actionItems} />
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Quick commands
          </h2>
          <div className="grid gap-3">
            <QuickActions />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          This month overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={DollarSign} label="Revenue" value={formatCurrency(monthly.revenue)} color="primary" />
          <StatsCard icon={Activity} label="Plays" value={formatCompact(monthly.plays)} color="info" />
          <StatsCard
            icon={TrendingUp}
            label="New publishers"
            value={monthly.newPublishers}
            color="success"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Conversion rate"
            value={formatPercent(monthly.conversionRate)}
            color="info"
            hint="Active / total this month"
          />
        </div>
      </section>

      <section>
        <RevenueCard
          revenue={monthly.revenue / 0.6}
          plays={monthly.plays}
          share={monthly.revenue}
        />
      </section>
    </div>
  );
}
