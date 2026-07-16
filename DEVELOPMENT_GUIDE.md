# DEVELOPMENT_GUIDE

## Mental model
- **Capability?** (reusable code, no opinion about migration) → a `packages/*` package.
- **Content type?** (authored, managed) → a Payload collection in `apps/cms`.
- **A page or route?** → `apps/web/src/pages`.

## The rules you will actually hit
1. **Import public APIs only.** `import { Button } from '@vmd/ui'` — never
   `@vmd/ui/src/...`. ESLint blocks the deep import.
2. **No raw colours or spacing.** Use `var(--color-action)`, `var(--space-4)`. Stylelint
   blocks literal hex/px. Add a *new* value only in `@vmd/tokens`.
3. **One schema.** Validate and model from `@vmd/schema`. Don't redefine a shape in an app.
4. **Dependencies point down.** A package importing an app, or a lateral/upward package
   edge, fails `pnpm boundaries`.

## Common commands
```bash
pnpm --filter @vmd/web dev            # one app
pnpm --filter @vmd/tokens build       # regenerate tokens after a design change
pnpm run boundaries                   # check the dependency graph
pnpm run duplication                  # copy-paste detector
pnpm run typecheck && pnpm run lint
```

## The Rule of Three (when to extract)
Write it inline the first time. Copy it the second. On the **third** use, extract it into
the owning package. Premature abstraction is as costly as duplication.

## Adding a scheduling provider (ADR-0001)
Implement `SchedulingProvider` in `packages/scheduling/src/adapters/`, register it in the
factory, add any env to `@vmd/config/env`. No caller changes.

## Commits
Conventional Commits, enforced by commitlint (e.g. `feat(web): add hero section`).
Husky runs formatting + stylelint pre-commit.
