"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { SeriesPoint } from "@/lib/db/admin-queries";

const PRIMARY = "#FF6B35";
const SECONDARY = "#4ECDC4";
const TERTIARY = "#A78BFA";
const QUATERNARY = "#FBBF24";
const PIE_COLORS = [PRIMARY, SECONDARY, TERTIARY, QUATERNARY];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#22223D",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 12,
  },
  labelStyle: { color: "rgba(255,255,255,0.6)" },
  itemStyle: { color: "#fff" },
};

function formatDateLabel(s: string): string {
  const d = new Date(s);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function RevenueTrendChart({ data }: { data: SeriesPoint[] }) {
  const chartData = useMemo(() => data.map((p) => ({ ...p, label: formatDateLabel(p.date) })), [data]);
  return (
    <ChartShell title="Revenue trend" subtitle="Daily estimated publisher share">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={PRIMARY}
            strokeWidth={2}
            dot={{ fill: PRIMARY, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PublishersGrowthChart({ data }: { data: SeriesPoint[] }) {
  const chartData = useMemo(() => data.map((p) => ({ ...p, label: formatDateLabel(p.date) })), [data]);
  return (
    <ChartShell title="Publishers growth" subtitle="Cumulative signups">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [String(value), "Publishers"]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={SECONDARY}
            strokeWidth={2}
            dot={{ fill: SECONDARY, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function TopPublishersChart({
  data,
}: {
  data: Array<{ id: string; name: string; revenue: number }>;
}) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        // Shorten labels so they fit on the y-axis
        shortName: d.name.length > 22 ? `${d.name.slice(0, 22)}…` : d.name,
      })),
    [data],
  );
  return (
    <ChartShell title="Top 5 publishers by revenue" subtitle="Estimated monthly share">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={formatCurrency} />
          <YAxis dataKey="shortName" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={130} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
          />
          <Bar dataKey="revenue" fill={PRIMARY} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function VerificationFunnelChart({
  data,
}: {
  data: Array<{ stage: string; count: number }>;
}) {
  const top = data[0]?.count || 1;
  return (
    <ChartShell title="Verification funnel" subtitle="Conversion through verification stages">
      <div className="space-y-2 pt-1">
        {data.map((d, i) => {
          const pct = top === 0 ? 0 : (d.count / top) * 100;
          const conv = i === 0 ? null : Math.round((d.count / Math.max(1, data[i - 1].count)) * 100);
          return (
            <div key={d.stage}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">{d.stage}</span>
                <span className="text-white/50">
                  {d.count.toLocaleString()}
                  {conv !== null ? <span className="ml-1.5 text-white/30">({conv}%)</span> : null}
                </span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#4ECDC4] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function TrafficByPlatformChart({
  data,
}: {
  data: Array<{ platform: string; value: number }>;
}) {
  return (
    <ChartShell title="Traffic by platform" subtitle="Distribution of publishers">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="platform"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={3}
            label={(entry: { name?: string; value?: number }) =>
              `${entry.name ?? ""} (${entry.value ?? 0})`
            }
            labelLine={false}
            stroke="rgba(0,0,0,0)"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-bg-elevated p-4 sm:p-5">
      <header className="mb-3">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/40">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}
