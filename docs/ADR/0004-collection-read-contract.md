# ADR-0004 — Every collection has a decided read contract before it renders

- **Status:** Accepted
- **Date:** July 2026
- **Context doc:** Modular Architecture §4.3 (enforcement matrix), ADR-0002 (two-plane
  data model — which tables are public content vs operational/private).

## Problem

The audit that found four collections missing a `cms.ts` read helper was manual. Manual
audits rot: the next collection added slips in without a read contract, and the drift
surfaces as either a page that can't fetch its data or — worse — an operational table
(Leads, Consultations) accidentally exposed to the browser. The architecture's own
principle is that a rule not enforced by tooling is broken by sprint three.

## Decision — the read-contract pipeline, gated in CI

Every Payload collection sits on exactly one of three rails, keyed by slug:

- **PUBLIC_CONTENT** — rendered on the public site. **Must** have a `cms.*` read helper
  (articles, services, subclasses, situations, faqs, testimonials, case-studies,
  grant-ledger, processing-times, pinned-reviews).
- **SYSTEM_READ** — world-readable but consumed by a system function, not a page. Read by
  a dedicated reader and **must not** appear on the public `cms` object (redirects →
  `getRedirects()`, used by middleware).
- **PRIVATE** — operational/admin data. **Must not** appear on the public `cms` read
  object; written server-side only (leads, consultations, users, audit-log, media —
  Plane A of ADR-0002).

`scripts/check-cms-contract.mjs` reads the slugs straight from the collection sources and
fails the build (and CI) when a PUBLIC_CONTENT collection lacks its helper, when a PRIVATE
or SYSTEM_READ collection is exposed on the `cms` object, or — critically — when a
collection is **unclassified**. Adding a collection therefore forces a read-contract
decision instead of allowing undefined drift.

The full intended pipeline is:

```
Payload Collection → Classification → Read Contract → Type → Renderer(s) → Tests
```

**The Type rung is a rule, not a convenience.** A read helper must expose a stable domain
model owned by `@vmd/schema`, never a raw Payload response. `cms.services()` returns
`Service[]`, not `PayloadResponse<ServiceCollection>`; `cms.caseStudies()` returns
`CaseStudy[]`. Renderers depend on the domain type, so the CMS's wire shape can change —
a Payload upgrade, a REST→Local-API swap, a field rename mapped in the helper — without a
single renderer changing. The type is the seam.

This ADR gates the **read-contract** rung mechanically today, and every helper added from
here forward MUST return a named `@vmd/schema` type (the Results-cluster helpers do:
`CaseStudy`, `Testimonial`, `PinnedReview`, `GrantLedgerEntry`). Backfilling domain types
for the older content helpers (`Service`, `Subclass`, `Situation`, `Faq`, currently loosely
typed) is tracked as follow-up, not an opportunistic rewrite. The checker also prints the
renderer and test rungs as informational columns so the remaining work stays visible.

## Phase 2 (planned — not enforced today)

Once the platform is feature-complete, the **renderer** rung becomes a gate too: every
PUBLIC_CONTENT collection must either have a renderer wired to its helper **or** explicitly
declare itself API-only in the classification. That stops forgotten collections from
accumulating a contract with no surface. It is deliberately *not* enforced while the
content surfaces are still being built (it would fail on the very pages a phase is about to
add); flipping it on is a future amendment to this ADR once the `renderer: pending` rows
are resolved. Mechanical enforcement of the **Type** rung (asserting each public helper
returns a named domain type) follows the same trajectory.

## Consequences

- The audit is now mechanical: `pnpm run check:contract` is the single source of truth for
  contract coverage, and it runs in `verify` and CI before build.
- A new collection cannot be merged unclassified. The classification lives in one file and
  is grounded in ADR-0002, so "is this public or private data?" is answered on purpose.
- The informational rungs make the phase work legible: at time of writing, testimonials,
  case-studies, pinned-reviews and processing-times show `contract: ok, renderer: pending`
  — exactly the state the Results and Index phases resolve.
