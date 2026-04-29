// Tokens used for domain ownership verification. 24 bytes → 32 base64url chars.
// Long enough to resist guessing, short enough to paste into a meta tag.
export function generateVerificationToken(): string {
  const bytes = new Uint8Array(24);
  // crypto is available in both Node 20+ (globalThis.crypto) and browsers.
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
