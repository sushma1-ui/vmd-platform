# Benchmark Improvements

A living record of every change made to push Visa & Migration Doctors toward being
the benchmark migration website in Australia. Each entry states **what** changed,
**why**, the **expected benefit**, and its **status**.

Benefit legend: 🛡️ trust · 🎯 conversion · 🎨 UX · ⚡ performance · ♿ accessibility ·
🔒 security · 🔎 SEO · 🔧 maintainability.

Status legend: ✅ implemented & verified · 🟡 implemented, pending live verification ·
⏳ awaiting approval · 🔭 planned.

---

## Phase P0 — Technical foundation (defects & hardening)

| #    | Improvement                                                                                                                                                                                 | Why                                                                                                                                                                          | Benefit | Status                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| P0-1 | **Second Opinion form no longer fakes success.** It now checks the response, shows an error with the priority phone number on failure, and only confirms when the submission actually sent. | The highest-stakes intake on the site swallowed network errors and always showed "Received" — a refused/distressed visitor could believe they'd reached us when they hadn't. | 🛡️🎯    | ✅ Browser-verified: forced 500 → error shown, success hidden, button re-enabled         |
| P0-2 | **Loading states on all four client forms** (disabled + `aria-busy` + "Sending…", restored on error).                                                                                       | Prevents double-submits and the "did it work?" anxiety; matches premium-SaaS form feel.                                                                                      | 🎨♿🎯  | ✅ Browser-verified                                                                      |
| P0-3 | **Subclass hero CTAs resolve from the CMS** (removed hardcoded `/book/` and `/health-check/`).                                                                                              | Every other page resolves booking/health-check URLs from Settings; the outlier could drift or 404 when URLs change.                                                          | 🔧      | ✅ Build-verified                                                                        |
| P0-4 | **On-demand publishing** — a Payload hook on every collection/global regenerates the affected pages via Vercel ISR (bypass token) so edits go live without a manual rebuild.                | Removed the biggest operational papercut; makes the CMS feel genuinely "live" for non-technical staff.                                                                       | 🔧🎯    | 🟡 Needs `REVALIDATE_SECRET` (≥32 chars) on both Vercel projects + live end-to-end check |
| P0-5 | **Upload hardening** — dropped `image/svg+xml` (stored-XSS vector) and added an 8 MB file-size cap.                                                                                         | SVGs can carry inline scripts; served inline they're an XSS path. Size cap prevents storage/memory abuse.                                                                    | 🔒      | ✅ Build/typecheck-verified                                                              |
| P0-6 | **Content-Security-Policy promoted to enforcing** with a SHA-256 hash for the single inline bootstrap script (no `'unsafe-inline'` for scripts).                                            | Report-Only CSP blocked nothing; enforcing it closes the defence-in-depth gap that paired with the SVG vector.                                                               | 🔒      | 🟡 Enforced; verifying zero violations on live deploy across pages/viewports             |

**CSP note:** the `script-src` hash `sha256-sa2BD07tH4oO53uT1B5vNSLM2+gcrREM4WTXttKp6oU=`
corresponds to the inline `js`-class setter in `apps/web/src/layouts/Base.astro`. If that
script's bytes ever change, recompute the hash from the built HTML and update
`apps/web/vercel.json`. Rollback if needed: rename the header key back to
`Content-Security-Policy-Report-Only`.

---

## Phase P1 — Trust & Premium Experience

Redesign (not just additions) toward the strongest trust signals and a world-class,
calm, premium feel. Entries added as each piece lands.

| #         | Improvement                                                                                                                                                                                                      | Why               | Benefit | Status         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- | -------------- |
| _pending_ | Homepage storytelling arc, premium hierarchy, client journey timeline, differentiated "Why choose us", rich Success Stories, live Google Reviews, CTA placement, service/blog/FAQ redesigns, author credibility. | See the P1 brief. | 🛡️🎯🎨  | 🔭 In progress |

### Asset dependencies (unblock the highest-impact trust work)

- **Professional photo of Sunil Uprety** (headshot) — highest single trust lever.
- **Office / team photography** (Perth CBD) — humanises the practice.
- Layouts are being built **production-ready with high-quality placeholders** so real
  assets drop in later without redesign.

---

## Regression guardrails (must stay green every phase)

- 🔒 Security: RBAC, validation, env split, CSP, rate-limiting, upload rules — never weakened.
- ⚡ Performance: ~0 KB framework JS, text LCP, self-hosted fonts — no client-side frameworks added.
- ♿ Accessibility: WCAG AA (token contrast gates), landmarks, skip link, focus-visible, reduced-motion.
- 🔎 SEO: centralised meta/canonical, JSON-LD, sitemap/robots — no regressions.
- 🔧 Editability: everything user-facing stays CMS-editable; no hardcoding of content.
- `main` stays untouched until every verification passes.
