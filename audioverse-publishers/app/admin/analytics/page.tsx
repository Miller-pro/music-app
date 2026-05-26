"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  PublishersGrowthChart,
  RevenueTrendChart,
  TopPublishersChart,
  TrafficByPlatformChart,
  VerificationFunnelChart,
} from "@/components/admin/AnalyticsCharts";
import type { SeriesPoint } from "@/lib/db/admin-queries";

type Range = 7 | 30 | 90;

interface AnalyticsPayload {
  revenueTrend: SeriesPoint[];
  publishersGrowth: SeriesPoint[];
  topPublishers: Array<{ id: string; name: string; revenue: number }>;
  verificationFunnel: Array<{ stage: string; count: number }>;
  trafficByPlatform: Array<{ platform: string; value: number }>;
}

const RANGE_OPTIONS: Array<{ value: Range; label: string }> = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load analytics");
      setData((await res.json()) as AnalyticsPayload);
    } catch {
      toast.error("Couldn't load analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export`, { cache: "no-store" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audioverse-publishers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Analytics</h1>
          <p className="text-sm text-white/50">Publisher growth, revenue trends, and verification funnel.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-white/10 bg-bg-elevated">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  range === opt.value
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="av-btn-secondary inline-flex items-center gap-2"
            onClick={exportCsv}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        </div>
      </header>

      {loading && !data ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-white/5 bg-bg-elevated">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-white/50" />
          <span className="text-sm text-white/50">Loading analytics…</span>
        </div>
      ) : data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueTrendChart data={data.revenueTrend} />
          <PublishersGrowthChart data={data.publishersGrowth} />
          <TopPublishersChart data={data.topPublishers} />
          <VerificationFunnelChart data={data.verificationFunnel} />
          <div className="lg:col-span-2">
            <TrafficByPlatformChart data={data.trafficByPlatform} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
