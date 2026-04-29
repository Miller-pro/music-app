// Publisher-facing ID. Format: pub-XXXXXXXXXX (10 uppercase alphanumerics).
// Server double-checks uniqueness at insert time; a collision in 10 chars of
// 36-char alphabet is ~1 in 3.6e15, so retries will essentially never fire.

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generatePublisherId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = "pub-";
  for (let i = 0; i < bytes.length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function isValidPublisherId(id: string): boolean {
  return /^pub-[A-Z0-9]{10}$/.test(id);
}

export function adsTxtLineFor(publisherId: string): string {
  return `audioverse.com, ${publisherId}, DIRECT, f08c47fec0942fa0`;
}
