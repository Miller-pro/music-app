import { promises as dns } from "node:dns";
import type { AdsTxtResult, VerificationResult } from "@/types/api";

// User-agent identifies our bot for site operators who grep logs.
const BOT_UA = "AudioVerseBot/1.0 (+https://audioverse.com/bot)";
const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": BOT_UA,
        Accept: "text/html, */*;q=0.8",
        ...(init?.headers ?? {}),
      },
      redirect: "follow",
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Domain: meta tag
// Fetches the homepage, scans for <meta name="audioverse-verification"
// content="..."/>. Uses a regex instead of pulling in cheerio/jsdom — a
// single attribute lookup doesn't justify ~500kb of deps.
// ---------------------------------------------------------------------------
export async function verifyDomainMetaTag(
  domain: string,
  token: string,
): Promise<VerificationResult> {
  const url = `https://${domain}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      return {
        success: false,
        error: `Homepage returned HTTP ${res.status}. Make sure ${domain} is reachable.`,
        detail: `status=${res.status}`,
      };
    }
    // Cap read to 512kb — no real homepage needs more to find a meta tag,
    // and this prevents a malicious host from hanging us with a megabyte
    // of HTML.
    const html = (await res.text()).slice(0, 524_288);
    if (findMetaTag(html, "audioverse-verification", token)) {
      return { success: true };
    }
    return {
      success: false,
      error:
        "Didn't find the verification meta tag on your homepage. Double-check the <head> section and try again.",
    };
  } catch (err) {
    return networkError(err);
  }
}

// Parses <meta> tags with any attribute order: name/content can swap, and
// quote style varies. Case-insensitive on names.
export function findMetaTag(html: string, name: string, content: string): boolean {
  const metaRe = /<meta\b[^>]*>/gi;
  const attrRe = /(\w[\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = metaRe.exec(html))) {
    const tag = match[0];
    const attrs: Record<string, string> = {};
    let a: RegExpExecArray | null;
    attrRe.lastIndex = 0;
    while ((a = attrRe.exec(tag))) {
      attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? "";
    }
    if (attrs.name?.toLowerCase() === name.toLowerCase() && attrs.content === content) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Domain: DNS TXT record
// Looks for audioverse-verify=<token> at the apex of the domain.
// ---------------------------------------------------------------------------
export async function verifyDomainDNS(
  domain: string,
  token: string,
): Promise<VerificationResult> {
  try {
    const records = await dns.resolveTxt(domain);
    const expected = `audioverse-verify=${token}`;
    for (const row of records) {
      // dns.resolveTxt returns string[][] — each TXT record is split into
      // <=255-byte chunks and we need to rejoin them.
      const joined = row.join("").trim();
      if (joined === expected) return { success: true };
    }
    return {
      success: false,
      error:
        "Didn't find the TXT record yet. DNS can take a few minutes to propagate — give it 5 and try again.",
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        success: false,
        error: "No TXT records found on this domain yet.",
        detail: code,
      };
    }
    return networkError(err);
  }
}

// ---------------------------------------------------------------------------
// Domain: HTML file
// Fetches https://domain/audioverse-verify.html and compares to token.
// ---------------------------------------------------------------------------
export async function verifyDomainHtmlFile(
  domain: string,
  token: string,
): Promise<VerificationResult> {
  const url = `https://${domain}/audioverse-verify.html`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.status === 404) {
      return {
        success: false,
        error: `File not found at /audioverse-verify.html. Make sure it's uploaded to the root of ${domain}.`,
        detail: "status=404",
      };
    }
    if (!res.ok) {
      return {
        success: false,
        error: `Verification file returned HTTP ${res.status}.`,
        detail: `status=${res.status}`,
      };
    }
    const body = (await res.text()).trim();
    if (body === token) return { success: true };
    return {
      success: false,
      error:
        "Verification file contents don't match. Make sure the file contains only the token, nothing else.",
    };
  } catch (err) {
    return networkError(err);
  }
}

// ---------------------------------------------------------------------------
// ads.txt / app-ads.txt
// Fetches the file, handles 304, parses lines, looks for the required
// AudioVerse row. Case-insensitive domain and role, whitespace-tolerant.
// ---------------------------------------------------------------------------
export async function verifyAdsTxt(
  url: string,
  requiredLine: string,
  previousEtag?: string,
): Promise<AdsTxtResult> {
  try {
    const res = await fetchWithTimeout(url, {
      headers: previousEtag ? { "If-None-Match": previousEtag } : {},
    });

    if (res.status === 304) {
      return { found: false, notModified: true, etag: previousEtag };
    }
    if (res.status === 404) {
      return {
        found: false,
        error: `ads.txt not found at ${url}. Create the file and paste the required line.`,
        detail: "status=404",
      };
    }
    if (!res.ok) {
      return {
        found: false,
        error: `ads.txt fetch failed with HTTP ${res.status}.`,
        detail: `status=${res.status}`,
      };
    }

    const content = (await res.text()).slice(0, 256 * 1024);
    const etag = res.headers.get("etag") ?? undefined;
    const found = adsTxtContains(content, requiredLine);

    return {
      found,
      etag,
      content: content.slice(0, 500),
    };
  } catch (err) {
    return {
      found: false,
      error: networkError(err).error,
      detail: (err as Error)?.message,
    };
  }
}

// Parses ads.txt-style lines (RFC-like: comma-separated fields + optional
// comment starting with #) and checks for a match ignoring case and
// whitespace. A required line like "audioverse.com, pub-ABC, DIRECT, TAG"
// should match "audioverse.com,pub-ABC,DIRECT,TAG" or any capitalization.
export function adsTxtContains(content: string, requiredLine: string): boolean {
  const normalize = (s: string) =>
    s
      .split("#")[0] // strip inline comment
      .split(",")
      .map((f) => f.trim().toLowerCase())
      .filter(Boolean)
      .join(",");

  const needle = normalize(requiredLine);
  if (!needle) return false;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (normalize(line) === needle) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function networkError(err: unknown): VerificationResult {
  const e = err as Error & { code?: string; name?: string };
  if (e?.name === "AbortError") {
    return { success: false, error: "The request timed out. Try again in a moment.", detail: "timeout" };
  }
  if (e?.code === "ENOTFOUND") {
    return { success: false, error: "Couldn't resolve that domain.", detail: e.code };
  }
  if (e?.code === "ECONNREFUSED") {
    return { success: false, error: "Server refused the connection.", detail: e.code };
  }
  return {
    success: false,
    error: "Couldn't reach the site. Check that it's live and try again.",
    detail: e?.message,
  };
}

/** Build the ads.txt / app-ads.txt URL for a publisher's platform. */
export function adsTxtUrlFor(input: {
  platform_type: "website" | "ios_app" | "android_app" | null;
  domain: string | null;
  developer_url: string | null;
}): string | null {
  if (input.platform_type === "website" && input.domain) {
    return `https://${input.domain}/ads.txt`;
  }
  if ((input.platform_type === "ios_app" || input.platform_type === "android_app") && input.developer_url) {
    try {
      const u = new URL(input.developer_url);
      return `${u.origin}/app-ads.txt`;
    } catch {
      return null;
    }
  }
  return null;
}
