import type {
  DomainVerificationMethod,
  PlatformType,
  PublisherRow,
  VerificationType,
} from "@/lib/supabase/types";

export interface VerificationResult {
  success: boolean;
  error?: string;
  /** HTTP status or DNS error context — for logs, not user-facing. */
  detail?: string;
}

export interface AdsTxtResult {
  found: boolean;
  etag?: string;
  /** First 500 chars of the fetched file, for diagnostic display. */
  content?: string;
  notModified?: boolean;
  error?: string;
  detail?: string;
}

export interface FraudCheckResult {
  suspicious: boolean;
  flags: string[];
  /** Human-readable reasons, suitable for admin dashboards. */
  reasons?: string[];
}

export interface PublisherCreateRequest {
  platform_type: PlatformType;
  domain?: string;
  app_name?: string;
  bundle_id?: string;
  developer_url?: string;
  app_store_url?: string;
  monthly_users?: number;
  primary_country?: string;
  domain_verification_token?: string;
  domain_verification_method?: DomainVerificationMethod;
  domain_verified?: boolean;
  publisher_id?: string;
  ads_txt_verified?: boolean;
  name?: string;
  company?: string;
  phone?: string;
  phone_verified?: boolean;
  tos_accepted: boolean;
  privacy_accepted: boolean;
  email_consent: boolean;
  data_consent: boolean;
  recaptcha_token?: string;
}

export interface ApiError {
  error: string;
  field?: string;
  /** Machine-readable code — do not show to users directly. */
  code?: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION" | "RATE_LIMITED" | "CONFLICT" | "INTERNAL";
}

export interface VerifyDomainRequest {
  method: DomainVerificationMethod;
}

export interface VerifyAdsTxtResponse {
  verified: boolean;
  pending: boolean;
  checked_at: string;
  content_preview?: string;
  message?: string;
}

export type { PublisherRow, VerificationType };
