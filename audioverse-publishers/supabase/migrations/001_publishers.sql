-- AudioVerse Publishers — Phase 1 schema
-- Creates: publishers, verification_attempts, required_lines, phone_verification_codes
-- Plus: enums, indexes, triggers, RLS policies.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type platform_type as enum ('website', 'ios_app', 'android_app');
exception when duplicate_object then null; end $$;

do $$ begin
  create type publisher_status as enum ('incomplete', 'pending', 'active', 'suspended', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_type as enum ('email', 'domain', 'ads_txt', 'phone');
exception when duplicate_object then null; end $$;

do $$ begin
  create type domain_verification_method as enum ('meta_tag', 'dns_txt', 'html_file');
exception when duplicate_object then null; end $$;

do $$ begin
  create type required_line_priority as enum ('required', 'optional');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- publishers
-- ---------------------------------------------------------------------------
create table if not exists public.publishers (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid not null references auth.users(id) on delete cascade,

  -- Contact
  name                        text,
  email                       text not null,
  company                     text,
  phone                       text,
  phone_verified              boolean not null default false,
  phone_verified_at           timestamptz,

  -- Platform
  platform_type               platform_type,
  domain                      text,
  bundle_id                   text,
  developer_url               text,
  app_store_url               text,
  app_name                    text,

  -- Publisher-facing identifier, format: pub-XXXXXXXXXX (10 chars after prefix)
  publisher_id                text not null unique,

  -- Verification: email
  email_verified              boolean not null default false,
  email_verified_at           timestamptz,

  -- Verification: domain
  domain_verified             boolean not null default false,
  domain_verified_at          timestamptz,
  domain_verification_method  domain_verification_method,
  domain_verification_token   text not null,

  -- Verification: ads.txt / app-ads.txt
  ads_txt_verified            boolean not null default false,
  ads_txt_verified_at         timestamptz,
  ads_txt_last_checked        timestamptz,
  ads_txt_etag                text,

  -- Lifecycle status
  status                      publisher_status not null default 'incomplete',

  -- Audience stats
  monthly_users               integer,
  primary_country             text,
  traffic_sources             jsonb,

  -- Fraud signals
  signup_ip                   inet,
  signup_user_agent           text,
  recaptcha_score             numeric(3,2),
  fraud_flags                 text[] not null default '{}',

  -- Payouts (Stripe Connect — Phase 2)
  stripe_account_id           text,
  payout_enabled              boolean not null default false,

  -- Preferences
  email_preferences           jsonb not null default '{}'::jsonb,

  -- GDPR
  consented_at                timestamptz,
  data_processing_consent     boolean not null default false,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- Basic shape check: pub- prefix, 14 chars total (pub- + 10). Loose enough
  -- to not fight the generator, strict enough to reject garbage.
  constraint publisher_id_format check (publisher_id ~ '^pub-[A-Z0-9]{10}$')
);

-- One publisher row per user. (Easier to lift in Phase 2 if multi-property
-- publishers are needed, than to enforce later.)
create unique index if not exists publishers_user_id_unique on public.publishers (user_id);

create index if not exists publishers_status_idx       on public.publishers (status);
create index if not exists publishers_publisher_id_idx on public.publishers (publisher_id);
create index if not exists publishers_email_idx        on public.publishers (lower(email));
create index if not exists publishers_domain_idx       on public.publishers (lower(domain));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists publishers_set_updated_at on public.publishers;
create trigger publishers_set_updated_at
  before update on public.publishers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- verification_attempts
-- Append-only audit log of every verification try (success or fail).
-- ---------------------------------------------------------------------------
create table if not exists public.verification_attempts (
  id                 uuid primary key default uuid_generate_v4(),
  publisher_id       uuid not null references public.publishers(id) on delete cascade,
  verification_type  verification_type not null,
  method             text,
  attempted_at       timestamptz not null default now(),
  success            boolean not null,
  error_message      text,
  metadata           jsonb
);

create index if not exists verification_attempts_publisher_idx
  on public.verification_attempts (publisher_id, attempted_at desc);
create index if not exists verification_attempts_type_idx
  on public.verification_attempts (verification_type, attempted_at desc);

-- ---------------------------------------------------------------------------
-- required_lines
-- Flexible registry of ads.txt lines publishers must include. Future-proofs
-- against adding an SSP partner or rotating the TAG-ID without schema change.
-- ---------------------------------------------------------------------------
create table if not exists public.required_lines (
  id            uuid primary key default uuid_generate_v4(),
  line_template text not null,
  priority      required_line_priority not null default 'required',
  description   text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed the default AudioVerse line. {publisher_id} is substituted at runtime.
insert into public.required_lines (line_template, priority, description)
values (
  'audioverse.com, {publisher_id}, DIRECT, f08c47fec0942fa0',
  'required',
  'AudioVerse direct authorized seller line (IAB ads.txt v1.1)'
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- phone_verification_codes
-- Short-lived 6-digit codes hashed before storage. Rate limiting enforced at
-- the API layer (max 3 sends per 5 min) via row counts here.
-- ---------------------------------------------------------------------------
create table if not exists public.phone_verification_codes (
  id            uuid primary key default uuid_generate_v4(),
  publisher_id  uuid not null references public.publishers(id) on delete cascade,
  code_hash     text not null,
  phone         text not null,
  expires_at    timestamptz not null,
  consumed_at   timestamptz,
  attempts      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists phone_codes_publisher_idx
  on public.phone_verification_codes (publisher_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.publishers              enable row level security;
alter table public.verification_attempts   enable row level security;
alter table public.phone_verification_codes enable row level security;
alter table public.required_lines          enable row level security;

-- Helper: is current JWT the configured admin?
-- We stash the admin email in a GUC-like setting via a function so it isn't
-- hard-coded in the policy body. The app can override at deploy time.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(
    (auth.jwt() ->> 'email')::text = 'dean@audioverse.com',
    false
  );
$$;

-- publishers: users see only their own row. Admin sees all.
drop policy if exists publishers_select_own on public.publishers;
create policy publishers_select_own on public.publishers
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists publishers_insert_own on public.publishers;
create policy publishers_insert_own on public.publishers
  for insert with check (auth.uid() = user_id);

drop policy if exists publishers_update_own on public.publishers;
create policy publishers_update_own on public.publishers
  for update using (auth.uid() = user_id or public.is_admin())
             with check (auth.uid() = user_id or public.is_admin());

-- Deletes are service-role only (RLS denies by default without a policy).

-- verification_attempts: readable by the owning publisher; writes are
-- service-role only (API routes use the admin client for inserts).
drop policy if exists verif_attempts_select_own on public.verification_attempts;
create policy verif_attempts_select_own on public.verification_attempts
  for select using (
    publisher_id in (select id from public.publishers where user_id = auth.uid())
    or public.is_admin()
  );

-- phone_verification_codes: never exposed to end-users.
-- Default-deny; service role bypasses RLS.

-- required_lines: readable by everyone (published contract); admin-only writes.
drop policy if exists required_lines_select_all on public.required_lines;
create policy required_lines_select_all on public.required_lines
  for select using (true);

drop policy if exists required_lines_admin_write on public.required_lines;
create policy required_lines_admin_write on public.required_lines
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.publishers to authenticated;
grant select on public.verification_attempts to authenticated;
grant select on public.required_lines to anon, authenticated;
