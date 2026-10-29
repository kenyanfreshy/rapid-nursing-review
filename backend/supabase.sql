-- Rapid Nursing Review backend (Supabase). Run once in the Supabase SQL Editor of the NEW
-- Rapid Nursing Review project (not the Critical Care Certified one). Safe to run again.
--
-- Auth: Apple provider only (Sign in with Apple). No passwords, no email codes.
-- Every table has row-level security: a signed-in user can read and write only their own rows.
-- The publishable (anon) key in the app is public by design. Never put the service_role /
-- secret key in the app, in git or in chat: it lives only in Supabase's own function secrets.
--
-- "Automatically expose new tables" is OFF in this project, so every privilege the app needs
-- is granted explicitly at the bottom of this file.

-- ===================== Progress sync =====================
-- One row per account: the whole progress object (attempts, sessions, plan, bookmarks, …)
-- plus a version number for optimistic concurrency.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null,
  version    integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists "own progress: read" on public.progress;
create policy "own progress: read" on public.progress for select using (auth.uid() = user_id);
-- No insert/update policy: writes go through save_progress() only.

-- The client sends the version it merged against. If another device saved in between,
-- this raises version_conflict (HTTP 409 through PostgREST) and the client merges again.
-- The merge (dist/sync.js) is order-independent, so retries converge.
create or replace function public.save_progress(p_state jsonb, p_base_version integer)
returns integer
language plpgsql security definer set search_path = public as $$
declare cur integer;
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if p_state is null or jsonb_typeof(p_state) <> 'object' then raise exception 'bad state' using errcode = '22023'; end if;
  if octet_length(p_state::text) > 5000000 then raise exception 'progress too large' using errcode = '54000'; end if;
  select version into cur from progress where user_id = auth.uid() for update;
  if cur is null then
    insert into progress(user_id, state, version) values (auth.uid(), p_state, 1);
    return 1;
  end if;
  if cur <> p_base_version then
    raise exception 'version_conflict' using errcode = 'PT409', hint = 'merge and retry';
  end if;
  update progress set state = p_state, version = cur + 1, updated_at = now() where user_id = auth.uid();
  return cur + 1;
end $$;
revoke all on function public.save_progress(jsonb, integer) from public, anon;
grant execute on function public.save_progress(jsonb, integer) to authenticated;

-- ===================== Question reports =====================
-- "Report a problem" on a question. Kept (anonymised) after account deletion so content
-- fixes still reach the review queue.
create table if not exists public.issue_reports (
  id          text primary key,
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  question_id text,
  reason      text not null,
  details     text,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);
alter table public.issue_reports enable row level security;
drop policy if exists "own reports: insert" on public.issue_reports;
drop policy if exists "own reports: read" on public.issue_reports;
create policy "own reports: insert" on public.issue_reports for insert with check (auth.uid() = user_id);
create policy "own reports: read" on public.issue_reports for select using (auth.uid() = user_id);
-- (Column grants at the bottom: learners can set only id, question_id, reason, details, created_at; never status.)

-- ===================== Account deletion (in-app, required by Apple 5.1.1(v)) =====================
-- Done by the `delete-account` Edge Function with the Auth admin API (auth.admin.deleteUser), which also
-- revokes the Sign in with Apple token when the iPhone provides an authorization code. Progress, Pro
-- access and logs cascade; reports are kept with user_id set to null. (An older SQL version of this
-- function deleted from auth.users directly; it is removed.)
drop function if exists public.delete_account();

-- "Reset data" while signed in: also clear the synced copy, so the reset isn't undone by the next sync.
create or replace function public.reset_progress()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '28000'; end if;
  delete from progress where user_id = auth.uid();
end $$;
revoke all on function public.reset_progress() from public, anon;
grant execute on function public.reset_progress() to authenticated;

-- ===================== Pro access (web) =====================
-- Mirrored from RevenueCat by the `entitlement` Edge Function (service role only).
-- The subscription itself is bought only in the iPhone app; the web never sells anything.
create table if not exists public.pro_access (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  product_id text,
  expires_at timestamptz,          -- null = lifetime; otherwise RevenueCat's expiry (incl. grace period)
  checked_at timestamptz not null default now()
);
alter table public.pro_access enable row level security;
drop policy if exists "own access: read" on public.pro_access;
create policy "own access: read" on public.pro_access for select using (auth.uid() = user_id);

-- Access counts only while it is current AND RevenueCat confirmed it in the last 24 hours. Only a positive
-- RevenueCat answer (via record_pro_check) sets checked_at; cached answers, failed checks and rate-limited checks
-- never do. So after a refund, web access ends at the next real check, or at the latest 24 hours after the last
-- positive answer RevenueCat gave (which may itself come after the refund if RevenueCat hasn't processed it yet).
drop function if exists public.has_pro(uuid);
create or replace function public.has_pro() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pro_access where user_id = auth.uid()
                 and (expires_at is null or expires_at > now()) and checked_at > now() - interval '24 hours');
$$;
revoke all on function public.has_pro() from public, anon;
grant execute on function public.has_pro() to authenticated;

