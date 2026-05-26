import Link from "next/link";
import { AlertTriangle, ChevronRight, CreditCard, ShieldAlert, UserCheck } from "lucide-react";
import { relativeTime } from "@/lib/utils/relative-time";
import type { ActionItem } from "@/lib/db/admin-queries";

const ICONS = {
  pending_approval: UserCheck,
  verification_failure: AlertTriangle,
  fraud_flag: ShieldAlert,
  payment_issue: CreditCard,
} as const;

const ACCENTS: Record<ActionItem["kind"], string> = {
  pending_approval: "text-[#4ECDC4] bg-[#4ECDC4]/10",
  verification_failure: "text-status-pending bg-status-pending/10",
  fraud_flag: "text-status-suspended bg-status-suspended/10",
  payment_issue: "text-primary bg-primary/10",
};

export function ActionItems({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-bg-elevated p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-active/10 text-status-active">
          ✓
        </div>
        <p className="font-semibold text-white">Inbox zero</p>
        <p className="text-sm text-white/50">Nothing needs your attention right now.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-bg-elevated">
      {items.slice(0, 5).map((item) => {
        const Icon = ICONS[item.kind];
        const accent = ACCENTS[item.kind];
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.03]"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{item.title}</p>
                <p className="truncate text-xs text-white/50">
                  {item.subtitle}
                  <span className="ml-2 text-white/30">· {relativeTime(item.createdAt)}</span>
                </p>
              </div>
              <span className="hidden text-xs font-medium text-primary sm:inline">Review</span>
              <ChevronRight className="h-4 w-4 text-white/30" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
