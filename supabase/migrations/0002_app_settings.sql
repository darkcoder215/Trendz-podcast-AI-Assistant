-- =============================================================
-- Madrasa AI — runtime app settings (chat + embed model handles)
-- Singleton row keyed by id=1. Only admins read/write through the API;
-- the service-role client used server-side bypasses RLS anyway.
-- =============================================================

create table if not exists public.app_settings (
  id           int primary key default 1 check (id = 1),
  chat_model   text not null default 'anthropic/claude-sonnet-4.6',
  embed_model  text not null default 'openai/text-embedding-3-small',
  updated_by   uuid references public.profiles(id) on delete set null,
  updated_at   timestamptz not null default now()
);

insert into public.app_settings (id) values (1)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists app_settings_admin_read on public.app_settings;
create policy app_settings_admin_read on public.app_settings for select
  using (public.is_admin());

drop policy if exists app_settings_admin_write on public.app_settings;
create policy app_settings_admin_write on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());
