"use client";

import { useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { StepNavigation } from "../StepNavigation";
import { CodeSnippet } from "../CodeSnippet";
import type { DomainVerificationMethod } from "@/lib/supabase/types";

type Status = "idle" | "loading" | "success" | "error";

export function DomainVerificationStep() {
  const { draft, patch, next } = useOnboarding();
  const [method, setMethod] = useState<DomainVerificationMethod>(
    draft.domain_verification_method ?? "meta_tag",
  );
  const [status, setStatus] = useState<Status>(draft.domain_verified ? "success" : "idle");
  const [error, setError] = useState<string | null>(null);

  // Domain we'll verify. For website it's `domain`; for apps it's the
  // developer_url (where app-ads.txt lives) stripped to hostname.
  const targetDomain = (() => {
    if (draft.platform_type === "website") return draft.domain;
    if (draft.developer_url) {
      try {
        return new URL(draft.developer_url).hostname;
      } catch {
        return draft.developer_url;
      }
    }
    return undefined;
  })();

  const token = draft.domain_verification_token;

  const verify = async () => {
    if (!targetDomain) {
      setError("Missing domain — go back and fill in the previous step.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/verification/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: targetDomain, token, method }),
      });
      const json = (await res.json()) as { verified?: boolean; error?: string };
      if (json.verified) {
        patch({
          domain_verified: true,
          domain_verification_method: method,
          domain_verification_skipped: false,
        });
        setStatus("success");
        // Brief pause so users see the checkmark before auto-advance.
        setTimeout(next, 900);
      } else {
        setError(json.error ?? "We couldn't verify ownership. Double-check and try again.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  const skipLater = () => {
    patch({
      domain_verified: false,
      domain_verification_skipped: true,
      domain_verification_method: method,
    });
    next();
  };

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Verify you own the domain</h2>
        <p className="mt-1 text-sm text-white/60">
          Pick whichever method is easiest. You only need to complete one.
        </p>
        {targetDomain ? (
          <p className="mt-2 text-sm text-white/80">
            Verifying: <span className="font-mono text-primary">{targetDomain}</span>
          </p>
        ) : null}
      </header>

      <div className="space-y-3">
        <MethodCard
          id="meta_tag"
          active={method === "meta_tag"}
          onSelect={() => setMethod("meta_tag")}
          title="Meta tag"
          badge="Recommended"
          description={`Paste this inside the <head> of ${targetDomain ?? "your site"}.`}
        >
          <CodeSnippet
            language="html"
            code={`<meta name="audioverse-verification" content="${token}" />`}
          />
        </MethodCard>

        <MethodCard
          id="dns_txt"
          active={method === "dns_txt"}
          onSelect={() => setMethod("dns_txt")}
          title="DNS TXT record"
          description="Add this TXT record to your DNS (Cloudflare, Route53, Namecheap, etc.). Propagation can take a few minutes."
        >
          <CodeSnippet language="dns" label="TXT record" code={`audioverse-verify=${token}`} />
        </MethodCard>

        <MethodCard
          id="html_file"
          active={method === "html_file"}
          onSelect={() => setMethod("html_file")}
          title="HTML file upload"
          description="Upload this file to the root of your site so it's reachable at /audioverse-verify.html."
        >
          <div className="flex items-center gap-2">
            <CodeSnippet language="text" label="File contents" code={token} />
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(token)}`}
              download="audioverse-verify.html"
              className="av-btn-secondary shrink-0"
            >
              Download file
            </a>
          </div>
        </MethodCard>
      </div>

      {status === "success" ? (
        <div
          role="status"
          className="mt-4 rounded-lg border border-status-active/40 bg-status-active/10 px-3.5 py-2.5 text-sm text-status-active"
        >
          ✓ Domain verified — moving on…
        </div>
      ) : null}
      {status === "error" && error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-status-suspended/40 bg-status-suspended/10 px-3.5 py-2.5 text-sm text-status-suspended"
        >
          {error}
        </div>
      ) : null}

      <StepNavigation
        onNext={verify}
        nextLabel="Verify now"
        loading={status === "loading"}
        secondaryAction={
          <button type="button" onClick={skipLater} className="av-btn-secondary sm:w-auto">
            I'll verify later
          </button>
        }
      />
    </div>
  );
}

function MethodCard({
  id,
  active,
  onSelect,
  title,
  description,
  badge,
  children,
}: {
  id: string;
  active: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        active ? "border-primary/60 bg-primary/5" : "border-white/10 bg-bg-elevated"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={active}
        aria-controls={`${id}-panel`}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{title}</span>
            {badge ? (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-white/60">{description}</p>
        </div>
        <span
          className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            active ? "border-primary bg-primary text-white" : "border-white/20"
          }`}
        >
          {active ? "✓" : ""}
        </span>
      </button>
      {active && children ? (
        <div id={`${id}-panel`} className="mt-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
