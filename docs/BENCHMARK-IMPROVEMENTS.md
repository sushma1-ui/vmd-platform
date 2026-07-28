# Benchmark Improvements

A living record of every change made to push Visa & Migration Doctors toward being
the benchmark migration website in Australia. Each entry states **what** changed,
**why**, the **expected benefit**, and its **status**.

Benefit legend: 🛡️ trust · 🎯 conversion · 🎨 UX · ⚡ performance · ♿ accessibility ·
🔒 security · 🔎 SEO · 🔧 maintainability.

Status legend: ✅ implemented & verified · 🟡 implemented, pending activation/live check ·
⏳ awaiting approval · 🔭 planned.

---

## Phase P0 — Technical foundation (defects & hardening) — SHIPPED

Deployed to the `feat/lead-gen-rework` preview and verified live. `main` untouched.

| #    | Improvement                                                                                                                                                                   | Why                                                                                                                                                               | Benefit | Status                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-1 | **Second Opinion form no longer fakes success.** Checks the response, shows an error with the priority phone number on failure, only confirms when the submission truly sent. | The highest-stakes intake swallowed network errors and always showed "Received" — a distressed, refused visitor could believe they'd reached us when they hadn't. | 🛡️🎯    | ✅ Live-verified                                                                                                                                |
| P0-2 | **Loading states on all four client forms** (disabled + `aria-busy` + "Sending…", restored on error).                                                                         | Prevents double-submits and "did it work?" anxiety; premium-SaaS form feel.                                                                                       | 🎨♿🎯  | ✅ Verified                                                                                                                                     |
| P0-3 | **Subclass hero CTAs resolve from the CMS** (removed hardcoded `/book/`, `/health-check/`).                                                                                   | Every other page resolves these from Settings; the outlier could drift or 404.                                                                                    | 🔧      | ✅ Build-verified                                                                                                                               |
| P0-4 | **On-demand publishing** — a Payload hook on every collection/global regenerates the affected pages via Vercel ISR so edits go live without a manual rebuild.                 | Removes the biggest operational papercut; makes the CMS feel genuinely "live".                                                                                    | 🔧🎯    | 🟡 Deployed & endpoint-guarded (401 verified); **activate** by setting `REVALIDATE_SECRET` (≥32 chars) on both Vercel projects                  |
| P0-5 | **Upload hardening** — dropped `image/svg+xml` (stored-XSS vector) and added an 8 MB size cap.                                                                                | SVGs can carry inline scripts; served inline they're an XSS path. Cap prevents storage/memory abuse.                                                              | 🔒      | ✅ Verified (CMS rebuilt clean)                                                                                                                 |
| P0-6 | **Content-Security-Policy promoted to enforcing** with a SHA-256 hash for the one inline bootstrap script (no `'unsafe-inline'` for scripts).                                 | Report-Only CSP blocked nothing; enforcing it closes the defence-in-depth gap that paired with the SVG vector.                                                    | 🔒      | ✅ Live-verified: enforcing header present, hashed inline script executes, zero CSP violations across homepage/contact/success-stories/refusals |

**CSP maintenance note:** the `script-src` hash
`sha256-sa2BD07tH4oO53uT1B5vNSLM2+gcrREM4WTXttKp6oU=` corresponds to the inline
`js`-class setter in `apps/web/src/layouts/Base.astro`. If that script's bytes ever
change, recompute the hash from the built HTML and update `apps/web/vercel.json`.
Rollback: rename the header key to `Content-Security-Policy-Report-Only`.

### P0 live verification log (preview deploy)

- **Security headers** — all six present: enforcing CSP (with hash), HSTS (2 yr, preload),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, Referrer-Policy,
  Permissions-Policy. No regression.
- **CSP** — inline hashed script ran (`html.js` set), bundled module + fonts loaded 200,
  JSON-LD (3 blocks) intact, **no console violations** on homepage, contact (form),
  success-stories (video iframes), or refusals.
- **Forms** — Second Opinion forced-failure path shows error + phone, hides success,
  re-enables button (verified live).
- **Responsive** — mobile 375 / tablet 768 / desktop 1280: no horizontal scroll; nav
  collapses to burger < 1120px and the `.mab` action bar shows < 1024px; desktop shows the
  horizontal nav with action bar hidden; H1 scales 40 → 64px.
- **A11y** — skip link present, `nav[aria-label="Primary"]`, burger `aria-expanded`
  toggles and opens the panel, token-driven focus ring, reduced-motion respected.
- **SEO** — sitemap-index.xml 200, robots.txt 200, per-page meta/canonical + JSON-LD intact.
- **CMS** — admin loads (Payload login), rebuilt cleanly with the new hooks + upload rules.
- **Client Portal** — nav CTA points to the live Migration Manager portal.
- _Note:_ scroll-reveal animations don't fire in the headless verification pane (no frame
  compositing → `IntersectionObserver` never intersects); they work on any displayed tab.
  Tracked as a minor P1 robustness item (add a reveal fallback timeout).

---

## Phase P1 — Trust & Premium Experience (in progress)

Redesign (not just additions) toward the strongest trust signals and a world-class,
calm, premium feel. Entries added as each piece lands.

| #         | Improvement                                                                                                                                                                                                                                                                                                             | Why               | Benefit | Status      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- | ----------- |
| _pending_ | Homepage storytelling arc · premium hierarchy · client-journey timeline · differentiated "Why choose us" · rich Success Stories (video/testimonial/outcome) · live Google Reviews · CTA placement · consultation flow · service-page layouts · blog reading experience · author credibility · FAQs · funnel conversion. | See the P1 brief. | 🛡️🎯🎨  | 🔭 Starting |

### Asset dependencies (unblock the highest-impact trust work)

- **Professional photo of Sunil Uprety** (headshot) — highest single trust lever.
- **Office / team photography** (Perth CBD) — humanises the practice.
- Layouts are built **production-ready with high-quality placeholders** so real assets drop
  in later without redesign.

### Minor robustness carried from P0

- Scroll-reveal fallback timeout (reveal content even if the observer never fires).

---

## Regression guardrails (must stay green every phase)

- 🔒 Security: RBAC, validation, env split, CSP, rate-limiting, upload rules — never weakened.
- ⚡ Performance: ~0 KB framework JS, text LCP, self-hosted fonts — no client frameworks added.
- ♿ Accessibility: WCAG AA (token contrast gates), landmarks, skip link, focus-visible, reduced-motion.
- 🔎 SEO: centralised meta/canonical, JSON-LD, sitemap/robots — no regressions.
- 🔧 Editability: everything user-facing stays CMS-editable; no hardcoding of content.
- `main` stays untouched until every verification passes.
