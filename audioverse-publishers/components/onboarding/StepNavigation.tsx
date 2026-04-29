"use client";

import { useOnboarding } from "./OnboardingContext";

export function StepNavigation({
  onNext,
  nextLabel,
  nextDisabled,
  loading,
  secondaryAction,
}: {
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  secondaryAction?: React.ReactNode;
}) {
  const { draft, back } = useOnboarding();
  const isFirst = draft.step === 1;
  return (
    <div className="mt-8 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={back}
        disabled={isFirst || loading}
        className="av-btn-secondary sm:w-auto"
      >
        ← Back
      </button>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {secondaryAction}
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="av-btn-primary sm:w-auto"
          >
            {loading ? "Please wait…" : (nextLabel ?? "Continue")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
