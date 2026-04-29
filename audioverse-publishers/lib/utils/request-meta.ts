import { headers } from "next/headers";

// Extract signup-time fraud signals from the incoming request.
// Server-only — relies on next/headers.
export function getRequestMeta(): { ip: string; userAgent: string } {
  const h = headers();

  // Vercel/Cloudflare/NGINX conventions. First value in x-forwarded-for is
  // the original client. Fall back through likely header names.
  const forwardedFor = h.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    // TODO(ip): Replace this localhost fallback once we're behind a real
    // proxy. Using 127.0.0.1 lets dev signups complete instead of failing
    // fraud checks on missing IP.
    "127.0.0.1";

  const userAgent = h.get("user-agent") || "unknown";

  return { ip, userAgent };
}
