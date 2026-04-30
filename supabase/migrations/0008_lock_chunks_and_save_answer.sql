-- =============================================================
-- Madrasa AI — lock the corpus + harden the answer-save path
--
-- 1. The transcripts in public.chunks are the user's work product
--    (derived from their podcast but transcribed and chunked
--    server-side). They were exposed via REST as a public-read
--    table, which lets a competitor `select * from chunks` and
--    exfiltrate the entire corpus + embeddings. Drop the public
--    read policy. Search continues to work because fn_vector_search
--    runs as SECURITY DEFINER and joins chunks/episodes directly.
--
-- 2. fn_save_answer was authenticated-callable via PostgREST, with
--    the caller free to attach any chunk_ids as citations. Combined
--    with anonymous session multiplication, that lets an attacker
--    inflate any guest's leaderboard rank. Move it behind the
--    service-role boundary: the function now takes p_user_id
--    explicitly, the auth.uid() check is gone (the route handler
--    has already done that), and EXECUTE is granted only to
--    service_role. The /api/ask route is now the only path that
--    can write answers + citations.
-- =============================================================

-- 1. Lock down the corpus.
drop policy if exists chunks_public_read on public.chunks;

-- fn_vector_search must bypass RLS now. Recreate as SECURITY DEFINER.
drop function if exists public.fn_vector_search(extensions.vector, uuid[], int);

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
language sql stable security definer set search_path = public, extensions
as $$
  select
    c.id, c.episode_id, c.chunk_index, c.content_ar, c.speaker_ar,
    c.start_sec, c.end_sec,
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

-- 2. Public stats RPC for the home page so it can keep showing the
--    "X episodes / Y chunks" hero strip without granting direct
--    SELECT on chunks.
create or replace function public.fn_public_stats()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'episodeCount', (select count(*) from public.episodes),
    'chunkCount',   (select count(*) from public.chunks)
  );
$$;
revoke all on function public.fn_public_stats() from public;
grant execute on function public.fn_public_stats() to anon, authenticated;

-- 3. fn_save_answer: service-role-only, takes explicit user_id.
drop function if exists public.fn_save_answer(uuid, text, text, uuid[]);

create or replace function public.fn_save_answer(
  p_user_id     uuid,
  p_question_id uuid,
  p_text        text,
  p_model       text,
  p_chunk_ids   uuid[]
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  aid uuid;
  i   int;
begin
  if p_user_id is null then raise exception 'missing_user'; end if;

  -- Caller (the /api/ask route handler) has verified the user owns
  -- the question; we double-check here as defence in depth.
  perform 1 from public.questions
    where id = p_question_id and user_id = p_user_id;
  if not found then raise exception 'not_owner'; end if;

  insert into public.answers (question_id, user_id, text_ar, model)
    values (p_question_id, p_user_id, p_text, p_model)
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
revoke all on function public.fn_save_answer(uuid, uuid, text, text, uuid[])
  from public, anon, authenticated;
grant execute on function public.fn_save_answer(uuid, uuid, text, text, uuid[])
  to service_role;
