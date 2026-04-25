-- Defense-in-depth + scalability pass.
--
-- 1. Add the FK indexes that were missing on Madrasa tables. Without these,
--    RLS join evaluation and ON DELETE CASCADE both fall back to sequential
--    scans on the referenced tables.
-- 2. Lock down EXECUTE privileges. Postgres grants EXECUTE to PUBLIC by
--    default on new functions, and Supabase additionally grants to anon for
--    public-schema functions. Mutating Madrasa RPCs require auth.uid(), so
--    revoking anon means an unauthenticated REST hit doesn't even get to
--    the auth.uid() check inside the function body.

create index if not exists questions_user_id_idx       on public.questions(user_id);
create index if not exists answers_user_id_idx         on public.answers(user_id);
create index if not exists episodes_uploaded_by_idx    on public.episodes(uploaded_by);
create index if not exists app_settings_updated_by_idx on public.app_settings(updated_by);

revoke all     on function public.fn_ask(text, uuid[])                                from public;
revoke all     on function public.fn_save_answer(uuid, text, text, uuid[])            from public;
revoke all     on function public.fn_identify(text, text)                             from public;
revoke all     on function public.fn_refresh_leaderboard()                            from public;
revoke all     on function public.fn_vector_search(extensions.vector, uuid[], int)    from public;

revoke execute on function public.fn_ask(text, uuid[])                                from anon;
revoke execute on function public.fn_save_answer(uuid, text, text, uuid[])            from anon;
revoke execute on function public.fn_identify(text, text)                             from anon;
revoke execute on function public.fn_refresh_leaderboard()                            from anon;

grant  execute on function public.fn_ask(text, uuid[])                                to authenticated;
grant  execute on function public.fn_save_answer(uuid, text, text, uuid[])            to authenticated;
grant  execute on function public.fn_identify(text, text)                             to authenticated;
grant  execute on function public.fn_refresh_leaderboard()                            to authenticated;
grant  execute on function public.fn_vector_search(extensions.vector, uuid[], int)    to anon, authenticated;
