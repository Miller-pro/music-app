import type { PublisherStatus } from "@/lib/supabase/types";

const COPY: Record<PublisherStatus, { label: string; classes: string; dot: string }> = {
  incomplete: {
    label: "Incomplete",
    classes: "bg-status-incomplete/10 text-status-incomplete border-status-incomplete/30",
    dot: "bg-status-incomplete",
  },
  pending: {
    label: "Pending review",
    classes: "bg-status-pending/10 text-status-pending border-status-pending/30",
    dot: "bg-status-pending",
  },
  active: {
    label: "Active",
    classes: "bg-status-active/10 text-status-active border-status-active/30",
    dot: "bg-status-active",
  },
  suspended: {
    label: "Suspended",
    classes: "bg-status-suspended/10 text-status-suspended border-status-suspended/30",
    dot: "bg-status-suspended",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-status-suspended/10 text-status-suspended border-status-suspended/30",
    dot: "bg-status-suspended",
  },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: PublisherStatus;
  size?: "sm" | "md" | "lg";
}) {
  const { label, classes, dot } = COPY[status];
  const sizeClasses =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : size === "sm"
        ? "px-2 py-0.5 text-xs"
        : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${sizeClasses} ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
