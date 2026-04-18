# Supabase — Madrasa AI

## First-time setup

1. Create a new Supabase project at https://supabase.com. Note the URL + anon key + service-role key.
2. In **Auth → Settings**, enable:
   - **Anonymous sign-ins** (required for the public ask flow).
   - **Email / password** (for admins).
3. Paste the contents of `migrations/0001_init.sql` into **SQL Editor → New query** and run. This creates all tables, RLS policies, RPCs, and the `guest-photos` storage bucket.
4. Create your first admin:

   ```sql
   -- After the user signs up in the app with email+password:
   update public.profiles set role = 'admin' where id = '<their-auth-user-uid>';
   ```

   (You can look up their `id` in **Auth → Users**.)

5. Set the env vars (see `.env.local.example`) in both your local `.env.local` and in Vercel.

## Resetting data during development

```sql
truncate public.citations, public.answers, public.questions, public.chunks, public.episodes, public.rate_buckets;
update public.profiles set questions_asked = 0, name = null, email = null, captured_at = null;
refresh materialized view public.guest_leaderboard;
```

## Adding admins later

```sql
update public.profiles set role = 'admin' where id = '...';
```
