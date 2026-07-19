# VMD Platform — Production Readiness Checklist

**Final gate before launch. Every box must be checked (or consciously waived with a
dated note) before the site serves real clients.**

Status keys: `[x]` done · `[~]` partial / needs verification · `[ ]` not started.
"Verify with `.env`" = built and wired; confirm at runtime once real credentials exist.

---

## 1. Security (OWASP basics)

- [x] Server-side input validation on every write (Zod, `@vmd/schema`); the health-check
      API rejects invalid input with 422.
- [x] Secrets are server-only; no secret is in a `PUBLIC_*` var or shipped to the browser.
      CI greps client bundles for the service-role key (`scripts/check-no-service-role.sh`).
- [x] Lead writes are server-to-server only (Payload agent API key); no browser-direct writes.
- [x] Payload access control is typed and enforced per collection (RBAC via `@vmd/auth`).
- [x] `PAYLOAD_SECRET` required (min 32) — Payload refuses to boot without it.
- [~] **XSS**: Astro auto-escapes; audit every `set:html` (rich-text via `lexicalToHtml`)
  for sanitisation before launch.
- [~] **CSRF**: public lead POST has no CSRF token (low risk for anonymous lead capture),
  but add an origin check or token if the endpoint is ever authenticated.
- [x] **Rate limiting** on `/api/health-check`: 5/hour per IP + 3/day per email (Upstash,
      fails open if unconfigured). Set `UPSTASH_REDIS_REST_URL`/`_TOKEN` in prod to enforce.
- [x] **Spam protection** on the Free Visa Health Check: hidden honeypot (silent drop) +
      Cloudflare Turnstile (widget when `PUBLIC_TURNSTILE_SITE_KEY` set; server verifies with
      `TURNSTILE_SECRET_KEY`). Set both keys in prod to enforce the challenge.
- [x] Security headers / CSP reviewed at the edge (Vercel) — confirm CSP allows only
      required origins (Supabase, Postmark, HubSpot, GA/Plausible).
- [ ] Dependency audit (`pnpm audit`) clean or triaged.

## 2. Payload CMS

- [x] Collections typed; generated `payload-types.ts` registered.
- [x] `leads` stores identity, questionnaire, attribution, unique `submissionId`, CRM group.
- [ ] Verify with `.env`: admin boots, login works, leads persist, media uploads to Supabase S3.
- [ ] First admin user created; roles assigned; no default/weak credentials.
- [ ] Audit-log hook confirmed writing on create/update/delete.

## 3. Supabase

- [ ] Verify with `.env`: pooled connection (Supavisor) used on serverless; migrations applied.
- [ ] Row-level security reviewed for any client-facing tables.
- [ ] Storage bucket (`vmd-media`) exists; S3 access keys scoped; public/private policy correct.
- [ ] Automated **backups** enabled (Point-in-Time Recovery for Postgres).

## 4. HubSpot (CRM — ADR-0005)

- [ ] Private App token created with `crm.objects.contacts.read/write`.
- [ ] Custom properties created: `lead_source`, `submission_id`, `nationality`,
      `current_visa`, `situation`.
- [ ] `HUBSPOT_ACCESS_TOKEN` set → verify a Health Check upserts one Contact (idempotent).
- [ ] Sales pipeline + deal stages defined (Phase 3 enrichment: note/company/deal).

## 5. Postmark (email)

- [ ] `POSTMARK_SERVER_TOKEN` + verified `POSTMARK_FROM_EMAIL`; domain DKIM/Return-Path verified.
- [ ] `ADMIN_NOTIFICATION_EMAIL` set (or defaults to the practice email).
- [ ] Verify with `.env`: admin notification + client confirmation both deliver; not in spam.
- [x] Client email explicitly states no migration advice is given yet (compliance).

## 6. SEO

- [x] `sitemap-index.xml` + `sitemap-0.xml` generate (28 URLs, canonical, no duplicates).
- [x] `robots.txt` present, references the sitemap, disallows `/thank-you/`, `/search`, `/lp/`.
- [~] Canonical `<link rel="canonical">` on every page (via layout) — verify.
- [~] Open Graph + Twitter cards + `schema.org` (LocalBusiness, Person) — `@vmd/seo` present; verify per page.
- [ ] Optional: per-route `changefreq`/`priority` in the sitemap config (currently defaults).
- [ ] Titles/descriptions unique per page; no `noindex` on public pages.

## 7. Blog

