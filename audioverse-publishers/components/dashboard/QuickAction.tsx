"use client";

export function QuickAction({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  disabled,
  loading,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-bg-elevated p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="flex-1 text-sm text-white/60">{description}</p>
      {href ? (
        <a
          href={href}
          className="av-btn-secondary w-full"
          aria-disabled={disabled}
        >
          {actionLabel}
        </a>
      ) : (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled || loading}
          className="av-btn-secondary w-full"
        >
          {loading ? "Working…" : actionLabel}
        </button>
      )}
    </div>
  );
}
