"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { PlatformType, DomainVerificationMethod } from "@/lib/supabase/types";
import { generatePublisherId } from "@/lib/utils/publisher-id";
import { generateVerificationToken } from "@/lib/utils/verification-token";

// ---------------------------------------------------------------------------
// Shape of the draft — the aggregate of everything the wizard collects.
// ---------------------------------------------------------------------------
export interface OnboardingDraft {
  // Step 1
  platform_type?: PlatformType;

  // Step 2 — fields vary by platform
  domain?: string;
  app_name?: string;
  bundle_id?: string;
  developer_url?: string;
  app_store_url?: string;
  monthly_users?: number;
  primary_country?: string;

  // Step 3 — domain verification
  domain_verification_token: string;
  domain_verification_method?: DomainVerificationMethod;
  domain_verified: boolean;
  domain_verification_skipped: boolean;

  // Step 4 — ads.txt
  publisher_id: string;
  ads_txt_verified: boolean;
  ads_txt_skipped: boolean;

  // Step 5 — contact
  name?: string;
  company?: string;
  phone?: string;
  phone_verified: boolean;
  phone_skipped: boolean;

  // Step 6 — terms
  tos_accepted: boolean;
  privacy_accepted: boolean;
  email_consent: boolean;
  data_consent: boolean;

  // Wizard meta
  step: 1 | 2 | 3 | 4 | 5 | 6;
  // Highest step reached — gates forward navigation via ProgressIndicator.
  maxStep: 1 | 2 | 3 | 4 | 5 | 6;
}

type Action =
  | { type: "patch"; patch: Partial<OnboardingDraft> }
  | { type: "goto"; step: OnboardingDraft["step"] }
  | { type: "reset"; draft: OnboardingDraft };

function reducer(state: OnboardingDraft, action: Action): OnboardingDraft {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "goto": {
      const maxStep = (Math.max(state.maxStep, action.step) as OnboardingDraft["maxStep"]);
      return { ...state, step: action.step, maxStep };
    }
    case "reset":
      return action.draft;
  }
}

const STORAGE_KEY = "av-onboarding-draft-v1";

function emptyDraft(): OnboardingDraft {
  return {
    domain_verification_token: generateVerificationToken(),
    publisher_id: generatePublisherId(),
    domain_verified: false,
    domain_verification_skipped: false,
    ads_txt_verified: false,
    ads_txt_skipped: false,
    phone_verified: false,
    phone_skipped: false,
    tos_accepted: false,
    privacy_accepted: false,
    email_consent: false,
    data_consent: false,
    step: 1,
    maxStep: 1,
  };
}

interface ContextValue {
  draft: OnboardingDraft;
  patch: (patch: Partial<OnboardingDraft>) => void;
  goto: (step: OnboardingDraft["step"]) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  /** Remove local draft — call after successful submit. */
  clearDraft: () => void;
}

const Ctx = createContext<ContextValue | null>(null);

export function OnboardingProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: Partial<OnboardingDraft>;
}) {
  const [draft, dispatch] = useReducer(reducer, undefined, () => {
    // Hydrate from localStorage if available. Generated tokens/ids persist
    // across refresh so the user doesn't see them change mid-flow.
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as OnboardingDraft;
          if (parsed && typeof parsed === "object") {
            return { ...emptyDraft(), ...parsed, ...initial };
          }
        }
      } catch {
        /* ignore */
      }
    }
    return { ...emptyDraft(), ...initial };
  });

  // Persist every change. Debounce isn't necessary — draft is small and
  // updates are user-driven, not per-keystroke (forms patch on blur/submit).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota exceeded — not fatal */
    }
  }, [draft]);

  // Warn before leaving mid-flow. Skip when user is on step 6 completing.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: BeforeUnloadEvent) => {
      if (draft.step > 1 && draft.step < 6) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draft.step]);

  const value = useMemo<ContextValue>(
    () => ({
      draft,
      patch: (patch) => dispatch({ type: "patch", patch }),
      goto: (step) => dispatch({ type: "goto", step }),
      next: () =>
        dispatch({
          type: "goto",
          step: Math.min(6, draft.step + 1) as OnboardingDraft["step"],
        }),
      back: () =>
        dispatch({
          type: "goto",
          step: Math.max(1, draft.step - 1) as OnboardingDraft["step"],
        }),
      reset: () => dispatch({ type: "reset", draft: emptyDraft() }),
      clearDraft: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [draft],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): ContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be inside <OnboardingProvider>");
  return v;
}