- [ ] Blog Payload collection + `/blog` and `/blog/[slug]` (separate feature; not in this scope).
- [ ] Article schema.org, FAQ schema, breadcrumb schema, share, reading time, TOC, related.

## 8. Analytics

- [~] GA4 (Measurement Protocol) + Plausible wired, **consent-gated** (`track({ consent })`).
- [ ] `health_check_submitted` event fires; no PII in event params.
- [ ] Cookie/consent mechanism gates analytics (see §17).

## 9. Performance

- [x] Astro static/hybrid; ~0 KB JS by default; interactivity is per-island (Health Check).
- [ ] Lighthouse ≥ 90 (Perf/SEO/Best-Practices/A11y) on home, health-check, a content page.
- [ ] Images optimised (dimensions, lazy, modern formats); fonts subset/preloaded.
- [ ] ISR expiration tuned; CDN caching headers verified.

## 10. Accessibility (WCAG 2.1 AA)

- [x] Health Check wizard: fieldset/legend, labelled inputs, `role=alert` errors,
      `aria-pressed` choices, progressbar, focus management, keyboard operable.
- [ ] Colour contrast AA across the palette (token contrast gate passes for text roles).
- [ ] `axe`/Playwright a11y pass on key pages (a11y spec exists under `e2e/`).
- [ ] Skip link, landmark regions, heading order, visible focus everywhere.

## 11. Mobile responsiveness

- [~] Home, health-check, thank-you render at 375px with no horizontal scroll, no console errors.
- [ ] Full pass across breakpoints (mobile/tablet/desktop) on all primary templates.

## 12. Backups

- [ ] Supabase Postgres PITR enabled; restore tested.
- [ ] Media (Supabase Storage) backup/retention policy.
- [ ] CMS content export cadence documented.

## 13. Error monitoring

- [ ] Error monitoring configured (e.g. Sentry) for web (SSR + client) and CMS. **Not yet set up.**
- [ ] Alerting on 5xx spikes and failed lead writes/emails.

## 14. Logging

- [ ] Structured server logs for the lead pipeline (store/email/CRM outcomes) without PII leakage.
- [ ] Audit log (Payload) retained; access to logs restricted.

## 15. Privacy Policy

- [x] `/privacy` page exists — [ ] legal review for accuracy and completeness.
- [ ] Describes data collected by the Health Check (identity, questionnaire, attribution),
      storage (Supabase/AU or region), processors (Postmark, HubSpot), retention, and rights.

## 16. Terms & Conditions

- [x] `/terms` page exists — [ ] legal review.

## 17. Cookie consent (if applicable)

- [ ] Consent banner gating non-essential cookies/analytics (analytics already checks a
      `consent` flag; wire it to a real consent UI). Decline is the privacy-preserving default.

## 18. Australian Privacy Act compliance

- [ ] APP-compliant privacy policy; collection notice on the Health Check form.
- [ ] Data residency/processor disclosure (Supabase region, Postmark, HubSpot — all offshore).
- [ ] Complaints process linked (`/complaints` exists); OMARA Code of Conduct referenced.
- [ ] MARN always shown with the RMA name (implemented site-wide).

## 19. Spam protection

- [x] Cloudflare Turnstile wired on the Free Visa Health Check (server verify + conditional
      widget). Provide the prod site/secret keys to enforce.
- [x] Honeypot + IP/email rate limiting wired as defence-in-depth.
- [ ] Extend the same protection to any other public lead forms (booking, second-opinion, enquiry).

## 20. Deployment checklist

- [ ] All required env vars set in the host (Vercel) — see `.env.example` `[REQUIRED]` items.
- [ ] Build green in CI on Linux (note: local Windows build hits an `EPERM: symlink` in the
      Vercel adapter — a Windows-only limitation; CI/Vercel/Linux is unaffected).
- [ ] `pnpm run verify` (typecheck · lint · boundaries · stylelint · duplication · contract ·
      secrets · build) green.
- [ ] Custom domain + HTTPS + HSTS; correct region (Sydney).
- [ ] Preview/staging smoke test of the full lead flow before promoting to production.

## 21. Rollback plan

- [ ] Vercel instant rollback to the previous deployment documented and tested.
- [ ] DB migration rollback strategy (or forward-fix policy) documented.
- [ ] Feature can be disabled safely: with no `HUBSPOT`/`POSTMARK` env the flow degrades to
      store-only (no data loss), so partial rollback of integrations is safe by design.

---

_Owner: _______ · Target launch date: _______ · Sign-off: ________
