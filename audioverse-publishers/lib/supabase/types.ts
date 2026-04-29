// Minimal hand-written DB types for Phase 1. Regenerate with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// once the project is linked.

export type PlatformType = "website" | "ios_app" | "android_app";
export type PublisherStatus =
  | "incomplete"
  | "pending"
  | "active"
  | "suspended"
  | "rejected";
export type VerificationType = "email" | "domain" | "ads_txt" | "phone";
export type DomainVerificationMethod = "meta_tag" | "dns_txt" | "html_file";

export interface PublisherRow {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  phone_verified: boolean;
  platform_type: PlatformType | null;
  domain: string | null;
  bundle_id: string | null;
  developer_url: string | null;
  app_store_url: string | null;
  app_name: string | null;
  publisher_id: string;
  email_verified: boolean;
  email_verified_at: string | null;
  domain_verified: boolean;
  domain_verified_at: string | null;
  domain_verification_method: DomainVerificationMethod | null;
  domain_verification_token: string;
  ads_txt_verified: boolean;
  ads_txt_verified_at: string | null;
  ads_txt_last_checked: string | null;
  ads_txt_etag: string | null;
  phone_verified_at: string | null;
  status: PublisherStatus;
  monthly_users: number | null;
  primary_country: string | null;
  traffic_sources: Record<string, unknown> | null;
  signup_ip: string | null;
  signup_user_agent: string | null;
  recaptcha_score: number | null;
  fraud_flags: string[] | null;
  stripe_account_id: string | null;
  payout_enabled: boolean;
  email_preferences: Record<string, unknown> | null;
  consented_at: string | null;
  data_processing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface VerificationAttemptRow {
  id: string;
  publisher_id: string;
  verification_type: VerificationType;
  method: string | null;
  attempted_at: string;
  success: boolean;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

export interface RequiredLineRow {
  id: string;
  line_template: string;
  priority: "required" | "optional";
  description: string | null;
  active: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      publishers: {
        Row: PublisherRow;
        Insert: Partial<PublisherRow> &
          Pick<PublisherRow, "user_id" | "email" | "publisher_id" | "domain_verification_token">;
        Update: Partial<PublisherRow>;
      };
      verification_attempts: {
        Row: VerificationAttemptRow;
        Insert: Partial<VerificationAttemptRow> &
          Pick<VerificationAttemptRow, "publisher_id" | "verification_type" | "success">;
        Update: Partial<VerificationAttemptRow>;
      };
      required_lines: {
        Row: RequiredLineRow;
        Insert: Partial<RequiredLineRow> & Pick<RequiredLineRow, "line_template">;
        Update: Partial<RequiredLineRow>;
      };
      phone_verification_codes: {
        Row: {
          id: string;
          publisher_id: string;
          code_hash: string;
          phone: string;
          expires_at: string;
          consumed_at: string | null;
          attempts: number;
          created_at: string;
        };
        Insert: {
          publisher_id: string;
          code_hash: string;
          phone: string;
          expires_at: string;
        };
        Update: Partial<{
          consumed_at: string | null;
          attempts: number;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
