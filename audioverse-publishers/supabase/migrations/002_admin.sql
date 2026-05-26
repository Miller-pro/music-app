-- AudioVerse Publishers — Admin Dashboard (Phase 1A)
-- Adds: audit_logs table for the AdminVerse command center.

create table if not exists public.audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  admin_id     uuid references auth.users(id) on delete set null,
  publisher_id uuid references public.publishers(id) on delete cascade,
  action       text not null,
  reason       text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists audit_logs_publisher_idx
  on public.audit_logs (publisher_id, created_at desc);
create index if not exists audit_logs_admin_idx
  on public.audit_logs (admin_id, created_at desc);
create index if not exists audit_logs_action_idx
  on public.audit_logs (action, created_at desc);

-- The is_admin() helper from 001 hard-coded a single email. Reshape it so
-- the admin address is read from a Postgres GUC (`app.admin_email`) with a
-- fallback to dean@m-innovation-group.com. Set via:
--   alter database <db> set app.admin_email = 'newadmin@example.com';
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(
    lower((auth.jwt() ->> 'email')::text) =
      lower(coalesce(current_setting('app.admin_email', true), 'dean@m-innovation-group.com')),
    false
  );
$$;

-- RLS: admin-only read/write.
alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_admin_select on public.audit_logs;
create policy audit_logs_admin_select on public.audit_logs
  for select using (public.is_admin());

drop policy if exists audit_logs_admin_insert on public.audit_logs;
create policy audit_logs_admin_insert on public.audit_logs
  for insert with check (public.is_admin());

-- Grants — service role bypasses RLS, but authenticated admins read via the policy.
grant select, insert on public.audit_logs to authenticated;
