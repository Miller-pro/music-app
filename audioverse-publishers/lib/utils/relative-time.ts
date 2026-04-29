// Mini date-fns-ish relative-time. Client-side so we don't bloat RSC HTML
// with server-rendered strings that'd be stale the moment they hydrated.
export function relativeTime(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const then = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - then.getTime();
  if (Number.isNaN(diff)) return "—";
  if (diff < 45_000) return "just now";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return then.toLocaleDateString();
}
