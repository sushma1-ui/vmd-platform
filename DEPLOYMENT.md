# DEPLOYMENT

Two Vercel projects from one repo: **web** (Astro, `apps/web`) and **cms**
(Payload/Next, `apps/cms`). Data lives in **Supabase (Sydney region)**.

## 1. Supabase (Sydney)

1. Create a project in `ap-southeast-2` (Sydney) — AU data residency (§17).
2. Copy the **pooled** connection string (Supavisor, port 6543) → `DATABASE_POOL_URL`,
   and the direct string → `DATABASE_URL`.
3. Storage → create buckets `vmd-media` (public) and `vmd-client-docs` (private).
   Create S3 access keys → `S3_*`. Endpoint: `https://<ref>.supabase.co/storage/v1/s3`.
4. SQL editor → run `supabase/migrations/*.sql` then `supabase/policies/*.sql`
   (or `supabase db push` with the CLI).

## 2. CMS (Payload) — Vercel project, root `apps/cms`

- Env: `DATABASE_POOL_URL`, `PAYLOAD_SECRET` (32+ chars), `SUPABASE_STORAGE_BUCKET`, `S3_*`,
  `PUBLIC_SITE_URL`, `REVALIDATE_SECRET`.
- First deploy runs migrations. Then create an **agent** service user with an API key
  → `PAYLOAD_API_KEY` (used by the web app to write leads).
- Optional: `pnpm --filter @vmd/cms seed` to load the public visa taxonomy.

## 3. Web (Astro) — Vercel project, root `apps/web`, region `syd1`

- Env: `PUBLIC_SITE_URL`, `PUBLIC_CMS_URL` (the CMS deployment URL), `PAYLOAD_API_KEY`,
  `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, `GA4_*`, `PLAUSIBLE_DOMAIN`,
  `TURNSTILE_SECRET_KEY` + `PUBLIC_TURNSTILE_SITE_KEY`, `UPSTASH_*`, `REVALIDATE_SECRET`.
- `vercel.json` sets `syd1` + security headers (HSTS, X-Frame-Options, etc.).

## 4. Verify

`pnpm verify` (typecheck · lint · boundaries · styles · duplication · build · secret scan),
`pnpm test:unit`, and `pnpm --filter @vmd/e2e exec playwright test` against a preview URL.

## 5. Go-live (from Blueprint §10.2 / §13.1)

Fix the P0 items first (privacy policy live, broken CTAs purged, Google Business Profile
NAP identical), submit the sitemap, confirm Core Web Vitals green on throttled mobile.
