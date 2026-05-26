import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  color?: "primary" | "danger" | "success" | "info";
  hint?: string;
}

const COLORS: Record<NonNullable<StatsCardProps["color"]>, { ring: string; bg: string; text: string }> = {
  primary: { ring: "ring-primary/30", bg: "bg-primary/10", text: "text-primary" },
  danger: { ring: "ring-status-suspended/30", bg: "bg-status-suspended/10", text: "text-status-suspended" },
  success: { ring: "ring-status-active/30", bg: "bg-status-active/10", text: "text-status-active" },
  info: { ring: "ring-[#4ECDC4]/30", bg: "bg-[#4ECDC4]/10", text: "text-[#4ECDC4]" },
};

export function StatsCard({ icon: Icon, label, value, trend, color = "primary", hint }: StatsCardProps) {
  const c = COLORS[color];
  const hasTrend = typeof trend === "number" && trend !== 0;
  const trendUp = (trend ?? 0) > 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-bg-elevated p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
          <Icon className="h-5 w-5" />
        </span>
        {hasTrend ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trendUp
                ? "bg-status-active/10 text-status-active"
                : "bg-status-suspended/10 text-status-suspended"
            }`}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendUp ? "+" : ""}
            {trend}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
      </div>
    </div>
  );
}
