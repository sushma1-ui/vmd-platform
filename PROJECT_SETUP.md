# PROJECT_SETUP

## Prerequisites

- **Node ≥ 20.11** (`.nvmrc` pins 20.11.0; the toolchain also runs on Node 22).
- **pnpm ≥ 9** — get it via `corepack enable` (bundled with Node).
- A **Supabase** project in the **Sydney** region (AU data residency).
- A **Postmark** server token (transactional email).
- A **Vercel** account (hosting) — configured in the deploy module.

## Install

```bash
corepack enable
pnpm install --frozen-lockfile   # or `pnpm install` on first run to create the lockfile
```

## Environment

```bash
cp .env.example .env
```

Fill in the values. The schema is validated at boot (`@vmd/config/env`); a missing or
malformed variable throws a readable error. **Never commit `.env`.** `SUPABASE_SERVICE_ROLE_KEY`
and `PAYLOAD_SECRET` are server-only.

## Generate design tokens

```bash
pnpm --filter @vmd/tokens build
```

This writes `packages/tokens/dist/tokens.css` and **runs the contrast gate**. If any
text token drops below WCAG AA — or gold/azure is ever used as text — the build fails.

## Required dependencies (installed by `pnpm install`)

- Root tooling: turbo, typescript, eslint, prettier, stylelint, dependency-cruiser,
  jscpd, husky, commitlint.
- `apps/web`: astro, @astrojs/tailwind, tailwindcss.
- `apps/cms`: payload (v3).
- Packages: zod (schema/config/scheduling).

## Run

```bash
pnpm dev       # all dev servers (Turborepo)
pnpm build     # production build of every app + package
pnpm verify    # the full CI gate locally
```
