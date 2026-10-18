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

-- ===================== Account deletion (in-app, required by Apple 5.1.1(v)) =====================
-- Deletes the sign-in account; progress, Pro access and book-read logs cascade;
-- reports are kept with user_id set to null.
create or replace function public.delete_account()
returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in' using errcode = '28000'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

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

create or replace function public.has_pro(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pro_access where user_id = uid and (expires_at is null or expires_at > now()));
$$;
revoke all on function public.has_pro(uuid) from public, anon;
grant execute on function public.has_pro(uuid) to authenticated;

-- ===================== Private storage =====================
-- `content`: content.json (both question banks). Readable only by a signed-in Pro account.
-- `book`:    page images. NO policy at all: nobody can list or download it directly;
--            pages come one at a time through the `book-page` Edge Function.
insert into storage.buckets (id, name, public) values ('content', 'content', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('book', 'book', false) on conflict (id) do nothing;
drop policy if exists "pro can read content" on storage.objects;
create policy "pro can read content" on storage.objects for select to authenticated
  using (bucket_id = 'content' and name = 'content.json' and public.has_pro(auth.uid()));

-- Book page reads, for per-account limits (see supabase/functions/book-page).
create table if not exists public.book_reads (
  id      bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  page    integer not null,
  at      timestamptz not null default now()
);
create index if not exists book_reads_user_at on public.book_reads (user_id, at desc);
alter table public.book_reads enable row level security;   -- no policies: service role only

-- ===================== Explicit Data API privileges =====================
-- Needed because "Automatically expose new tables" is off. RLS above still decides which rows.
grant usage on schema public to anon, authenticated;
revoke all on public.progress, public.issue_reports, public.pro_access, public.book_reads from anon;
grant select on public.progress to authenticated;
grant select, insert on public.issue_reports to authenticated;
grant select on public.pro_access to authenticated;
revoke all on public.book_reads from authenticated;
grant usage, select on sequence public.book_reads_id_seq to service_role;
grant all on public.progress, public.issue_reports, public.pro_access, public.book_reads to service_role;
