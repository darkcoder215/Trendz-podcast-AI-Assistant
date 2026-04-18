-- =============================================================
-- Madrasa AI — initial schema, RLS policies, RPCs, storage rules
-- =============================================================

create extension if not exists vector;
create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- 1. profiles : one row per auth.users (incl. anonymous users)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null default 'user' check (role in ('user','admin')),
  name            text,
  email           text,
  questions_asked int  not null default 0,
  captured_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- auto-create a profile when a new auth.user is inserted
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.tg_handle_new_user();

-- -------------------------------------------------------------
-- 2. episodes
-- -------------------------------------------------------------
create table if not exists public.episodes (
  id              uuid primary key default gen_random_uuid(),
  num             int unique not null,
  title_ar        text not null,
  guest_name_ar   text not null,
  guest_role_ar   text,
  guest_photo_url text,
  youtube_url     text not null,
  youtube_id      text not null,
  duration_sec    int,
  published_at    date,
  topics_ar       text[] default '{}',
  summary_ar      text,
  uploaded_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 3. chunks : transcript chunks with pgvector embeddings
-- -------------------------------------------------------------
create table if not exists public.chunks (
  id           uuid primary key default gen_random_uuid(),
  episode_id   uuid not null references public.episodes(id) on delete cascade,
  chunk_index  int  not null,
  content_ar   text not null,
  speaker_ar   text,
  start_sec    int  not null,
  end_sec      int  not null,
  embedding    vector(1536) not null,
  token_count  int,
  created_at   timestamptz not null default now(),
  unique(episode_id, chunk_index)
);
create index if not exists chunks_embedding_ivf on public.chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists chunks_episode_idx on public.chunks(episode_id);

-- -------------------------------------------------------------
-- 4. questions + answers + citations
-- -------------------------------------------------------------
create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  text_ar         text not null,
  episode_filter  uuid[] not null default '{}',
  created_at      timestamptz not null default now()
);

create table if not exists public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  text_ar     text not null,
  model       text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.citations (
  id        uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.answers(id) on delete cascade,
  chunk_id  uuid not null references public.chunks(id) on delete restrict,
  rank      int  not null,
  unique(answer_id, rank)
);
create index if not exists citations_chunk_idx  on public.citations(chunk_id);
create index if not exists citations_answer_idx on public.citations(answer_id);

-- -------------------------------------------------------------
-- 5. rate_buckets : IP+UA+date daily ledger (server-only)
-- -------------------------------------------------------------
create table if not exists public.rate_buckets (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  count        int  not null default 0,
  window_start timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 6. guest_leaderboard : materialized view powered by citations
-- -------------------------------------------------------------
create materialized view if not exists public.guest_leaderboard as
select
  e.guest_name_ar,
  max(e.guest_role_ar)   as guest_role_ar,
  max(e.guest_photo_url) as guest_photo_url,
  count(distinct e.id)   as episodes,
  count(c.id)            as citations,
  max(a.created_at)      as last_cited_at
from public.citations c
join public.chunks ch  on ch.id = c.chunk_id
join public.episodes e on e.id  = ch.episode_id
join public.answers a  on a.id  = c.answer_id
group by e.guest_name_ar;
create unique index if not exists guest_lb_name_idx on public.guest_leaderboard(guest_name_ar);

-- =============================================================
-- RLS
-- =============================================================
alter table public.profiles     enable row level security;
alter table public.episodes     enable row level security;
alter table public.chunks       enable row level security;
alter table public.questions    enable row level security;
alter table public.answers      enable row level security;
alter table public.citations    enable row level security;
alter table public.rate_buckets enable row level security;

-- helper: is the current JWT an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- profiles : own row; admins see all
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'user');  -- can't self-promote

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update
  using (public.is_admin());

-- episodes : public read; admin write
drop policy if exists episodes_public_read on public.episodes;
create policy episodes_public_read on public.episodes for select using (true);
drop policy if exists episodes_admin_write on public.episodes;
create policy episodes_admin_write on public.episodes for insert
  with check (public.is_admin());
drop policy if exists episodes_admin_update on public.episodes;
create policy episodes_admin_update on public.episodes for update
  using (public.is_admin());
drop policy if exists episodes_admin_delete on public.episodes;
create policy episodes_admin_delete on public.episodes for delete
  using (public.is_admin());

-- chunks : public read; admin write (service role bypasses RLS anyway)
drop policy if exists chunks_public_read on public.chunks;
create policy chunks_public_read on public.chunks for select using (true);
drop policy if exists chunks_admin_write on public.chunks;
create policy chunks_admin_write on public.chunks for all
  using (public.is_admin())
  with check (public.is_admin());

-- questions/answers : user sees own only; inserts done via SECURITY DEFINER RPC
drop policy if exists questions_select_self on public.questions;
create policy questions_select_self on public.questions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists answers_select_self on public.answers;
create policy answers_select_self on public.answers for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists citations_select_self on public.citations;
create policy citations_select_self on public.citations for select
  using (
    exists (select 1 from public.answers a where a.id = citations.answer_id and a.user_id = auth.uid())
    or public.is_admin()
  );

