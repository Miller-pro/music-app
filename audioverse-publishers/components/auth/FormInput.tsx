"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const FormInput = forwardRef<HTMLInputElement, Props>(function FormInput(
  { label, error, hint, id, className = "", ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  const descId = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined;
  return (
    <div>
      <label htmlFor={inputId} className="av-label">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={descId}
        className={`av-input ${error ? "border-status-suspended focus:border-status-suspended focus:ring-status-suspended/30" : ""} ${className}`}
        {...rest}
      />
      {error ? (
        <p id={descId} className="mt-1.5 text-sm text-status-suspended">
          {error}
        </p>
      ) : hint ? (
        <p id={descId} className="mt-1.5 text-xs text-white/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
