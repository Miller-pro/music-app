import { createAdminClient } from "@/lib/supabase/server";
import { apiRoute } from "@/lib/middleware/errors";
import type { PublisherRow } from "@/lib/supabase/types";
import { publisherShare } from "@/lib/db/admin-queries";

export const runtime = "nodejs";

const COLUMNS: Array<{ key: keyof PublisherRow | "publisher_share"; label: string }> = [
  { key: "publisher_id", label: "Publisher ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "platform_type", label: "Platform" },
  { key: "domain", label: "Domain" },
  { key: "bundle_id", label: "Bundle ID" },
  { key: "primary_country", label: "Country" },
  { key: "monthly_users", label: "Monthly users" },
  { key: "domain_verified", label: "Domain verified" },
  { key: "ads_txt_verified", label: "ads.txt verified" },
  { key: "phone_verified", label: "Phone verified" },
  { key: "publisher_share", label: "Publisher revenue (USD est.)" },
  { key: "created_at", label: "Created at" },
];

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const GET = apiRoute(async () => {
  const admin = createAdminClient();
  const { data } = await admin.from("publishers").select("*").order("created_at", { ascending: false });
  const rows = (data as PublisherRow[] | null) ?? [];

  const lines = [COLUMNS.map((c) => csvEscape(c.label)).join(",")];
  for (const row of rows) {
    const share = publisherShare(row.monthly_users).toFixed(2);
    const values = COLUMNS.map((c) => {
      if (c.key === "publisher_share") return csvEscape(share);
      return csvEscape((row as unknown as Record<string, unknown>)[c.key as string]);
    });
    lines.push(values.join(","));
  }

  const csv = lines.join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audioverse-publishers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
