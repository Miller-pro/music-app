"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
  size = "md",
}: {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  }[size];

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // Fallback: old browsers. Create temp textarea + execCommand.
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* swallow */
          } finally {
            document.body.removeChild(ta);
          }
        }
      }}
      aria-live="polite"
      className={`av-btn-secondary ${sizeClasses} ${className}`}
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}