-- Same check for the Edge Functions (service role only; a user can't probe other accounts).
create or replace function public.has_pro_for(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pro_access where user_id = uid
                 and (expires_at is null or expires_at > now()) and checked_at > now() - interval '24 hours');
$$;
revoke all on function public.has_pro_for(uuid) from public, anon, authenticated;
grant execute on function public.has_pro_for(uuid) to service_role;

-- Record one RevenueCat answer, ordered by when RevenueCat was asked (p_checked_at = time the request STARTED).
-- An answer only replaces the stored one if it was asked later, so a slow "active" answer can't undo a newer
-- refund. An inactive answer is kept as a row that has already expired (expires_at = p_checked_at) instead of
-- being deleted, so its time still orders later answers. Returns true if this answer was stored.
create or replace function public.record_pro_check(p_uid uuid, p_checked_at timestamptz, p_active boolean,
                                                   p_product_id text, p_expires_at timestamptz)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into pro_access as pa (user_id, product_id, expires_at, checked_at)
  values (p_uid, case when p_active then p_product_id end, case when p_active then p_expires_at else p_checked_at end, p_checked_at)
  on conflict (user_id) do update
    set product_id = excluded.product_id, expires_at = excluded.expires_at, checked_at = excluded.checked_at
    where pa.checked_at < excluded.checked_at;
  get diagnostics n = row_count;
  return n > 0;
end $$;
revoke all on function public.record_pro_check(uuid, timestamptz, boolean, text, timestamptz) from public, anon, authenticated;
grant execute on function public.record_pro_check(uuid, timestamptz, boolean, text, timestamptz) to service_role;

-- ===================== Private storage =====================
-- `content`: content.json (both question banks). Readable only by a signed-in Pro account.
-- `book`:    page images. NO policy at all: nobody can list or download it directly;
--            pages come one at a time through the `book-page` Edge Function.
insert into storage.buckets (id, name, public) values ('content', 'content', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('book', 'book', false) on conflict (id) do nothing;
drop policy if exists "pro can read content" on storage.objects;
create policy "pro can read content" on storage.objects for select to authenticated
  using (bucket_id = 'content' and name = 'content.json' and public.has_pro());

-- Book page reads, for per-account limits (see supabase/functions/book-page).
create table if not exists public.book_reads (
  id      bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  page    integer not null,
  at      timestamptz not null default now()
);
create index if not exists book_reads_user_at on public.book_reads (user_id, at desc);
alter table public.book_reads enable row level security;   -- no policies: service role only

-- Count and record a page view in one step, under a per-account lock, so parallel requests
-- can't slip past the limit. Returns false when the hourly or daily limit is reached.
create or replace function public.claim_book_read(p_uid uuid, p_page integer, p_max_hour integer, p_max_day integer)
returns boolean
language plpgsql security definer set search_path = public as $$
declare h integer; d integer;
begin
  perform pg_advisory_xact_lock(hashtext('book:' || p_uid::text));
  select count(*) filter (where at > now() - interval '1 hour'), count(*) into h, d
    from book_reads where user_id = p_uid and at > now() - interval '1 day';
  if h >= p_max_hour or d >= p_max_day then return false; end if;
  insert into book_reads(user_id, page) values (p_uid, p_page);
  return true;
end $$;
revoke all on function public.claim_book_read(uuid, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.claim_book_read(uuid, integer, integer, integer) to service_role;

-- Subscription checks, so one account can't hammer RevenueCat through the `entitlement` function.
create table if not exists public.entitlement_checks (
  id      bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  at      timestamptz not null default now()
);
create index if not exists entitlement_checks_user_at on public.entitlement_checks (user_id, at desc);
alter table public.entitlement_checks enable row level security;   -- no policies: service role only
create or replace function public.claim_entitlement_check(p_uid uuid, p_max_hour integer)
returns boolean
language plpgsql security definer set search_path = public as $$
declare h integer;
begin
  perform pg_advisory_xact_lock(hashtext('ent:' || p_uid::text));
  select count(*) into h from entitlement_checks where user_id = p_uid and at > now() - interval '1 hour';
  if h >= p_max_hour then return false; end if;
  insert into entitlement_checks(user_id) values (p_uid);
  delete from entitlement_checks where user_id = p_uid and at < now() - interval '1 day';
  return true;
end $$;
revoke all on function public.claim_entitlement_check(uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_entitlement_check(uuid, integer) to service_role;

-- ===================== Explicit Data API privileges =====================
-- Needed because "Automatically expose new tables" is off. RLS above still decides which rows.
grant usage on schema public to anon, authenticated, service_role;
revoke all on public.progress, public.issue_reports, public.pro_access, public.book_reads, public.entitlement_checks from anon, authenticated;
grant select on public.progress to authenticated;
grant select on public.issue_reports to authenticated;
grant insert (id, question_id, reason, details, created_at) on public.issue_reports to authenticated;
grant select on public.pro_access to authenticated;
grant all on public.progress, public.issue_reports, public.pro_access, public.book_reads, public.entitlement_checks to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function public.save_progress(jsonb, integer), public.reset_progress() to service_role;
