"use client";

import { relativeTime } from "@/lib/utils/relative-time";
import type { VerificationAttemptRow } from "@/lib/supabase/types";

const TYPE_LABEL: Record<string, string> = {
  domain: "Domain",
  ads_txt: "ads.txt",
  phone: "Phone",
  email: "Email",
};

export function ActivityLog({ items }: { items: VerificationAttemptRow[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-white/50">No activity yet.</p>;
  }
  return (
    <ul className="divide-y divide-white/5">
      {items.map((a) => {
        const label = TYPE_LABEL[a.verification_type] ?? a.verification_type;
        const verb = a.success ? "verified" : "check failed";
        const icon = a.success ? "✅" : "❌";
        const methodBit = a.method ? ` via ${a.method}` : "";
        return (
          <li key={a.id} className="flex items-start gap-3 py-2.5 text-sm">
            <span aria-hidden="true" className="mt-0.5">
              {icon}
            </span>
            <div className="flex-1">
              <p className="text-white/90">
                {label} {verb}
                {methodBit}
                {!a.success && a.error_message ? (
                  <span className="text-white/50"> — {a.error_message}</span>
                ) : null}
              </p>
              <p className="text-xs text-white/40">{relativeTime(a.attempted_at)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
