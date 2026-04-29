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
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-bold tracking-tight text-white">
          Audio<span className="text-primary">Verse</span>{" "}
          <span className="font-normal text-white/40">publishers</span>
        </h1>
        <span className="text-xs text-white/40">
          ~{Math.max(1, 6 - draft.step + 1) * 2} min remaining
        </span>
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
