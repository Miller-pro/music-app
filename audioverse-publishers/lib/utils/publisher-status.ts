import type { PublisherStatus } from "@/lib/supabase/types";

interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

const STATUS_META: Record<PublisherStatus, StatusMeta> = {
  incomplete: {
    label: "Incomplete",
    color: "text-status-incomplete",
    bg: "bg-status-incomplete/10",
    border: "border-status-incomplete/30",
    icon: "•",
  },
  pending: {
    label: "Pending",
    color: "text-status-pending",
    bg: "bg-status-pending/10",
    border: "border-status-pending/30",
    icon: "⏳",
  },
  active: {
    label: "Active",
    color: "text-status-active",
    bg: "bg-status-active/10",
    border: "border-status-active/30",
    icon: "✓",
  },
  suspended: {
    label: "Suspended",
    color: "text-status-suspended",
    bg: "bg-status-suspended/10",
    border: "border-status-suspended/30",
    icon: "⏸",
  },
  rejected: {
    label: "Rejected",
    color: "text-status-suspended",
    bg: "bg-status-suspended/10",
    border: "border-status-suspended/30",
    icon: "✗",
  },
};

export function statusMeta(status: PublisherStatus): StatusMeta {
  return STATUS_META[status];
}

export function statusColor(status: PublisherStatus): string {
  return STATUS_META[status].color;
}

export function statusIcon(status: PublisherStatus): string {
  return STATUS_META[status].icon;
}

export function statusLabel(status: PublisherStatus): string {
  return STATUS_META[status].label;
}
