-- Restore EXECUTE on public.is_admin() to anon and authenticated.
--
-- 0005 revoked these in response to the linter's
-- "anon/authenticated_security_definer_function_executable" warning,
-- but is_admin() is referenced from RLS policy expressions on
-- profiles, episodes, chunks, app_settings (and the storage.objects
-- policies for guest-photos). RLS evaluates those expressions as the
-- *invoker* role, so the role calling SELECT/INSERT/UPDATE/DELETE
-- needs EXECUTE on is_admin() — otherwise every admin write and
-- every admin-overridden read fails with permission denied.
--
-- The function itself is SECURITY DEFINER and only returns a boolean
-- about the caller's own role, so re-exposing EXECUTE has no real
-- impact on attack surface; the linter's warning is intentionally
-- accepted here.

grant execute on function public.is_admin() to anon, authenticated;
