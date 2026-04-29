"use client";

import { CopyButton } from "../ui/CopyButton";

// Lightweight code display — no syntax highlighter (saves a ~100kb dep).
// We pass `language` as a visual label only. If we ever need true
// highlighting, switch to shiki or prism-react-renderer.
export function CodeSnippet({
  code,
  language = "html",
  label,
}: {
  code: string;
  language?: "html" | "dns" | "shell" | "text";
  label?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-bg">
      <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2">
        <span className="text-xs uppercase tracking-wider text-white/40">
          {label ?? language}
        </span>
        <CopyButton text={code} size="sm" />
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 text-sm text-white/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
