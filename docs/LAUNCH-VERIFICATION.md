# Launch Verification Report

_Date: 23 July 2026 · Branch: `feat/lead-gen-rework` · `main` untouched._
_Environment: local dev servers against the live Supabase database (14 service pages seeded)._

## 1. Regression + site crawl — PASS

Automated same-origin crawl from `/` (56 URLs, every reachable page):

| Check                                              | Result                                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Broken links (4xx/5xx)                             | **0**                                                                            |
| Redirect chains (>1 hop)                           | **0**                                                                            |
| Pages missing title / meta description / canonical | **0**                                                                            |
| Pages without exactly one `<h1>`                   | **0**                                                                            |
| Pages without JSON-LD structured data              | **0**                                                                            |
| Images missing alt                                 | **0** (site currently ships no `<img>` outside CMS media)                        |
| Duplicate titles                                   | 1 minor — `/health-check` vs `/health-check/` (trailing-slash variant; see R-11) |

Known/accepted: legacy `/visa-services/*` pages still interlink each other and are linked
from `/your-situation/skilled-professional/` and `/your-situation/employer/` pathway grids
(old data model). All 301 to `/services` in production (vercel.json). Remediation R-10.

## 2. Responsive — PASS

No horizontal overflow at 375 px (mobile), 768 px (tablet), or desktop on the homepage,
service pages, services hub, booking page, blog and success stories. Mobile burger nav,
mobile menu CTAs and the fixed action bar function. One serious a11y interaction with the
fixed bar (A-3 below).

## 3. CMS editing workflow — PASS

Verified end-to-end against the live database via the API:

- Draft article **not** visible publicly → publish → visible; `publishedAt` **auto-set once**.
- Editing after publish: `publishedAt` immutable, `updatedAt` advances (drives "Last updated").
- **Revision history**: versions recorded (3 versions after one edit cycle) — restorable in admin.
- Slug, SEO group, author, categories, tags all editable per document.
- Success-stories consent gate verified: `consent=false` entries are never fetched publicly.

## 4. Core Web Vitals — structural assessment (final numbers need the Vercel preview)

Dev-mode timings are not representative; measure on the first Vercel preview deploy.
Structural findings:

- **LCP**: hero is text (no hero image yet) → expected fast. Fonts are self-hosted with
  `font-display: swap` but **not preloaded** → late swap (R-6).
- **CLS**: no raster images on any page today → near-zero. Risks when images land:
  no width/height convention; CMS Lexical has no image renderer (R-7).
- **INP**: minimal JS (islands only where needed); no blocking third-party scripts.

## 5. Accessibility (WCAG 2.2 AA) — STRONG BASE, 13 findings (5 serious)

Passing (verified): skip links, global `:focus-visible` ring, no positive tabindex, no
click-only divs, landmarks + `lang`, one `h1` per template, labelled forms with
`role="alert"`/`role="status"`, named icon-only controls, `aria-hidden` decorative SVGs,
titled iframes, carousel with buttons (2.5.7), ≥24 px targets (2.5.8), reduced-motion
coverage, keyboard wizard with focus management, native `<details>` FAQs.

Serious (remediation R-1..R-5):

| #   | Issue                                                                              | Where                                         |
| --- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| A-1 | Gold `--color-emphasis` as text on light grounds = 2.57:1 (fails 4.5:1)            | success-stories eyebrow, review stars         |
| A-2 | Blue `--color-interactive` as text on light = 3.69–3.91:1                          | service-page contact CTA (every service page) |
| A-3 | Fixed MobileActionBar obscures focused footer/form controls (2.4.11)               | Base layout <1024px                           |
| A-4 | Service-page ToC anchors land under sticky header (no scroll-margin)               | ServicePageView body headings                 |
| A-5 | CMS-supplied portal-button colour not contrast-validated; focus ring self-coloured | ClientPortalButton                            |

Moderate/minor (R-8, post-launch acceptable): progressbar name + `aria-pressed` init in
Health Check; burger Escape focus return; mobile menu as `<nav>`; `aria-invalid`/
`aria-describedby` on failing fields; filter-results live announcements; SecondOpinion
false-success on network failure; ComplexityMeter `role="img"` swallowing its note;
heading skip in case studies; misc.

## 6. Security — 7 ranked risks (none public-unauthenticated critical)

Verified PASS: secrets discipline (server env never in client code, `.env` ignored),
stateless public APIs (no CSRF surface), POST-only logout, Supabase RLS on all portal
tables (deny-by-default beyond owner policies), collection RBAC (public reads limited to
published; writes editorial; role escalation blocked), portal middleware gating, Payload
admin retains data-level access control.

Risks (remediation R-9, S-1..S-7):

| #   | Risk                                                                                                                        | Priority                 |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| S-1 | No `storage.objects` policies/limits committed for the `vmd-client-docs` bucket (portal upload limits are client-side only) | **Before portal launch** |
| S-2 | Turnstile only on 2 of 4 form routes; enabling the secret key breaks Enquiry/Newsletter (no widget/token)                   | **Before launch**        |
| S-3 | Payload Users: default `read` lets any authenticated user list staff; `client` role can open the admin UI shell             | **Before launch**        |
| S-4 | Rate limiting fails open when Upstash env absent — confirm prod env set; add email-scoped limits beyond health-check        | Launch config            |
| S-5 | Lexical serializer: no href scheme allowlist, `"` not escaped (stored-XSS from a compromised editorial account)             | Before launch            |
| S-6 | CSP is Report-Only with no report endpoint; no CSP on the CMS deployment                                                    | Launch window            |
| S-7 | Open redirect via `login.astro` `next` param; editor-managed Redirects `to` unvalidated                                     | Before launch            |

## 7. Remediation backlog (awaiting approval — some change visuals)

**P0 — recommend before launch** (defect fixes; small visual deltas where noted):

- R-1/R-2: add a dark-gold-on-light token + darken the blue text link → visible colour
  change on those elements (to compliant shades).
- R-3: reserve bottom space for the mobile action bar (footer padding + scroll-padding).
- R-4: `scroll-margin` for service-page headings under the sticky header.
- R-5: contrast-validate the CMS portal-button colour; neutral focus ring.
- R-9: S-2, S-3, S-5, S-7 code hardening (no visual change).
- R-10: map `/your-situation` pathway links to the new canonical service pages.
- R-11: normalise `/health-check/` trailing-slash internal links.

**P1 — post-launch quality**: A-6..A-13 moderates, R-6 font preload, R-7 CMS image
renderer + `sharp`, S-1 storage policies (required before the portal goes live to
clients), S-4 email-scoped limits, S-6 CSP promotion after report collection, favicon +
og-image assets (brand assets needed), Decision-3 shared-UI refactor.

**Deploy-time (first Vercel preview)**: confirm header delivery, run Lighthouse/CWV,
promote CSP after clean reports, submit sitemap in Search Console.
