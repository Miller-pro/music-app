"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PlusCircle, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { PublishersTable } from "@/components/admin/PublishersTable";
import { PublisherDetailModal } from "@/components/admin/PublisherDetailModal";
import type {
  PublisherFilter,
  PublisherListItem,
  PublisherListResult,
  PublisherSortField,
} from "@/lib/db/admin-queries";

const FILTERS: Array<{ value: PublisherFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "incomplete", label: "Incomplete" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminPublishersPage() {
  const searchParams = useSearchParams();
  const initialFocus = searchParams.get("focus");

  const [filter, setFilter] = useState<PublisherFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<PublisherSortField>("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<PublisherListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalId, setModalId] = useState<string | null>(initialFocus);
  const [modalOpen, setModalOpen] = useState(!!initialFocus);

  // Debounce the search input — keystroke -> fetch is brittle on large tables.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchPublishers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sort,
        direction,
        filter,
        search: debouncedSearch,
      });
      const res = await fetch(`/api/admin/publishers?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch publishers");
      const json = (await res.json()) as PublisherListResult;
      setData(json);
    } catch {
      toast.error("Couldn't load publishers");
    } finally {
      setLoading(false);
    }
  }, [page, sort, direction, filter, debouncedSearch]);

  useEffect(() => {
    void fetchPublishers();
  }, [fetchPublishers]);

  // Reset page when filters change.
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch, sort, direction]);

  const handleSort = (field: PublisherSortField) => {
    if (sort === field) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setDirection("asc");
    }
  };

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data]);

  const openModal = (p: PublisherListItem) => {
    setModalId(p.id);
    setModalOpen(true);
  };

  const onTableAction = async (
    action: "view" | "edit" | "approve" | "reject" | "more",
    p: PublisherListItem,
  ) => {
    if (action === "view" || action === "edit" || action === "more") {
      openModal(p);
      return;
    }
    if (action === "approve") {
      const res = await fetch(`/api/admin/publishers/${p.id}/approve`, { method: "POST" });
      if (res.ok) {
        toast.success(`Approved ${p.publisher_id}`);
        void fetchPublishers();
      } else {
        toast.error("Failed to approve");
      }
      return;
    }
    if (action === "reject") {
      // Inline reject from the table opens the modal — admins should
      // always supply a reason, which lives in the modal flow.
      openModal(p);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Publishers</h1>
          <p className="text-sm text-white/50">
            {data ? `${data.total.toLocaleString()} total` : "Loading…"}
          </p>
        </div>
        <button
          type="button"
          className="av-btn-primary inline-flex items-center gap-2"
          onClick={() => toast("Manual publisher creation coming soon", { icon: "🛠" })}
        >
          <PlusCircle className="h-4 w-4" />
          New publisher
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Search by name, email, domain, or publisher ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="av-input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/5 bg-bg-elevated text-white/70 hover:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <PublishersTable
        publishers={data?.publishers ?? []}
        loading={loading && !data}
        sort={sort}
        direction={direction}
        onSort={handleSort}
        onRowClick={openModal}
        onAction={onTableAction}
        emptyHint={
          debouncedSearch
            ? `No publishers match "${debouncedSearch}"`
            : filter !== "all"
              ? `No ${filter} publishers right now`
              : "No publishers yet"
        }
      />

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <p>
            Page <span className="text-white">{data.page}</span> of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 items-center gap-1 rounded-lg bg-bg-elevated px-3 text-white/80 hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 items-center gap-1 rounded-lg bg-bg-elevated px-3 text-white/80 hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <PublisherDetailModal
        publisherId={modalId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onChanged={fetchPublishers}
      />
    </div>
  );
}
