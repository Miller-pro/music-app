"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, findCountry } from "@/lib/utils/country-list";

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  id,
}: {
  value?: string;
  onChange: (code: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? COUNTRIES.filter(
          (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
        )
      : [
          ...COUNTRIES.filter((c) => c.common),
          ...COUNTRIES.filter((c) => !c.common),
        ];
    return list;
  }, [query]);

  const selected = value ? findCountry(value) : undefined;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="av-input flex items-center justify-between text-left"
      >
        <span className={selected ? "text-white" : "text-white/40"}>
          {selected ? (
            <>
              <span className="mr-2">{selected.flag}</span>
              {selected.name}
            </>
          ) : (
            placeholder
          )}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-white/40">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-white/10 bg-bg-elevated shadow-2xl">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="av-input"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-2 text-sm text-white/50">No matches</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === c.code}
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-center gap-3 px-3.5 py-2 text-left text-sm hover:bg-white/5 ${
                      value === c.code ? "bg-white/5" : ""
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span className="flex-1 text-white/90">{c.name}</span>
                    <span className="text-xs text-white/40">{c.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
