"use client";

import { useEffect, useRef, useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { StepNavigation } from "../StepNavigation";
import { FormInput } from "@/components/auth/FormInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { contactSchema, phoneField } from "@/lib/validations/onboarding";

type SendStatus = "idle" | "sending" | "sent" | "error";
type VerifyStatus = "idle" | "verifying" | "error";

export function ContactStep() {
  const { draft, patch, next } = useOnboarding();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    setSendError(null);
    const parsed = phoneField.safeParse(draft.phone ?? "");
    if (!parsed.success) {
      setErrors((e) => ({ ...e, phone: parsed.error.issues[0]?.message ?? "Invalid phone" }));
      return;
    }
    setErrors((e) => ({ ...e, phone: undefined }));
    setSendStatus("sending");
    try {
      const res = await fetch("/api/verification/phone/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: draft.phone }),
      });
      const json = (await res.json()) as { sent?: boolean; dev_code?: string; error?: string };
      if (!res.ok || !json.sent) {
        setSendStatus("error");
        setSendError(json.error ?? "Couldn't send code. Please try again.");
        return;
      }
      setSendStatus("sent");
      setCooldown(60);
      if (json.dev_code) setDevCode(json.dev_code);
      setTimeout(() => codeInputsRef.current[0]?.focus(), 50);
    } catch {
      setSendStatus("error");
      setSendError("Network error. Please try again.");
    }
  };

  const handleCodeChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[idx] = digit;
    setCode(nextCode);
    if (digit && idx < 5) codeInputsRef.current[idx + 1]?.focus();
    if (nextCode.every((d) => d !== "")) {
      void verifyCode(nextCode.join(""));
    }
  };

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      codeInputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) codeInputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) codeInputsRef.current[idx + 1]?.focus();
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setCode(pasted.split(""));
      void verifyCode(pasted);
    }
  };

  const verifyCode = async (codeStr: string) => {
    setVerifyStatus("verifying");
    setVerifyError(null);
    try {
      const res = await fetch("/api/verification/phone/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: draft.phone, code: codeStr }),
      });
      const json = (await res.json()) as { verified?: boolean; error?: string };
      if (json.verified) {
        patch({ phone_verified: true, phone_skipped: false });
        setVerifyStatus("idle");
      } else {
        setVerifyStatus("error");
        setVerifyError(json.error ?? "Code didn't match. Try again.");
      }
    } catch {
      setVerifyStatus("error");
      setVerifyError("Network error. Please try again.");
    }
  };

  const validateName = () => {
    const parsed = contactSchema.safeParse({
      name: draft.name ?? "",
      company: draft.company ?? "",
      phone: draft.phone ?? "",
      phone_verified: draft.phone_verified,
    });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateName()) return;
    // Phone provided but not verified → treat as skipped for progress tracking
    patch({ phone_skipped: !!draft.phone && !draft.phone_verified });
    next();
  };

  const handleSkip = () => {
    if (!validateName()) return;
    patch({ phone_skipped: true, phone_verified: false });
    next();
  };

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Contact details</h2>
        <p className="mt-1 text-sm text-white/60">
          We'll use these to send revenue reports and outage notifications.
        </p>
      </header>

      <div className="space-y-4">
        <FormInput
          ref={nameRef}
          label="Full name"
          placeholder="Jane Developer"
          value={draft.name ?? ""}
          onChange={(e) => {
            patch({ name: e.target.value });
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          error={errors.name}
        />
        <FormInput
          label="Company (optional)"
          placeholder="Acme Inc."
          value={draft.company ?? ""}
          onChange={(e) => patch({ company: e.target.value })}
          error={errors.company}
        />
        <div>
          <label className="av-label">Phone number (optional)</label>
          <PhoneInput
            value={draft.phone ?? ""}
            onChange={(phone) => {
              patch({ phone, phone_verified: false, phone_skipped: false });
              if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
            }}
            invalid={!!errors.phone}
          />
          {errors.phone ? (
            <p className="mt-1.5 text-sm text-status-suspended">{errors.phone}</p>
          ) : (
            <p className="mt-1.5 text-xs text-white/40">
              Leave blank to skip — you can add and verify a phone later from your dashboard.
            </p>
          )}
        </div>

        {draft.phone_verified ? (
          <div
            role="status"
            className="rounded-lg border border-status-active/40 bg-status-active/10 px-3.5 py-2.5 text-sm text-status-active"
          >
            ✓ Phone verified
          </div>
        ) : draft.phone ? (
          <div className="rounded-xl border border-white/10 bg-bg-elevated p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Verify your phone</p>
                <p className="text-xs text-white/60">
                  We'll send a 6-digit SMS code.{" "}
                  <span className="text-white/40">(Dev stub — not a real SMS.)</span>
                </p>
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={sendStatus === "sending" || cooldown > 0}
                className="av-btn-secondary shrink-0"
              >
                {sendStatus === "sending"
                  ? "Sending…"
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : sendStatus === "sent"
                      ? "Resend code"
                      : "Send code"}
              </button>
            </div>
            {sendError ? (
              <p className="mt-2 text-sm text-status-suspended">{sendError}</p>
            ) : null}
            {devCode ? (
              <p className="mt-2 text-xs text-white/40">
                Dev code (stub mode): <span className="font-mono text-primary">{devCode}</span>
              </p>
            ) : null}

            {sendStatus === "sent" ? (
              <div className="mt-4">
                <label className="av-label">Enter code</label>
                <div className="flex gap-2">
                  {code.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        codeInputsRef.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      onPaste={handleCodePaste}
                      aria-label={`Code digit ${i + 1}`}
                      className="h-12 w-11 rounded-lg border border-white/10 bg-bg text-center text-lg font-semibold text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  ))}
                </div>
                {verifyStatus === "verifying" ? (
                  <p className="mt-2 text-xs text-white/50">Verifying…</p>
                ) : null}
                {verifyError ? (
                  <p className="mt-2 text-sm text-status-suspended">{verifyError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <StepNavigation
        onNext={handleNext}
        secondaryAction={
          draft.phone && !draft.phone_verified ? (
            <button
              type="button"
              onClick={handleSkip}
              className="av-btn-secondary sm:w-auto"
            >
              Skip for now
            </button>
          ) : null
        }
      />
    </div>
  );
}
