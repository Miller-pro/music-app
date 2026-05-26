"use client";

import { AnimatePresence, motion } from "framer-motion";
import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import { ProgressIndicator } from "./ProgressIndicator";
import { PlatformStep } from "./steps/PlatformStep";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DomainVerificationStep } from "./steps/DomainVerificationStep";
import { AdsTxtStep } from "./steps/AdsTxtStep";
import { ContactStep } from "./steps/ContactStep";
import { TermsStep } from "./steps/TermsStep";

export function OnboardingWizard({ initialName }: { initialName?: string }) {
  return (
    <OnboardingProvider initial={initialName ? { name: initialName } : undefined}>
      <Wizard />
    </OnboardingProvider>
  );
}

function Wizard() {
  const { draft } = useOnboarding();
  const completedSteps = draft.step - 1;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold tracking-tight text-white">
          Audio<span className="text-primary">Verse</span>{" "}
          <span className="font-normal text-white/40">publishers</span>
        </h1>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-white/40">
            ~{Math.max(1, 6 - draft.step + 1) * 2} min remaining
          </span>
          <ProgressWheel completed={completedSteps} total={6} />
        </div>
      </div>
      <ProgressIndicator />
      <div className="av-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={draft.step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {draft.step === 1 ? <PlatformStep /> : null}
            {draft.step === 2 ? <BasicInfoStep /> : null}
            {draft.step === 3 ? <DomainVerificationStep /> : null}
            {draft.step === 4 ? <AdsTxtStep /> : null}
            {draft.step === 5 ? <ContactStep /> : null}
            {draft.step === 6 ? <TermsStep /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProgressWheel({ completed, total }: { completed: number; total: number }) {
  const size = 36;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, completed / total));
  const dashOffset = circumference * (1 - ratio);
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${completed} of ${total} steps completed`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 400ms ease-out" }}
        />
      </svg>
      <span className="absolute text-[9px] font-semibold tabular-nums text-white/80">
        {completed}/{total}
      </span>
    </div>
  );
}
