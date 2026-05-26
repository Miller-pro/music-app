"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { VerificationStatus } from "./VerificationStatus";
import { RevenueCard } from "./RevenueCard";
import { relativeTime } from "@/lib/utils/relative-time";
import { findCountry } from "@/lib/utils/country-list";
import type { PublisherDetails } from "@/lib/db/admin-queries";

type LoadState = "idle" | "loading" | "error";

interface Props {
  publisherId: string | null;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export function PublisherDetailModal({ publisherId, open, onClose, onChanged }: Props) {
  const [details, setDetails] = useState<PublisherDetails | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [showFlagInput, setShowFlagInput] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(async () => {
    if (!publisherId) return;
    setState("loading");
    try {
      const res = await fetch(`/api/admin/publishers/${publisherId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as PublisherDetails;
      setDetails(data);
      setState("idle");
    } catch {
      setState("error");
      toast.error("Couldn't load publisher details");
    }
  }, [publisherId]);

  useEffect(() => {
    if (open && publisherId) {
      setShowRejectInput(false);
      setShowFlagInput(false);
      setRejectReason("");
      setFlagReason("");
      setNoteDraft("");
      void load();
    }
  }, [open, publisherId, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !publisherId) return null;

  const doAction = async (path: string, body?: Record<string, unknown>, label?: string) => {
    setBusy(label ?? path);
    try {
      const res = await fetch(`/api/admin/publishers/${publisherId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok || data.error) throw new Error(data.error || "Action failed");
      toast.success(`${label ?? path} ✓`);
      onChanged?.();
      await load();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = () => doAction("approve", undefined, "Approved");
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    const ok = await doAction("reject", { reason: rejectReason }, "Rejected");
    if (ok) {
      setShowRejectInput(false);
      setRejectReason("");
    }
  };
  const handleFlag = async () => {
    if (!flagReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    const ok = await doAction("flag", { reason: flagReason }, "Flagged");
    if (ok) {
      setShowFlagInput(false);
      setFlagReason("");
    }
  };
  const handleRecheck = () => doAction("recheck", undefined, "Re-checked");
  const handleNote = async () => {
    if (!noteDraft.trim()) return;
    const ok = await doAction("notes", { body: noteDraft }, "Note saved");
    if (ok) setNoteDraft("");
  };

  const p = details?.publisher;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div
        className="relative flex h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-bg-elevated shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publisher-detail-title"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 p-5">
          <div className="min-w-0">
            <h2 id="publisher-detail-title" className="truncate text-lg font-bold text-white">
              {p?.name || p?.email || "Loading…"}
            </h2>
            {p ? (
              <p className="font-mono text-xs text-white/50">{p.publisher_id}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {state === "loading" && (
            <div className="flex h-40 items-center justify-center text-white/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2 text-sm">Loading details…</span>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-lg border border-status-suspended/30 bg-status-suspended/10 p-4 text-sm text-status-suspended">
              Failed to load. <button onClick={load} className="underline">Retry</button>
            </div>
          )}

          {p && (
            <div className="space-y-6">
              {/* a) BASIC INFO */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Basic info
                </h3>
                <div className="grid gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-4 sm:grid-cols-2">
                  <Row label="Status" value={<StatusBadge status={p.status} size="sm" />} />
                  <Row label="Domain" value={<span className="font-mono">{p.domain || "—"}</span>} />
                  <Row label="Owner email" value={p.email} />
                  <Row label="Country" value={countryLabel(p.primary_country)} />
                  <Row label="Platform" value={platformLabel(p.platform_type)} />
                  <Row label="Submitted" value={relativeTime(p.created_at)} />
                  {p.fraud_flags && p.fraud_flags.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wider text-white/40">Fraud flags</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {p.fraud_flags.map((f) => (
                          <span
                            key={f}
                            className="rounded-full bg-status-suspended/10 px-2 py-0.5 text-xs font-medium text-status-suspended"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* b) VERIFICATION STATUS */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Verification
                </h3>
                <VerificationStatus publisher={p} />
              </section>

              {/* c) REVENUE */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Revenue
                </h3>
                <RevenueCard
                  revenue={p.estimated_revenue}
                  plays={p.estimated_plays}
                  share={p.publisher_share}
                />
              </section>

              {/* d) ACTIONS */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Actions
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ActionButton
                    color="success"
                    icon={Check}
                    label="Approve Publisher"
                    onClick={handleApprove}
                    busy={busy === "Approved"}
                    disabled={p.status === "active"}
                  />
                  <ActionButton
                    color="danger"
                    icon={X}
                    label="Reject with reason"
                    onClick={() => setShowRejectInput((s) => !s)}
                    disabled={p.status === "rejected"}
                  />
                  <ActionButton
                    color="neutral"
                    icon={RefreshCw}
                    label="Re-check verification"
                    onClick={handleRecheck}
                    busy={busy === "Re-checked"}
                  />
                  <ActionButton
                    color="warning"
                    icon={AlertTriangle}
                    label="Flag as fraud"
                    onClick={() => setShowFlagInput((s) => !s)}
                  />
                  <ActionButton
                    color="neutral"
                    icon={MessageSquare}
                    label="Send message (soon)"
                    onClick={() => undefined}
                    disabled
                  />
                </div>

                {showRejectInput && (
                  <div className="mt-3 rounded-lg border border-status-suspended/30 bg-status-suspended/5 p-3">
                    <label className="av-label">Rejection reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="av-input min-h-[80px]"
                      placeholder="Explain why this publisher is being rejected. The reason is recorded in the audit log."
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        className="av-btn-secondary"
                        onClick={() => setShowRejectInput(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="av-btn-primary"
                        onClick={handleReject}
                        disabled={busy === "Rejected"}
                      >
                        {busy === "Rejected" ? "Saving…" : "Confirm reject"}
                      </button>
                    </div>
                  </div>
                )}

                {showFlagInput && (
                  <div className="mt-3 rounded-lg border border-status-pending/30 bg-status-pending/5 p-3">
                    <label className="av-label">Flag reason</label>
                    <textarea
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="av-input min-h-[80px]"
                      placeholder="Why is this publisher being flagged as fraudulent?"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        className="av-btn-secondary"
                        onClick={() => setShowFlagInput(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="av-btn-primary"
                        onClick={handleFlag}
                        disabled={busy === "Flagged"}
                      >
                        {busy === "Flagged" ? "Saving…" : "Confirm flag"}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* e) INTERNAL NOTES */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Internal notes
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add a private note…"
                      className="av-input min-h-[70px]"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        className="av-btn-primary inline-flex items-center gap-1.5"
                        onClick={handleNote}
                        disabled={!noteDraft.trim() || busy === "Note saved"}
                      >
                        <Send className="h-4 w-4" />
                        {busy === "Note saved" ? "Saving…" : "Add note"}
                      </button>
                    </div>
                  </div>

                  {details?.notes.length === 0 ? (
                    <p className="text-sm text-white/40">No notes yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {details?.notes.map((n) => (
                        <li
                          key={n.id}
                          className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                          <p className="whitespace-pre-wrap text-sm text-white/85">{n.body}</p>
                          <p className="mt-2 text-xs text-white/40">
                            {n.admin_email ?? "admin"} · {relativeTime(n.created_at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <div className="mt-0.5 text-sm text-white">{value}</div>
    </div>
  );
}

function platformLabel(p: string | null) {
  if (!p) return "—";
  if (p === "website") return "Website";
  if (p === "ios_app") return "iOS App";
  if (p === "android_app") return "Android App";
  return p;
}

function countryLabel(code: string | null) {
  if (!code) return "—";
  const c = findCountry(code);
  if (!c) return code;
  return `${c.flag} ${c.name}`;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color,
  busy,
  disabled,
}: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
  color: "success" | "danger" | "warning" | "neutral";
  busy?: boolean;
  disabled?: boolean;
}) {
  const colors: Record<typeof color, string> = {
    success: "bg-status-active/15 text-status-active hover:bg-status-active/25 border-status-active/30",
    danger: "bg-status-suspended/15 text-status-suspended hover:bg-status-suspended/25 border-status-suspended/30",
    warning: "bg-status-pending/15 text-status-pending hover:bg-status-pending/25 border-status-pending/30",
    neutral: "bg-white/5 text-white hover:bg-white/10 border-white/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${colors[color]}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