-- rate_buckets : deny all for anon/auth; only service role writes.
-- (No policy = no access with RLS enabled.)

-- =============================================================
-- Core RPCs
-- =============================================================

-- Vector search with optional episode filter.
create or replace function public.fn_vector_search(
  qvec        vector(1536),
  ep_filter   uuid[] default '{}',
  k           int    default 8
)
returns table (
  id             uuid,
  episode_id     uuid,
  chunk_index    int,
  content_ar     text,
  speaker_ar     text,
  start_sec      int,
  end_sec        int,
  distance       float,
  episode_num    int,
  episode_title  text,
  guest_name     text,
  youtube_id     text
)
language sql stable security definer set search_path = public
as $$
  select
    c.id, c.episode_id, c.chunk_index, c.content_ar, c.speaker_ar, c.start_sec, c.end_sec,
    (c.embedding <=> qvec) as distance,
    e.num, e.title_ar, e.guest_name_ar, e.youtube_id
  from public.chunks c
  join public.episodes e on e.id = c.episode_id
  where ep_filter is null
     or array_length(ep_filter, 1) is null
     or c.episode_id = any(ep_filter)
  order by c.embedding <=> qvec asc
  limit greatest(1, least(k, 24));
$$;
grant execute on function public.fn_vector_search(vector, uuid[], int) to anon, authenticated;

-- Atomic quota-and-insert for a new question. Returns question_id.
-- Fails with `quota_exceeded` if the caller has already asked 10 questions.
create or replace function public.fn_ask(q text, ep_filter uuid[] default '{}')
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  uid   uuid := auth.uid();
  cnt   int;
  qid   uuid;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if length(q) < 3 or length(q) > 500 then
    raise exception 'invalid_question_length';
  end if;

  select questions_asked into cnt from public.profiles where id = uid for update;
  if cnt >= 10 then
    raise exception 'quota_exceeded';
  end if;

  insert into public.questions (user_id, text_ar, episode_filter)
    values (uid, q, coalesce(ep_filter, '{}'::uuid[]))
    returning id into qid;

  update public.profiles set questions_asked = cnt + 1 where id = uid;
  return qid;
end;
$$;
grant execute on function public.fn_ask(text, uuid[]) to authenticated;

-- Finalize an answer. Called by the /api/ask route after the LLM responds.
-- Idempotent per question_id (unique constraint).
create or replace function public.fn_save_answer(
  p_question_id uuid,
  p_text        text,
  p_model       text,
  p_chunk_ids   uuid[]
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  uid  uuid := auth.uid();
  aid  uuid;
  i    int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  -- Make sure the caller owns the question they're writing against.
  perform 1 from public.questions where id = p_question_id and user_id = uid;
  if not found then raise exception 'not_owner'; end if;

  insert into public.answers (question_id, user_id, text_ar, model)
    values (p_question_id, uid, p_text, p_model)
    returning id into aid;

  if p_chunk_ids is not null then
    for i in 1 .. array_length(p_chunk_ids, 1) loop
      insert into public.citations (answer_id, chunk_id, rank)
        values (aid, p_chunk_ids[i], i);
    end loop;
  end if;

  return aid;
end;
$$;
grant execute on function public.fn_save_answer(uuid, text, text, uuid[]) to authenticated;

-- One-shot "identify": attach name/email to the caller's profile.
-- Refuses to overwrite once captured.
create or replace function public.fn_identify(p_name text, p_email text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  update public.profiles
    set name = p_name,
        email = p_email,
        captured_at = now()
    where id = uid and name is null;
end;
$$;
grant execute on function public.fn_identify(text, text) to authenticated;

-- Refresh the guest leaderboard. Called fire-and-forget after each answer.
create or replace function public.fn_refresh_leaderboard()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  refresh materialized view concurrently public.guest_leaderboard;
exception when others then
  -- If concurrent refresh isn't possible (first time, no unique index populated),
  -- fall back to a blocking refresh.
  refresh materialized view public.guest_leaderboard;
end;
$$;
grant execute on function public.fn_refresh_leaderboard() to authenticated;
grant select on public.guest_leaderboard to anon, authenticated;

-- =============================================================
-- Storage : guest-photos bucket (admin writes, public reads)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('guest-photos', 'guest-photos', true)
on conflict (id) do nothing;

drop policy if exists "guest photos public read" on storage.objects;
create policy "guest photos public read" on storage.objects for select
  using (bucket_id = 'guest-photos');

drop policy if exists "guest photos admin insert" on storage.objects;
create policy "guest photos admin insert" on storage.objects for insert
  with check (bucket_id = 'guest-photos' and public.is_admin());

drop policy if exists "guest photos admin update" on storage.objects;
create policy "guest photos admin update" on storage.objects for update
  using (bucket_id = 'guest-photos' and public.is_admin());

drop policy if exists "guest photos admin delete" on storage.objects;
create policy "guest photos admin delete" on storage.objects for delete
  using (bucket_id = 'guest-photos' and public.is_admin());
