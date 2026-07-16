# VMD Platform — Architecture

One monorepo. Two apps — **Astro** (public) and **Payload** (admin + content API).
Shared code lives in a small set of packages whose dependencies point one way, whose
boundaries are enforced by tooling, and whose design language is a single token package
that makes off-brand and inaccessible values impossible to import. Content is managed in
the CMS, not filed in folders. This document is the reconciliation of record; where it and
older docs differ on the file tree, this wins.

## The three laws (enforced, not requested)

1. **Dependencies point one way.** `apps → packages`. Never `packages → apps`.
   `packages → packages` only along the allowed graph. Enforced by dependency-cruiser.
2. **Every package has a public API.** Import `@vmd/ui`, never `@vmd/ui/src/...`.
   Enforced by ESLint `no-restricted-imports`.
3. **One source for each thing.** One token package. One schema per entity. One article
   renderer. Enforced by Stylelint (no raw hex/px), jscpd (<2% duplication), and the
   single `@vmd/schema`.

## Dependency graph

```
apps/web · apps/cms
        │
   ┌────┼───────────────┐
   ▼    ▼               ▼
  ui   forms           seo
   │    │               │
   ▼    ▼               │
 tokens schema ◄────────┘
   │      │
   └──┬───┘
      ▼
   config          ← foundation. depends on nothing.

auth · database · email · analytics · scheduling → schema, config   (leaf capabilities)
```

Arrows point downward only; dependency-cruiser fails the build on any upward or lateral edge.

## Enforcement matrix (every item is a red X on a PR, not an opinion)

| Goal | Enforced by |
| --- | --- |
| No duplicated styles | Stylelint disallowed hex/px; `@vmd/tokens` is the only CSS-var source |
| No duplicated logic | single `@vmd/schema` Zod source |
| No duplicated code | jscpd (>2% fails) |
| Modular boundaries | dependency-cruiser + ESLint no-deep-import |
| Accessible by default | axe-core per route (QA module) |
| Fast | Lighthouse CI + JS budget (Performance module) |
| Gold-never-text | `@vmd/tokens` build-time contrast gate |
| Type-safe | `tsc --noEmit`, strict |
| No service_role leak | `scripts/check-no-service-role.sh` in CI |
| Every collection has a read contract | `scripts/check-cms-contract.mjs` (`check:contract`) in CI — ADR-0004 |

## Surfaces → deployables

- `apps/web` (Astro) — public platform + the 3 authed client routes under
  `src/pages/client/` (noindex, SSR). The client portal is **not** a separate app.
- `apps/cms` (Payload 3, Next) — the **sole** admin and the content API. On Vercel with
  the pooled Supabase Postgres connection + Supabase Storage.

## Data ownership boundary

- **Payload owns content** (Articles, Services, FAQs, Testimonials, Case Studies, Grant
  Ledger, Media, Redirects, Users, Audit) and the whole admin surface.
- **Supabase owns application data + client identity** (RLS-protected leads/consultations/
  messages, auth for the client routes, storage). One writer per table.

See `docs/ADR/` for decisions, starting with ADR-0001 (scheduling).
