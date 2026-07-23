# Proposal: CMS Architecture — full site manageability

_Status: PROPOSAL — awaiting approval before implementation._
_Goal: non-technical staff manage the whole site wherever practical; future additions
(new services, offices, languages, landing pages, calculators, webinars, guides) require
no CMS redesign._

## Principles

1. **Global** = exactly one of something, site-wide (settings, navigation, footer).
2. **Collection** = many of something, each with its own lifecycle (services, stories, people).
3. **Block** = a reusable section an editor composes into a page (hero, FAQ, CTA band…).
   Blocks live in a `layout` blocks field on page-like documents; each block type is built
   once by developers and reused everywhere by editors.
4. **Developer-controlled** = brand tokens, compliance strings, security, data contracts —
   things where a CMS mistake is a legal/brand/security incident.
5. Every public read is `published`-filtered; every write is role-gated (existing RBAC).
6. Everything falls back safely: if a Global is empty, code defaults from `@vmd/config`
   apply (the pattern already proven by `ctaLinks` and `clientPortal`).

## The map

| Area                          | Type                                                                                     | Notes                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation (desktop & mobile) | **Global: `Navigation`**                                                                 | Array of `{label, href, children?}` + the portal button ref. One source renders header + mobile menu.                                                                        |
| Utility bar                   | **Global: `Navigation.utilityBar`**                                                      | Toggle + which items (phone, email, RMA line ref, social).                                                                                                                   |
| Announcement bar              | **Global: `Announcement`**                                                               | `enabled, message (rich inline), href, tone, start/end date`. Auto-expires.                                                                                                  |
| Homepage sections             | **Collection: `Pages`** entry `home` with **Blocks**                                     | Order/enable sections by drag-and-drop.                                                                                                                                      |
| Hero content                  | **Block: `Hero`**                                                                        | Heading, lead, CTA pair (defaults to global CTAs), optional media.                                                                                                           |
| Featured Services             | **Block: `FeaturedServices`**                                                            | Auto (featured flag) or hand-picked relationship list. Exists as code today → becomes a block.                                                                               |
| Featured Blogs                | **Block: `FeaturedPosts`**                                                               | Same pattern.                                                                                                                                                                |
| Success Stories               | **Collection: `success-stories`** ✅ built                                               | Plus a `SuccessStoriesCarousel` block to embed on any page.                                                                                                                  |
| Testimonials                  | **Collection: `testimonials`** ✅ exists                                                 | Surface via a `Testimonials` block; consider merging into success-stories (type=written-testimonial) to avoid two homes — recommend **merge**.                               |
| Review videos                 | **Collection: `success-stories`** (type=review-video) ✅                                 | Already modelled.                                                                                                                                                            |
| Visa grant letters            | **Collection: `success-stories`** (type=grant-letter) ✅                                 | Already modelled; redaction is editorial policy + media upload.                                                                                                              |
| Team members                  | **Collection: `team-members`** (new)                                                     | Name, role, photo, bio, credentials (RMA/MARN only for the RMA — validated), order, `showOnAbout`. Feeds About page + blog author cards.                                     |
| Office locations              | **Collection: `offices`** (new)                                                          | Address parts, phone, hours, map link, `isPrimary`. Primary office feeds NAP/schema; future offices = add a row.                                                             |
| Contact information           | **Global: `Settings.contact`** → sourced from primary `offices` row + phone/email fields | One canonical source; config fallback retained.                                                                                                                              |
| Social media links            | **Global: `Settings.social`** (move from `@vmd/config`)                                  | Config value becomes the fallback.                                                                                                                                           |
| Footer                        | **Global: `Footer`**                                                                     | Column arrays `{heading, links[]}`, legal line toggle (text itself stays developer-controlled — compliance).                                                                 |
| CTA buttons                   | **Global: `Settings.ctaLinks`** ✅ built                                                 | Labels could be added; destinations done.                                                                                                                                    |
| Global Settings               | **Global: `Settings`** ✅ exists                                                         | Remains the umbrella for toggles above.                                                                                                                                      |
| SEO defaults                  | **Global: `SEO`** (new)                                                                  | Default meta title template, default description, default OG image, twitter handle. Per-page `seo` groups (exist) override.                                                  |
| Schema defaults               | **Global: `SEO.schema`**                                                                 | Org name/logo/sameAs (social) feed `organizationSchema`. Structure stays developer-controlled; values editable.                                                              |
| Site branding (logo, favicon) | **Global: `Branding`** (new)                                                             | Logo + favicon uploads, OG default image. **Colours stay developer-controlled** (design tokens; contrast/compliance risk) — expose at most a reviewed accent override later. |
| Client Portal button          | **Global: `Settings.clientPortal`** ✅ built                                             | Label/URL/visibility/colour(hex-validated). Add contrast validation (R-5).                                                                                                   |
| Trust section                 | **Block: `TrustStrip`** config via `Settings.googleReviews` ✅ exists                    | Rating/count/URL already CMS data.                                                                                                                                           |
| FAQ                           | **Collection: `faqs`** ✅ exists + per-doc `faq` arrays ✅                               | Add a `FAQBlock` (pick from collection or inline) for pages.                                                                                                                 |
| Reusable page sections        | **`Pages` collection + Blocks library**                                                  | The core enabler — see below.                                                                                                                                                |

**Developer-controlled (deliberately):** design tokens/colour system, compliance strings
(`RMA_LINE`, `RMA_STATEMENT`, disclaimers — legal wording), URL structure/redirects
(SEO safety; editors get the existing `redirects` collection for one-offs), security
(access control, validation, headers), schema.org structure, and the block components
themselves.

## The Blocks library (Phase 2 core)

`Pages` collection: `title, slug, status, seo, layout: blocks[]` rendered by a generic
`/[...page]` route (reserved paths guarded). Initial block set — Hero, RichText,
FeaturedServices, FeaturedPosts, SuccessStoriesCarousel, FAQBlock, CTABand, TrustStrip,
TeamGrid, ContactPanel, MediaEmbed. Each is a typed Payload block + one Astro component.
This is what makes **landing pages, webinar pages, downloadable-guide pages and future
campaigns** zero-code: editors compose existing blocks.

## Scalability notes

- **New services/offices/team** = new collection rows (already true for services).
- **Languages**: Payload localization can be enabled per-field later (`localized: true`
  already used on the legacy hub); route strategy (`/en`, `/ne`…) is a dev task once
  content strategy exists — the collections don't change.
- **Calculators/webinars/guides**: each is a new block (+ collection if it has records,
  e.g. `webinars`, `downloads` with gated-file fields). The Pages/Blocks frame absorbs
  them without redesign.
- **Migration safety**: every Global ships with the current hardcoded values as defaults,
  so nothing visually changes at rollout; editors take over gradually.

## Rollout phases (each independently shippable)

1. **Phase 1 — Globals parity** (low risk): Navigation, Footer, Announcement,
   `Settings.social`, SEO defaults, Branding (logo/favicon). Frontend reads global →
   falls back to config. _Est: small._
2. **Phase 2 — Pages + Blocks library**: collection, renderer route, the 11 blocks;
   rebuild the homepage as the first block-composed page. _Est: the big one._
3. **Phase 3 — People & places**: `team-members`, `offices`; wire About/NAP/schema;
   merge `testimonials` into `success-stories`. _Est: small-medium._

## Requested decisions

1. Approve the Global/Collection/Block/dev-controlled split above (esp. colours staying
   developer-controlled).
2. Approve merging `testimonials` into `success-stories` (one home for social proof).
3. Approve phase order (1 → 2 → 3), or reprioritise.
