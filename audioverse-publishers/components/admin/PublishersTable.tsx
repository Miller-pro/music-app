"use client";

import { useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { statusMeta } from "@/lib/utils/publisher-status";
import type { PublisherListItem, PublisherSortField } from "@/lib/db/admin-queries";

interface Props {
  publishers: PublisherListItem[];
  loading?: boolean;
  sort: PublisherSortField;
  direction: "asc" | "desc";
  onSort: (field: PublisherSortField) => void;
  onRowClick: (publisher: PublisherListItem) => void;
  onAction: (action: "view" | "edit" | "approve" | "reject" | "more", publisher: PublisherListItem) => void;
  emptyHint?: string;
}

const COLUMNS: Array<{ key: PublisherSortField; label: string; align?: "left" | "right" }> = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "domain", label: "Domain" },
  { key: "monthly_users", label: "Monthly users", align: "right" },
  { key: "revenue", label: "Revenue", align: "right" },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function PublishersTable({
  publishers,
  loading,
  sort,
  direction,
  onSort,
  onRowClick,
  onAction,
  emptyHint,
}: Props) {
  const rows = useMemo(() => publishers, [publishers]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/5 bg-bg-elevated">
        <div className="divide-y divide-white/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-3 flex-1 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-bg-elevated p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40">
          ∅
        </div>
        <p className="font-semibold text-white">No publishers yet</p>
        <p className="text-sm text-white/50">
          {emptyHint ?? "No publishers match the current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-bg-elevated">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-white/40">
            {COLUMNS.map((col) => {
              const active = sort === col.key;
              const Arrow = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <th
                  key={col.key}
                  className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className={`inline-flex items-center gap-1 transition-colors hover:text-white ${
                      active ? "text-white" : ""
                    }`}
                  >
                    {col.label}
                    <Arrow className="h-3 w-3" />
                  </button>
                </th>
              );
            })}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((p) => {
            const target = p.domain || p.bundle_id || "—";
            const meta = statusMeta(p.status);
            return (
              <tr
                key={p.id}
                className="group cursor-pointer transition-colors hover:bg-white/[0.03]"
                onClick={() => onRowClick(p)}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{p.name || p.email}</span>
                    <span className="font-mono text-xs text-white/40">{p.publisher_id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} size="sm" />
                </td>
                <td className="px-4 py-3 font-mono text-white/70">{target}</td>
                <td className="px-4 py-3 text-right text-white/70">
                  {p.monthly_users?.toLocaleString() ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-white">
                  {formatCurrency(p.publisher_share)}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      title="View"
                      onClick={() => onAction("view", p)}
                      icon={Eye}
                    />
                    <IconButton
                      title="Edit"
                      onClick={() => onAction("edit", p)}
                      icon={Pencil}
                    />
                    {p.status === "pending" ? (
                      <>
                        <IconButton
                          title="Approve"
                          onClick={() => onAction("approve", p)}
                          icon={Check}
                          className="text-status-active hover:bg-status-active/10"
                        />
                        <IconButton
                          title="Reject"
                          onClick={() => onAction("reject", p)}
                          icon={X}
                          className="text-status-suspended hover:bg-status-suspended/10"
                        />
                      </>
                    ) : null}
                    <IconButton
                      title="More"
                      onClick={() => onAction("more", p)}
                      icon={MoreHorizontal}
                    />
                  </div>
                  {/* Hint that the row is clickable */}
                  <span className={`ml-2 hidden text-xs ${meta.color} group-hover:hidden`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IconButton({
  icon: Icon,
  onClick,
  title,
  className = "",
}: {
  icon: typeof Eye;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/5 hover:text-white ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
