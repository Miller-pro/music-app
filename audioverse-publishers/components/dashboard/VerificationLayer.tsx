"use client";

import { relativeTime } from "@/lib/utils/relative-time";

export type LayerState = "verified" | "pending" | "failed" | "not_started";

export function VerificationLayer({
  name,
  state,
  method,
  at,
  action,
}: {
  name: string;
  state: LayerState;
  method?: string | null;
  at?: string | null;
  action?: React.ReactNode;
}) {
  const icon =
    state === "verified" ? "✅" : state === "failed" ? "❌" : "⏳";
  const labelByState: Record<LayerState, string> = {
    verified: "Verified",
    pending: "Pending",
    failed: "Failed",
    not_started: "Not started",
  };
  const textClass: Record<LayerState, string> = {
    verified: "text-status-active",
    pending: "text-status-pending",
    failed: "text-status-suspended",
    not_started: "text-white/50",
  };
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/5 py-3 first:border-0 first:pt-0">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="text-lg">
          {icon}
        </span>
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-xs text-white/50">
            <span className={textClass[state]}>{labelByState[state]}</span>
            {method ? <span className="ml-1.5">· via {method}</span> : null}
            {at ? <span className="ml-1.5">· {relativeTime(at)}</span> : null}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
