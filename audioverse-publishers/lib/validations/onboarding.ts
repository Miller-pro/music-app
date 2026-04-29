import { z } from "zod";

export const platformSchema = z.object({
  platform_type: z.enum(["website", "ios_app", "android_app"], {
    errorMap: () => ({ message: "Pick a platform to continue" }),
  }),
});

// Domain: accept bare hostnames (example.com, app.example.co.uk) — no scheme,
// no path. Blocked list keeps out common typos and throwaway hosts.
const BLOCKED_DOMAINS = new Set([
  "localhost",
  "example.com",
  "example.org",
  "test.com",
  "test.test",
]);
const domainRegex = /^(?!-)(?:[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}$/;
export const domainField = z
  .string()
  .trim()
  .toLowerCase()
  .min(4, "Too short")
  .max(253, "Too long")
  .regex(domainRegex, "Enter a valid domain (e.g. example.com)")
  .refine((d) => !BLOCKED_DOMAINS.has(d), "Please use your real production domain");

// Reverse-DNS style: com.company.app. At least 2 segments, each starts with
// a letter. Not too strict — iOS and Android both allow long tails.
export const bundleIdField = z
  .string()
  .trim()
  .min(3)
  .max(155)
  .regex(
    /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/,
    "Use reverse-domain format, e.g. com.yourcompany.app",
  );

const urlField = z
  .string()
  .trim()
  .url("Enter a valid URL (including https://)");

const monthlyUsers = z
  .number({ invalid_type_error: "Required" })
  .int()
  .min(0, "Can't be negative")
  .max(100_000_000, "Too high");

// Step 2 — runtime discriminated-union keyed by platform_type.
export const basicInfoSchema = z.discriminatedUnion("platform_type", [
  z.object({
    platform_type: z.literal("website"),
    domain: domainField,
    app_name: z.string().trim().min(1, "Required").max(120),
    monthly_users: monthlyUsers,
    primary_country: z.string().length(2, "Pick a country"),
  }),
  z.object({
    platform_type: z.literal("ios_app"),
    app_name: z.string().trim().min(1, "Required").max(120),
    bundle_id: bundleIdField,
    developer_url: urlField,
    app_store_url: urlField.optional().or(z.literal("")),
    monthly_users: monthlyUsers,
    primary_country: z.string().length(2, "Pick a country"),
  }),
  z.object({
    platform_type: z.literal("android_app"),
    app_name: z.string().trim().min(1, "Required").max(120),
    bundle_id: bundleIdField,
    developer_url: urlField,
    app_store_url: urlField.optional().or(z.literal("")),
    monthly_users: monthlyUsers,
    primary_country: z.string().length(2, "Pick a country"),
  }),
]);

export const domainVerificationSchema = z.object({
  method: z.enum(["meta_tag", "dns_txt", "html_file"]),
  verified: z.boolean(),
  skipped: z.boolean().default(false),
});

export const adsTxtSchema = z.object({
  verified: z.boolean(),
  skipped: z.boolean().default(false),
});

// E.164: leading +, 8–15 digits (ITU-T E.164 max is 15).
export const phoneField = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Enter phone in international format (e.g. +15551234567)");

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: phoneField,
  phone_verified: z.literal(true, {
    errorMap: () => ({ message: "Please verify your phone number" }),
  }),
});

export const termsSchema = z.object({
  tos_accepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms" }),
  }),
  privacy_accepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Privacy Policy" }),
  }),
  email_consent: z.literal(true, {
    errorMap: () => ({ message: "We need to send you verification emails" }),
  }),
  data_consent: z.literal(true, {
    errorMap: () => ({ message: "Required for revenue sharing" }),
  }),
});

export type PlatformInput = z.infer<typeof platformSchema>;
export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type TermsInput = z.infer<typeof termsSchema>;
