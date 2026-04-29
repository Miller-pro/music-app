import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, requirePublisher } from "@/lib/middleware/auth";
import { apiRoute } from "@/lib/middleware/errors";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { adsTxtUrlFor, verifyAdsTxt } from "@/lib/utils/verification";
import { adsTxtLineFor } from "@/lib/utils/publisher-id";

export const runtime = "nodejs";

// POST /api/verification/ads-txt
// No body — operates on the authenticated user's publisher row. Used both
// by the onboarding wizard (step 4) and the dashboard "Check Now" button.
export const POST = apiRoute(async () => {
  const { user } = await requireAuth();
  const publisher = await requirePublisher(user.id);

  const rl = checkRateLimit(`verify-adstxt:${publisher.id}`, 10, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Please wait before re-checking.", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  const url = adsTxtUrlFor(publisher);
  if (!url) {
    return NextResponse.json(
      { error: "Missing domain/developer URL — complete your profile.", code: "VALIDATION" },
      { status: 400 },
    );
  }

  const requiredLine = adsTxtLineFor(publisher.publisher_id);
  const result = await verifyAdsTxt(url, requiredLine, publisher.ads_txt_etag ?? undefined);

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  await admin.from("verification_attempts").insert({
    publisher_id: publisher.id,
    verification_type: "ads_txt",
    method: "http",
    success: result.found,
    error_message: result.found ? null : (result.error ?? "required line not found"),
    metadata: {
      url,
      not_modified: !!result.notModified,
      detail: result.detail,
    },
  });

  // On 304 we trust the previous verification outcome — nothing on the
  // site has changed since we last looked.
  const foundOrCached = result.found || (!!result.notModified && publisher.ads_txt_verified);

  const updates: Record<string, unknown> = { ads_txt_last_checked: nowIso };
  if (result.etag) updates.ads_txt_etag = result.etag;
  if (foundOrCached) {
    updates.ads_txt_verified = true;
    updates.ads_txt_verified_at = publisher.ads_txt_verified_at ?? nowIso;
    // Once the file is present and domain is verified, the account can
    // move to "active". Keep manual-review statuses sticky.
    if (
      publisher.domain_verified &&
      publisher.phone_verified &&
      publisher.status !== "suspended" &&
      publisher.status !== "rejected" &&
      publisher.status !== "pending"
    ) {
      updates.status = "active";
    }
  }

  await admin.from("publishers").update(updates).eq("id", publisher.id);

  return NextResponse.json({
    verified: !!foundOrCached,
    pending: !foundOrCached && !result.error,
    checked_at: nowIso,
    content_preview: result.content,
    message:
      foundOrCached
        ? "Found the required line. You're all set."
        : result.notModified
          ? "ads.txt hasn't changed since last check."
          : (result.error ??
            "Required line not found yet — ads.txt can take a few minutes to propagate."),
  });
});
