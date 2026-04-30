-- =============================================================
-- Madrasa AI — security & performance hardening pass
--
-- Addresses every Supabase database-linter finding flagged after
-- 0001-0004 were applied:
--   * rate_buckets: make the deny-by-default intent explicit
--   * vector extension: move out of the public schema
--   * guest_leaderboard: stop exposing the materialized view through
--     PostgREST; expose a regular security_invoker view instead
--   * SECURITY DEFINER functions only callable by roles that need them
--     (is_admin / tg_handle_new_user / rls_auto_enable are infrastructure)
--   * fn_vector_search: switched to SECURITY INVOKER (the underlying
--     tables already have public-read RLS, so DEFINER is unnecessary)
--   * RLS policies: auth.uid() wrapped in (select ...) so the planner
--     evaluates it once per query instead of per row, and overlapping
--     permissive policies are consolidated.
-- =============================================================

-- -------------------------------------------------------------
-- 1. rate_buckets : make the "RLS on, no access" intent explicit
-- -------------------------------------------------------------
drop policy if exists rate_buckets_no_client_access on public.rate_buckets;
create policy rate_buckets_no_client_access on public.rate_buckets
  as restrictive for all
  to anon, authenticated
  using (false) with check (false);

-- -------------------------------------------------------------
-- 2. Move the `vector` extension out of public.
--    fn_vector_search references `vector(1536)`, so drop it first
--    and recreate it after the move (also flips it to SECURITY INVOKER).
-- -------------------------------------------------------------
drop function if exists public.fn_vector_search(public.vector, uuid[], int);

create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;
alter extension vector set schema extensions;

-- -------------------------------------------------------------
-- 3. Recreate fn_vector_search as SECURITY INVOKER.
--    chunks + episodes both have public-read RLS, so SECURITY INVOKER
--    is sufficient and means the function can never grant more access
--    than the caller already has.
-- -------------------------------------------------------------
create or replace function public.fn_vector_search(
  qvec        extensions.vector(1536),
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
language sql stable security invoker set search_path = public, extensions
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
revoke all on function public.fn_vector_search(extensions.vector, uuid[], int) from public;
grant execute on function public.fn_vector_search(extensions.vector, uuid[], int)
  to anon, authenticated;

-- -------------------------------------------------------------
-- 4. Hide the leaderboard materialized view from PostgREST.
--    Materialized views ignore RLS, so we expose a regular view
--    (security_invoker) instead. The underlying MV is renamed and
--    its grants revoked.
-- -------------------------------------------------------------
alter materialized view if exists public.guest_leaderboard
  rename to _guest_leaderboard_mv;

revoke all on public._guest_leaderboard_mv from anon, authenticated;

create or replace view public.guest_leaderboard
  with (security_invoker = on) as
  select
    guest_name_ar,
    guest_role_ar,
    guest_photo_url,
    episodes,
    citations,
    last_cited_at
  from public._guest_leaderboard_mv;

grant select on public.guest_leaderboard to anon, authenticated;

-- Refresh function points at the renamed MV.
create or replace function public.fn_refresh_leaderboard()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  refresh materialized view concurrently public._guest_leaderboard_mv;
exception when others then
  refresh materialized view public._guest_leaderboard_mv;
end;
$$;
revoke all on function public.fn_refresh_leaderboard() from public;
revoke execute on function public.fn_refresh_leaderboard() from anon;
grant execute on function public.fn_refresh_leaderboard() to authenticated;

-- -------------------------------------------------------------
-- 5. Lock down infrastructure SECURITY DEFINER functions so they
--    can't be invoked over the REST API. RLS / triggers still call
--    them internally because the executor uses the function owner's
--    privileges, not the caller's.
-- -------------------------------------------------------------
revoke all on function public.is_admin()             from public, anon, authenticated;
revoke all on function public.tg_handle_new_user()   from public, anon, authenticated;
revoke all on function public.rls_auto_enable()      from public, anon, authenticated;

-- -------------------------------------------------------------
-- 6. Performance: wrap auth.uid() in (select ...) so RLS evaluates
--    it once per query instead of once per row.
-- -------------------------------------------------------------

-- profiles : also collapses the two overlapping UPDATE policies
-- into one, removing the multiple-permissive-policies warning.
drop policy if exists profiles_select_self  on public.profiles;
drop policy if exists profiles_update_self  on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;

create policy profiles_select_self on public.profiles for select
  using ((select auth.uid()) = id or public.is_admin());

create policy profiles_update_self_or_admin on public.profiles for update
  using ((select auth.uid()) = id or public.is_admin())
  with check (
    public.is_admin()
    or ((select auth.uid()) = id and role = 'user')
  );

-- questions / answers / citations
drop policy if exists questions_select_self on public.questions;
create policy questions_select_self on public.questions for select
  using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists answers_select_self on public.answers;
create policy answers_select_self on public.answers for select
  using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists citations_select_self on public.citations;
create policy citations_select_self on public.citations for select
  using (
    exists (
      select 1 from public.answers a
      where a.id = citations.answer_id and a.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

-- chunks : split FOR ALL into write-only verbs so it doesn't
-- duplicate chunks_public_read on SELECT.
drop policy if exists chunks_admin_write on public.chunks;
create policy chunks_admin_insert on public.chunks for insert
  with check (public.is_admin());
create policy chunks_admin_update on public.chunks for update
  using (public.is_admin()) with check (public.is_admin());
create policy chunks_admin_delete on public.chunks for delete
  using (public.is_admin());
