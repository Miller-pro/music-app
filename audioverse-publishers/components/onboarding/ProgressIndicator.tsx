"use client";

import { useOnboarding } from "./OnboardingContext";

const LABELS = [
  "Platform",
  "Basics",
  "Domain",
  "ads.txt",
  "Contact",
  "Terms",
];

export function ProgressIndicator() {
  const { draft, goto } = useOnboarding();
  return (
    <nav aria-label="Onboarding progress" className="mb-8">
      <ol className="flex items-center gap-2">
        {LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
          const isCurrent = stepNum === draft.step;
          const isDone = stepNum < draft.step;
          const canJump = stepNum <= draft.maxStep && stepNum !== draft.step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => canJump && goto(stepNum)}
                disabled={!canJump}
                aria-current={isCurrent ? "step" : undefined}
                className={`group flex w-full flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left transition ${
                  isCurrent
                    ? "border-primary/60 bg-primary/10"
                    : isDone
                      ? "border-white/10 bg-bg-elevated hover:border-white/30"
                      : "border-white/5 bg-bg"
                } ${canJump ? "cursor-pointer" : "cursor-default"} disabled:cursor-default`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isDone
                        ? "bg-status-active text-white"
                        : isCurrent
                          ? "bg-primary text-white"
                          : "bg-white/10 text-white/50"
                    }`}
                  >
                    {isDone ? "✓" : stepNum}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent ? "text-white" : isDone ? "text-white/70" : "text-white/40"
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
