"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { StepNavigation } from "../StepNavigation";
import { termsSchema } from "@/lib/validations/onboarding";
import { findCountry } from "@/lib/utils/country-list";

export function TermsStep() {
  const { draft, patch, clearDraft } = useOnboarding();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = termsSchema.safeParse({
    tos_accepted: draft.tos_accepted,
    privacy_accepted: draft.privacy_accepted,
    email_consent: draft.email_consent,
    data_consent: draft.data_consent,
  });
  const ready = parsed.success;

  const submit = async () => {
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/publishers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_type: draft.platform_type,
          domain: draft.domain,
          app_name: draft.app_name,
          bundle_id: draft.bundle_id,
          developer_url: draft.developer_url,
          app_store_url: draft.app_store_url,
          monthly_users: draft.monthly_users,
          primary_country: draft.primary_country,
          domain_verification_token: draft.domain_verification_token,
          domain_verification_method: draft.domain_verification_method,
          domain_verified: draft.domain_verified,
          publisher_id: draft.publisher_id,
          ads_txt_verified: draft.ads_txt_verified,
          name: draft.name,
          company: draft.company,
          phone: draft.phone,
          phone_verified: draft.phone_verified,
          tos_accepted: draft.tos_accepted,
          privacy_accepted: draft.privacy_accepted,
          email_consent: draft.email_consent,
          data_consent: draft.data_consent,
          consented_at: new Date().toISOString(),
        }),
      });
      const json = (await res.json()) as { publisher?: unknown; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Couldn't save your setup. Please try again.");
        setSubmitting(false);
        return;
      }
      clearDraft();
      router.push("/dashboard/welcome");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const country = draft.primary_country ? findCountry(draft.primary_country) : undefined;

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Review &amp; accept</h2>
        <p className="mt-1 text-sm text-white/60">Last step — confirm the details below.</p>
      </header>

      <section className="av-card mb-6 space-y-2 text-sm">
        <SummaryRow label="Platform" value={labelPlatform(draft.platform_type)} />
        <SummaryRow
          label={draft.platform_type === "website" ? "Domain" : "Bundle ID"}
          value={draft.platform_type === "website" ? draft.domain : draft.bundle_id}
        />
        <SummaryRow label="Name" value={draft.app_name} />
        <SummaryRow
          label="Monthly users"
          value={draft.monthly_users?.toLocaleString()}
        />
        <SummaryRow
          label="Country"
          value={country ? `${country.flag} ${country.name}` : undefined}
        />
        <SummaryRow label="Publisher ID" value={draft.publisher_id} mono />
        <SummaryRow label="Contact" value={`${draft.name ?? ""}${draft.phone ? ` · ${draft.phone}` : ""}`} />
      </section>

      <div className="space-y-3">
        <Consent
          id="tos_accepted"
          checked={draft.tos_accepted}
          onChange={(v) => patch({ tos_accepted: v })}
        >
          I agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline" target="_blank">
            Terms of Service
          </Link>
          .
        </Consent>
        <Consent
          id="privacy_accepted"
          checked={draft.privacy_accepted}
          onChange={(v) => patch({ privacy_accepted: v })}
        >
          I agree to the{" "}
          <Link href="/privacy" className="text-primary hover:underline" target="_blank">
            Privacy Policy
          </Link>
          .
        </Consent>
        <Consent
          id="email_consent"
          checked={draft.email_consent}
          onChange={(v) => patch({ email_consent: v })}
        >
          I consent to receiving verification emails and revenue reports at my signup address.
        </Consent>
        <Consent
          id="data_consent"
          checked={draft.data_consent}
          onChange={(v) => patch({ data_consent: v })}
        >
          I consent to processing my data to participate in AudioVerse's 60/40 revenue sharing.
        </Consent>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-status-suspended/40 bg-status-suspended/10 px-3.5 py-2.5 text-sm text-status-suspended"
        >
          {error}
        </div>
      ) : null}

      <StepNavigation
        onNext={submit}
        nextLabel="Complete setup"
        nextDisabled={!ready}
        loading={submitting}
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/50">{label}</span>
      <span className={`text-right text-white/90 ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function Consent({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-white/80">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-bg-elevated text-primary focus:ring-primary/60"
      />
      <span>{children}</span>
    </label>
  );
}

function labelPlatform(p?: string): string | undefined {
  if (p === "website") return "Website";
  if (p === "ios_app") return "iOS App";
  if (p === "android_app") return "Android App";
  return undefined;
}
