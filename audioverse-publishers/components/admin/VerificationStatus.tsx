import { Check, Clock, X } from "lucide-react";
import type { PublisherRow } from "@/lib/supabase/types";

type State = "verified" | "pending" | "failed";

const ICON: Record<State, { Icon: typeof Check; cls: string; label: string }> = {
  verified: { Icon: Check, cls: "text-status-active bg-status-active/10", label: "Verified" },
  pending: { Icon: Clock, cls: "text-status-pending bg-status-pending/10", label: "Pending" },
  failed: { Icon: X, cls: "text-status-suspended bg-status-suspended/10", label: "Not done" },
};

function state(done: boolean, started?: boolean): State {
  if (done) return "verified";
  if (started) return "pending";
  return "failed";
}

interface Props {
  publisher: Pick<
    PublisherRow,
    | "email_verified"
    | "domain_verified"
    | "domain_verification_method"
    | "ads_txt_verified"
    | "ads_txt_last_checked"
    | "phone_verified"
    | "status"
  >;
  layout?: "list" | "row";
}

export function VerificationStatus({ publisher, layout = "list" }: Props) {
  const items: Array<{ label: string; state: State; detail?: string }> = [
    { label: "Email", state: state(publisher.email_verified) },
    {
      label: "Domain",
      state: state(publisher.domain_verified),
      detail: publisher.domain_verification_method ?? undefined,
    },
    {
      label: "ads.txt",
      state: state(publisher.ads_txt_verified, !!publisher.ads_txt_last_checked),
    },
    { label: "Phone", state: state(publisher.phone_verified) },
    {
      label: "Manual review",
      state:
        publisher.status === "active"
          ? "verified"
          : publisher.status === "pending"
            ? "pending"
            : "failed",
    },
  ];

  if (layout === "row") {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((i) => {
          const meta = ICON[i.state];
          const I = meta.Icon;
          return (
            <span
              key={i.label}
              title={`${i.label}: ${meta.label}`}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${meta.cls}`}
            >
              <I className="h-3.5 w-3.5" />
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((i) => {
        const meta = ICON[i.state];
        const I = meta.Icon;
        return (
          <li
            key={i.label}
            className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm text-white/80">
              <span className={`flex h-6 w-6 items-center justify-center rounded ${meta.cls}`}>
                <I className="h-3.5 w-3.5" />
              </span>
              {i.label}
              {i.detail ? <span className="text-xs text-white/40">· {i.detail}</span> : null}
            </span>
            <span className={`text-xs font-medium ${meta.cls.split(" ")[0]}`}>{meta.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
