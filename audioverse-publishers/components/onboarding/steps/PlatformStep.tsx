"use client";

import { useOnboarding } from "../OnboardingContext";
import { StepNavigation } from "../StepNavigation";
import type { PlatformType } from "@/lib/supabase/types";

const OPTIONS: {
  id: PlatformType;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "website",
    title: "Website",
    description: "Monetize a site or web app with ads.txt.",
    icon: <GlobeIcon />,
  },
  {
    id: "ios_app",
    title: "iOS App",
    description: "Integrate via app-ads.txt hosted on your developer site.",
    icon: <AppleIcon />,
  },
  {
    id: "android_app",
    title: "Android App",
    description: "Integrate via app-ads.txt hosted on your developer site.",
    icon: <AndroidIcon />,
  },
];

export function PlatformStep() {
  const { draft, patch, next } = useOnboarding();
  const selected = draft.platform_type;

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Pick your platform</h2>
        <p className="mt-1 text-sm text-white/60">
          We'll tailor the rest of onboarding to match.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => patch({ platform_type: o.id })}
              aria-pressed={active}
              className={`group flex h-full flex-col items-start gap-3 rounded-xl border p-5 text-left transition ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-white/10 bg-bg-elevated hover:border-white/30"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  active ? "bg-primary text-white" : "bg-white/5 text-white/70"
                }`}
              >
                {o.icon}
              </span>
              <div>
                <h3 className="font-semibold text-white">{o.title}</h3>
                <p className="mt-1 text-sm text-white/60">{o.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <StepNavigation onNext={next} nextDisabled={!selected} />
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.5-2.5 4-6 4-9s-1.5-6.5-4-9m0 18c-2.5-2.5-4-6-4-9s1.5-6.5 4-9M3.5 9h17M3.5 15h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.3 13.3c0-2.6 2.2-3.9 2.3-4-1.3-1.9-3.2-2.2-3.9-2.2-1.7-.2-3.3 1-4.1 1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.5 2.8-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.6.9 2.4-1.3 3.3-2.7c1-1.5 1.5-3 1.5-3.1-.1-.1-2.9-1.1-2.9-4.4ZM14.6 5c.8-.9 1.3-2.2 1.1-3.5-1.1.1-2.5.8-3.3 1.7-.7.8-1.3 2.1-1.1 3.4 1.2.1 2.5-.6 3.3-1.6Z" />
    </svg>
  );
}
function AndroidIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-11 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm10.7-5.2 1.4-2.5a.4.4 0 1 0-.7-.4l-1.5 2.5A6.7 6.7 0 0 0 12 6.3c-1.6 0-3 .4-4.4 1.1L6.1 4.9a.4.4 0 1 0-.7.4l1.4 2.5C4.8 9.2 3.3 11.4 3 14h18c-.3-2.6-1.8-4.8-3.8-6.2ZM3 15v6a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-6H3Zm13.5 0v6a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-6h-3.5ZM8 15v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7H8Z" />
    </svg>
  );
}
