"use client";

import { useEffect, useRef, useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { StepNavigation } from "../StepNavigation";
import { FormInput } from "@/components/auth/FormInput";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { basicInfoSchema } from "@/lib/validations/onboarding";

type FieldErrors = Partial<Record<string, string>>;

export function BasicInfoStep() {
  const { draft, patch, next } = useOnboarding();
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const isWebsite = draft.platform_type === "website";
  const isIos = draft.platform_type === "ios_app";
  const isAndroid = draft.platform_type === "android_app";

  const setField = (key: string, value: unknown) => {
    patch({ [key]: value } as never);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleNext = () => {
    const candidate: Record<string, unknown> = {
      platform_type: draft.platform_type,
      app_name: draft.app_name ?? "",
      monthly_users: draft.monthly_users ?? 0,
      primary_country: draft.primary_country ?? "",
    };
    if (isWebsite) candidate.domain = draft.domain ?? "";
    if (isIos || isAndroid) {
      candidate.bundle_id = draft.bundle_id ?? "";
      candidate.developer_url = draft.developer_url ?? "";
      candidate.app_store_url = draft.app_store_url ?? "";
    }

    const parsed = basicInfoSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    next();
  };

  const monthlyUsers = draft.monthly_users ?? 0;

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Tell us about your property</h2>
        <p className="mt-1 text-sm text-white/60">
          {isWebsite ? "We'll use your domain for verification."
            : isIos ? "iOS apps integrate via app-ads.txt on your developer site."
            : "Android apps integrate via app-ads.txt on your developer site."}
        </p>
      </header>

      <div className="space-y-4">
        {isWebsite ? (
          <>
            <FormInput
              ref={firstFieldRef}
              label="Website URL"
              hint="Just the domain — no https:// or trailing slash."
              placeholder="example.com"
              value={draft.domain ?? ""}
              onChange={(e) => setField("domain", e.target.value)}
              error={errors.domain}
            />
            <FormInput
              label="Website Name"
              placeholder="My Cool Site"
              value={draft.app_name ?? ""}
              onChange={(e) => setField("app_name", e.target.value)}
              error={errors.app_name}
            />
          </>
        ) : null}

        {isIos || isAndroid ? (
          <>
            <FormInput
              ref={firstFieldRef}
              label="App Name"
              placeholder="My Great App"
              value={draft.app_name ?? ""}
              onChange={(e) => setField("app_name", e.target.value)}
              error={errors.app_name}
            />
            <FormInput
              label={isIos ? "Bundle ID" : "Package Name"}
              hint={isIos ? "From Xcode / App Store Connect." : "From Play Console."}
              placeholder="com.yourcompany.app"
              value={draft.bundle_id ?? ""}
              onChange={(e) => setField("bundle_id", e.target.value)}
              error={errors.bundle_id}
            />
            <FormInput
              label="Developer Website URL"
              hint="We'll check app-ads.txt at this domain."
              placeholder="https://yourcompany.com"
              value={draft.developer_url ?? ""}
              onChange={(e) => setField("developer_url", e.target.value)}
              error={errors.developer_url}
            />
            <FormInput
              label={isIos ? "App Store URL (optional)" : "Play Store URL (optional)"}
              placeholder={
                isIos
                  ? "https://apps.apple.com/app/id1234567890"
                  : "https://play.google.com/store/apps/details?id=com.your.app"
              }
              value={draft.app_store_url ?? ""}
              onChange={(e) => setField("app_store_url", e.target.value)}
              error={errors.app_store_url}
            />
          </>
        ) : null}

        <div>
          <label htmlFor="monthly_users" className="av-label">
            Estimated monthly users
            <span className="ml-2 text-white/50">{monthlyUsers.toLocaleString()}</span>
          </label>
          <input
            id="monthly_users"
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={monthlyUsers}
            onChange={(e) => setField("monthly_users", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs text-white/40">
            <span>0</span>
            <span>25K</span>
            <span>50K</span>
            <span>75K</span>
            <span>100K+</span>
          </div>
        </div>

        <div>
          <label htmlFor="primary_country" className="av-label">
            Primary country
          </label>
          <CountrySelect
            id="primary_country"
            value={draft.primary_country}
            onChange={(code) => setField("primary_country", code)}
          />
          {errors.primary_country ? (
            <p className="mt-1.5 text-sm text-status-suspended">{errors.primary_country}</p>
          ) : null}
        </div>
      </div>

      <StepNavigation onNext={handleNext} />
    </div>
  );
}
