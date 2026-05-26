"use client";

import { useOnboarding } from "./OnboardingContext";
import type { OnboardingDraft } from "./OnboardingContext";

const LABELS = [
  "Platform",
  "Basics",
  "Domain",
  "ads.txt",
  "Contact",
  "Terms",
];

type StepStatus = "current" | "completed" | "skipped" | "pending";

// A past step (stepNum < draft.step) is "skipped" if the user took the skip
// path on that step. Otherwise it's "completed".
function statusForStep(stepNum: number, draft: OnboardingDraft): StepStatus {
  if (stepNum === draft.step) return "current";
  if (stepNum > draft.step) return "pending";
  if (stepNum === 3 && draft.domain_verification_skipped) return "skipped";
  if (stepNum === 4 && draft.ads_txt_skipped) return "skipped";
  if (stepNum === 5 && draft.phone_skipped) return "skipped";
  return "completed";
}

export function ProgressIndicator() {
  const { draft, goto } = useOnboarding();
  return (
    <nav aria-label="Onboarding progress" className="mb-8">
      <ol className="flex items-center gap-2">
        {LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
          const status = statusForStep(stepNum, draft);
          const canJump = stepNum <= draft.maxStep && stepNum !== draft.step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => canJump && goto(stepNum)}
                disabled={!canJump}
                aria-current={status === "current" ? "step" : undefined}
                aria-label={
                  status === "skipped"
                    ? `${label} — skipped, click to revisit`
                    : `${label} — ${status}`
                }
                className={`group flex w-full flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left transition ${
                  status === "current"
                    ? "border-primary/60 bg-primary/10"
                    : status === "skipped"
                      ? "border-status-pending/40 bg-status-pending/5 hover:border-status-pending/70"
                      : status === "completed"
                        ? "border-white/10 bg-bg-elevated hover:border-white/30"
                        : "border-white/5 bg-bg"
                } ${canJump ? "cursor-pointer" : "cursor-default"} disabled:cursor-default`}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      status === "completed"
                        ? "bg-status-active text-white"
                        : status === "skipped"
                          ? "bg-status-pending/15 text-status-pending ring-1 ring-status-pending/60"
                          : status === "current"
                            ? "bg-primary text-white"
                            : "border border-white/15 bg-transparent text-white/40"
                    }`}
                  >
                    {status === "completed"
                      ? "✓"
                      : status === "skipped"
                        ? "⊘"
                        : stepNum}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      status === "current"
                        ? "text-white"
                        : status === "completed"
                          ? "text-white/70"
                          : status === "skipped"
                            ? "text-status-pending/90"
                            : "text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
