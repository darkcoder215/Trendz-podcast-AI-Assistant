# Madrasa AI

Arabic-first RAG assistant over Trendz / «مدرسة الاستثمار» podcast episodes.

- **Stack**: Next.js 15 (App Router) + Supabase (Postgres + pgvector + auth + storage) + OpenRouter (Claude Sonnet 4.6 for answers, `text-embedding-3-small` for chunks).
- **Auth**: Supabase anonymous sign-in for public Ask flow (10-question server-side quota). Supabase email/password for admins, role flag in `profiles.role`.
- **Hosting**: Vercel.

## Quickstart

```bash
pnpm install        # or npm / yarn
cp .env.local.example .env.local
# ...fill in Supabase + OpenRouter keys
# In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`
pnpm dev
```

Open http://localhost:3000.

## Routes

| Route | Purpose |
|---|---|
| `/` | Marketing landing page |
| `/ask` | Anonymous Ask UI with RAG, quota pill, episode filter, share card |
| `/leaderboard` | Real guest leaderboard (sorted by citations) |
| `/settings/login` | Admin sign-in (email + password) |
| `/settings` | Admin dashboard — upload episodes + transcripts |
| `/share/[answerId]` | Preview & download the shareable PNG card |

### API

| Route | Purpose |
|---|---|
| `POST /api/auth/anonymous` | Bootstrap anon session (middleware does this automatically for public UI) |
| `POST /api/ask` | Rate-limited RAG: embed → vector search → LLM → save answer & citations |
| `GET  /api/identify` | Current profile + remaining quota |
| `POST /api/identify` | One-time name + email capture after first answer |
| `POST /api/admin/episodes` | Admin: create an episode row |
| `POST /api/admin/ingest` | Admin: chunk + embed transcript |
| `GET  /api/admin/refresh-leaderboard` | Vercel cron (auth: `Bearer CRON_SECRET`) |
| `GET  /api/share-card/[answerId]` | 1200×1200 PNG via @vercel/og (RLS-enforced owner only) |

## Security

- All secrets (`SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`) are server-only.
- RLS is on for every user-facing table. `rate_buckets` has no policy — only the service-role client (server) touches it.
- The 10-question quota lives in Postgres (`fn_ask` with `for update`), not localStorage.
- Admin status is verified server-side on every admin request; login just issues a session.
- System prompt instructs the LLM to treat chunk content as untrusted data and ignore instructions embedded within.
- Share cards are only served to the answer's owner.

## Supabase setup

See `supabase/README.md`.
