-- Close the quota-bypass hole on public.profiles.
--
-- Before this migration, profiles_update_self_or_admin let an
-- authenticated user run an arbitrary UPDATE on their own row. The
-- only column-level constraint was role='user' inside WITH CHECK,
-- which still allowed the user to:
--   * reset questions_asked to 0 (defeating the 10-question quota
--     enforced by fn_ask),
--   * overwrite name/email/captured_at after fn_identify had refused
--     a second capture,
--   * touch the created_at audit timestamp.
--
-- Fix: drop the user-self UPDATE policy entirely. All legitimate
-- profile mutations from end users go through SECURITY DEFINER RPCs
-- (fn_identify for name/email capture, fn_ask for the quota counter),
-- which bypass RLS by design and enforce server-side invariants.
-- Admins keep their UPDATE policy because admin code paths use the
-- service role anyway, but the policy is preserved for completeness.

drop policy if exists profiles_update_self_or_admin on public.profiles;

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
