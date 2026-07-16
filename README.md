# Visa & Migration Doctors — Digital Platform

Premium, honest migration advice made **checkable**. A monorepo built so that trust,
performance, accessibility, SEO and maintainability are enforced by tooling, not hoped for.

- **Public site:** Astro (SSG/ISR, ~0KB JS by default) — `apps/web`
- **Admin + content API:** Payload 3 — `apps/cms`
- **Design system:** one token package with a build-time contrast gate — `packages/tokens`
- **Contract:** one Zod schema shared by both apps — `packages/schema`

> Principal: Sunil Uprety · Registered Migration Agent · MARN 2318234 · Perth, WA
> Bound by the OMARA Migration Agents Code of Conduct.

## Quick start

```bash
corepack enable                 # provides pnpm
pnpm install
cp .env.example .env            # fill in values
pnpm --filter @vmd/tokens build # generate tokens.css (runs the contrast gate)
pnpm dev                        # web + cms via Turborepo
```

Full setup: **PROJECT_SETUP.md** · daily workflow: **DEVELOPMENT_GUIDE.md** ·
contributing: **CONTRIBUTING.md** · architecture: **ARCHITECTURE.md**.

## Test

```bash
pnpm test:unit   # unit tests (tokens, scheduling, schema logic)
```

Deploy: see **DEPLOYMENT.md**.

## Verify everything

```bash
pnpm run verify   # typecheck · lint · boundaries · stylelint · duplication · build · secrets
```

## Source of truth

The numbered project documents live in `docs/` and govern the build. Any deviation is a
numbered ADR in `docs/ADR/`, never a silent change.
