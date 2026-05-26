import { DollarSign, PlayCircle, Wallet } from "lucide-react";

interface RevenueCardProps {
  revenue: number;
  plays: number;
  share: number;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function RevenueCard({ revenue, plays, share }: RevenueCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-bg-elevated p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Estimated revenue</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Row icon={PlayCircle} label="Plays" value={formatCompact(plays)} accent="text-[#4ECDC4] bg-[#4ECDC4]/10" />
        <Row icon={DollarSign} label="Gross revenue" value={formatCurrency(revenue)} accent="text-primary bg-primary/10" />
        <Row icon={Wallet} label="Publisher share (60%)" value={formatCurrency(share)} accent="text-status-active bg-status-active/10" />
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-base font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
