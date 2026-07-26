# Deployment guide — Vercel

The monorepo deploys as **two Vercel projects** from the same GitHub repo
(`sushma1-ui/vmd-platform`): the **CMS** (`apps/cms`, Payload/Next.js) and the
**website** (`apps/web`, Astro). Deploy the **CMS first** — the website needs the CMS's
URL at build time.

> Deploy the branch **`feat/lead-gen-rework`** for now (main stays untouched until we've
> verified the live site). In each Vercel project: Settings → Git → **Production Branch →
> `feat/lead-gen-rework`**.

---

## Project 1 — CMS (`apps/cms`)

Vercel → **Add New… → Project** → import `sushma1-ui/vmd-platform`, then:

| Setting                              | Value                                                     |
| ------------------------------------ | --------------------------------------------------------- |
| Root Directory                       | `apps/cms`                                                |
| Framework Preset                     | Next.js (auto)                                            |
| Build Command (override)             | `cd ../.. && pnpm turbo run build --filter=@vmd/cms`      |
| Install Command                      | leave default (`pnpm install` runs at the workspace root) |
| Node.js Version (Settings → General) | **20.x**                                                  |

**Environment variables** (Settings → Environment Variables — all Environments):

| Key                         | Value                                                                   |
| --------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`              | your Supabase **Session pooler** string (port 5432) — the one in `.env` |
| `PAYLOAD_SECRET`            | the 112-char secret from your `.env`                                    |
| `SUPABASE_URL`              | `https://ucujenqqamuaeqhnozih.supabase.co`                              |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key                            |
| `SUPABASE_STORAGE_BUCKET`   | `vmd-media`                                                             |
| `S3_*`                      | only if using Supabase/S3 storage for media (optional to start)         |

Deploy. When it's live, open **`https://<cms>.vercel.app/admin`** and create your admin
user (same as locally). The database already has the 14 service pages. **Copy the CMS
URL** — you need it next.

---

## Project 2 — Website (`apps/web`)

Add another project from the **same repo**:

| Setting                  | Value                                                     |
| ------------------------ | --------------------------------------------------------- |
| Root Directory           | `apps/web`                                                |
| Framework Preset         | Astro (auto)                                              |
| Build Command (override) | `cd ../.. && pnpm turbo run build --filter=@vmd/web`      |
| Output Directory         | leave default (the Vercel adapter emits `.vercel/output`) |
| Node.js Version          | **20.x**                                                  |

**Environment variables:**

| Key                                                  | Value                                                        | Enables                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `PUBLIC_CMS_URL`                                     | the CMS URL from Project 1 (e.g. `https://<cms>.vercel.app`) | **content** (required)                                                                        |
| `PUBLIC_SITE_URL`                                    | the website URL / final domain                               | canonical URLs                                                                                |
| `PAYLOAD_API_KEY`                                    | see "API key" below                                          | storing leads in the CMS                                                                      |
| `POSTMARK_SERVER_TOKEN` + `POSTMARK_FROM_EMAIL`      | Postmark                                                     | enquiry + team emails                                                                         |
| `ADMIN_NOTIFICATION_EMAIL`                           | your team inbox                                              | team lead alerts                                                                              |
| `TURNSTILE_SECRET_KEY` + `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile                                         | form spam protection                                                                          |
| `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`   | Supabase                                                     | client portal                                                                                 |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN`                  | Upstash                                                      | production rate limiting                                                                      |
| `HUBSPOT_ACCESS_TOKEN`                               | HubSpot                                                      | CRM sync (optional)                                                                           |
| `REVALIDATE_SECRET`                                  | any long random string (also set the same in the CMS)        | on-publish content refresh                                                                    |
| `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`          | Google Cloud (Places API New) key + your Place ID            | **live Google Reviews** (optional; shows a neutral "read on Google" panel until both are set) |

**API key** (so the website can save leads to the CMS): in the CMS admin → **Users** →
create a user with role **agent**, tick **Enable API Key**, save, copy the generated key
→ set it as `PAYLOAD_API_KEY` on the website project.

Deploy. The website builds, pulling content from `PUBLIC_CMS_URL`.

---

## Domain (`migrationdoctors.com.au`)

1. **Website project** → Settings → Domains → add `migrationdoctors.com.au` and
   `www.migrationdoctors.com.au`. Vercel shows the DNS records (an `A` record and/or a
   `CNAME`) — add them at your domain registrar.
2. **CMS project** → Domains → add a subdomain, e.g. `admin.migrationdoctors.com.au`.
3. Update the website's `PUBLIC_CMS_URL` to the CMS's custom domain and `PUBLIC_SITE_URL`
   to `https://migrationdoctors.com.au`, then **redeploy the website**.

---

## After the first successful deploy — verify (then we can merge to main)

- Security headers deliver (check the response headers); then promote the CSP from
  Report-Only to enforcing (edit `apps/web/vercel.json`).
- Run Lighthouse / Core Web Vitals on the live URL.
- Confirm a test enquiry: form → stored lead in CMS → confirmation + team emails.
- Confirm the sitemap at `/sitemap-index.xml`; submit it in Google Search Console.
- Client portal: run the Supabase SQL policies + create the storage bucket before
  inviting clients (tracked in the launch verification report, S-1).

## Notes

- **Content updates**: the website is statically built, so new/edited CMS content appears
  after a redeploy or an on-demand revalidation (the CMS calls the website's
  `/api/revalidate` with `REVALIDATE_SECRET`).
- **Connection pooling**: the Session pooler (5432) is used to start — simple and
  correct. If connection limits bite under load, add a `DATABASE_POOL_URL` (Transaction
  pooler) later; the config already prefers it when present.
- **Redeploys**: every push to `feat/lead-gen-rework` triggers a deploy on both projects.

> Production tracks the `feat/lead-gen-rework` branch until launch is verified.

<!-- Website (apps/web) deployed as a second Vercel project; see the Website table above. -->
