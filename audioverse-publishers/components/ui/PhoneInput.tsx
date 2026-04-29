"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, findCountry } from "@/lib/utils/country-list";

// Simple international phone input. Outputs an E.164 string via `onChange`.
// Not using libphonenumber — formatting is best-effort (digits grouped in
// fours) and validation happens in Zod upstream.
export function PhoneInput({
  value,
  onChange,
  defaultCountry = "US",
  id,
  invalid,
}: {
  value: string;
  onChange: (phoneE164: string) => void;
  defaultCountry?: string;
  id?: string;
  invalid?: boolean;
}) {
  const initialCountry = useMemo(() => {
    if (!value) return defaultCountry;
    const match = COUNTRIES.find((c) => value.startsWith(c.dial));
    return match?.code ?? defaultCountry;
  }, [value, defaultCountry]);

  const [countryCode, setCountryCode] = useState(initialCountry);
  const [local, setLocal] = useState(() => {
    const c = findCountry(initialCountry);
    return c && value?.startsWith(c.dial) ? value.slice(c.dial.length) : "";
  });
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const country = findCountry(countryCode);

  useEffect(() => {
    if (!country) return;
    const digits = local.replace(/\D/g, "");
    onChange(digits ? `${country.dial}${digits}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, country?.dial]);

  return (
    <div ref={wrapRef} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-l-lg border border-r-0 border-white/10 bg-bg-muted px-3 text-sm hover:bg-bg-elevated ${
          invalid ? "border-status-suspended" : ""
        }`}
        aria-label="Country code"
      >
        <span>{country?.flag}</span>
        <span className="text-white/70">{country?.dial}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" className="text-white/40">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="555 123 4567"
        aria-invalid={invalid}
        className={`av-input rounded-l-none ${invalid ? "border-status-suspended focus:border-status-suspended focus:ring-status-suspended/30" : ""}`}
      />
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-white/10 bg-bg-elevated shadow-2xl">
          <ul role="listbox" className="max-h-64 overflow-y-auto">
            {COUNTRIES.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCountryCode(c.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/5 ${
                    countryCode === c.code ? "bg-white/5" : ""
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="flex-1 text-white/90">{c.name}</span>
                  <span className="text-xs text-white/40">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
