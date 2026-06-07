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

// Derive the public origin (scheme://host) of the *current* request from proxy
// headers. This is the origin the user is actually on, so any auth redirect we
// build from it lands back on the same host — which is what PKCE needs, since
// the code-verifier cookie is host-scoped. Deriving it from the request (rather
// than a NEXT_PUBLIC_APP_URL env var) means a missing/wrong env value can't send
// the OAuth/email callback to a different origin and lose the verifier cookie.
//
// Server-only — relies on next/headers, so it works in Server Actions and Route
// Handlers alike. `fallbackUrl` (e.g. the route's own request URL) is used when
// no host header is present; NEXT_PUBLIC_APP_URL is the last resort.
export function getRequestOrigin(fallbackUrl?: string): string {
  const h = headers();

  // x-forwarded-host may carry a comma-separated proxy chain — take the first.
  const forwardedHost = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || h.get("host") || undefined;

  if (host) {
    const isLocal = host.startsWith("localhost") || host.startsWith("127.");
    const proto =
      h.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  if (fallbackUrl) return new URL(fallbackUrl).origin;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
}
