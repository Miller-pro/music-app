"use client";

import { scorePasswordStrength } from "@/lib/validations/auth";

const BAR_COLORS = [
  "bg-white/10",
  "bg-status-suspended",
  "bg-status-pending",
  "bg-primary",
  "bg-status-active",
];

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = scorePasswordStrength(password);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? BAR_COLORS[score] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-white/50">
        Strength: <span className="text-white/80">{label}</span>
      </p>
    </div>
  );
}
