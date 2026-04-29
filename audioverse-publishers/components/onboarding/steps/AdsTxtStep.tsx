"use client";

import { useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { StepNavigation } from "../StepNavigation";
import { CodeSnippet } from "../CodeSnippet";
import { adsTxtLineFor } from "@/lib/utils/publisher-id";

type Status = "idle" | "loading" | "success" | "pending" | "error";

export function AdsTxtStep() {
  const { draft, patch, next } = useOnboarding();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const line = adsTxtLineFor(draft.publisher_id);

  const check = async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/verification/ads-txt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publisher_id: draft.publisher_id,
          platform_type: draft.platform_type,
          domain: draft.domain,
          developer_url: draft.developer_url,
        }),
      });
      const json = (await res.json()) as {
        verified?: boolean;
        pending?: boolean;
        message?: string;
      };
      if (json.verified) {
        patch({ ads_txt_verified: true, ads_txt_skipped: false });
        setStatus("success");
        setTimeout(next, 900);
      } else if (json.pending) {
        setStatus("pending");
        setMessage(json.message ?? "Not found yet. We'll re-check automatically.");
      } else {
        setStatus("error");
        setMessage(json.message ?? "Couldn't find the line. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const skipLater = () => {
    patch({ ads_txt_verified: false, ads_txt_skipped: true });
    next();
  };

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Add your ads.txt line</h2>
        <p className="mt-1 text-sm text-white/60">
          One line. We generated your Publisher ID just now — it's yours permanently.
        </p>
      </header>

      <div className="av-card space-y-4 bg-bg-elevated p-4">
        <div>
          <span className="av-label">Your Publisher ID</span>
          <p className="font-mono text-primary">{draft.publisher_id}</p>
        </div>
        <div>
          <span className="av-label">Required line</span>
          <CodeSnippet language="text" label="ads.txt" code={line} />
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-white/10 bg-bg-elevated">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm text-white/80 hover:text-white">
          <span className="mr-2">📖</span>
          How to add it — instructions for {platformLabel(draft.platform_type)}
        </summary>
        <div className="border-t border-white/5 px-4 py-4 text-sm text-white/70">
          {draft.platform_type === "website" ? (
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>
                Open or create <span className="font-mono text-white">ads.txt</span> at the root of
                your domain.
              </li>
              <li>Paste the line above on its own row.</li>
              <li>
                Make sure it's reachable at{" "}
                <span className="font-mono text-white">
                  https://{draft.domain ?? "yourdomain.com"}/ads.txt
                </span>
                .
              </li>
            </ol>
          ) : draft.platform_type === "ios_app" ? (
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Open App Store Connect → your app → App Information.</li>
              <li>
                Find the app-ads.txt section and add your developer website URL if missing.
              </li>
              <li>
                Host <span className="font-mono text-white">app-ads.txt</span> at that developer
                domain's root and paste the line.
              </li>
              <li>Apple crawls this daily; propagation is usually under 24 hours.</li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Open Play Console → your app → Monetization setup.</li>
              <li>Declare your developer website URL.</li>
              <li>
                Host <span className="font-mono text-white">app-ads.txt</span> at that developer
                domain's root and paste the line.
              </li>
              <li>Google re-crawls within ~24 hours.</li>
            </ol>
          )}
        </div>
      </details>

      {message ? (
        <div
          role={status === "error" ? "alert" : "status"}
          className={`mt-4 rounded-lg border px-3.5 py-2.5 text-sm ${
            status === "pending"
              ? "border-status-pending/40 bg-status-pending/10 text-status-pending"
              : status === "success"
                ? "border-status-active/40 bg-status-active/10 text-status-active"
                : "border-status-suspended/40 bg-status-suspended/10 text-status-suspended"
          }`}
        >
          {message}
        </div>
      ) : null}
      {status === "success" ? (
        <div
          role="status"
          className="mt-4 rounded-lg border border-status-active/40 bg-status-active/10 px-3.5 py-2.5 text-sm text-status-active"
        >
          ✓ ads.txt verified — moving on…
        </div>
      ) : null}

      <StepNavigation
        onNext={check}
        nextLabel="✓ I've added it — check now"
        loading={status === "loading"}
        secondaryAction={
          <button type="button" onClick={skipLater} className="av-btn-secondary sm:w-auto">
            ⏸ I'll add it later
          </button>
        }
      />
    </div>
  );
}

function platformLabel(p: string | undefined): string {
  if (p === "website") return "your website";
  if (p === "ios_app") return "iOS";
  if (p === "android_app") return "Android";
  return "your platform";
}
