"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

export function CheckNowButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = () => {
    start(async () => {
      try {
        const res = await fetch("/api/verification/check-now", { method: "POST" });
        const json = (await res.json()) as {
          verified?: boolean;
          pending?: boolean;
          message?: string;
          error?: string;
        };
        if (!res.ok) {
          toast.error(json.error ?? "Check failed — try again.");
          return;
        }
        if (json.verified) {
          toast.success("ads.txt verified ✓");
        } else if (json.pending) {
          toast(json.message ?? "Not found yet — we'll keep watching.", { icon: "⏳" });
        } else {
          toast.error(json.message ?? "ads.txt check failed.");
        }
        router.refresh();
      } catch {
        toast.error("Network error — try again.");
      }
    });
  };

  return (
    <button type="button" onClick={run} disabled={pending} className="av-btn-primary">
      {pending ? "Checking…" : "Check ads.txt now"}
    </button>
  );
}
