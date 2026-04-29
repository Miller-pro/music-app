// POST /api/verification/check-now
// Thin alias to /api/verification/ads-txt — dashboard "Check Now" button
// calls this to make the intent clearer in the URL. Kept as a separate
// route so we can later fan out to multiple verification layers in one
// request (ads.txt + phone re-validation + payout status, etc.).
export const runtime = "nodejs";
export { POST } from "../ads-txt/route";
