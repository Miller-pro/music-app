// Minimal in-memory sliding window. Good enough for Phase 1 single-instance
// dev + a single Vercel function invocation set. Swap for Upstash/Redis
// before traffic grows past one serverless instance.
//
// Key note: this state does NOT persist across cold starts, so attackers
// can reset counters by forcing deploys. The DB-backed check for phone
// codes (via phone_verification_codes row counts) is authoritative; this
// helper just keeps the hot path fast.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs?: number; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: max - bucket.count };
}

// Sweep expired buckets occasionally. Not critical — Map stays small in
// practice — but cheap insurance if the process lives a long time.
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k);
      }
    },
    5 * 60 * 1000,
  ).unref?.();
}
