# CONTRIBUTING

## Branch & PR
- Branch from `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- A PR must pass **CI** (typecheck · lint · boundaries · stylelint · duplication · build ·
  secret scan) and, once wired, the a11y and Lighthouse gates.

## Definition of Done
- [ ] Types pass (`pnpm typecheck`), no `any` without a written reason.
- [ ] Public API only; no deep imports.
- [ ] No raw hex/px; new design values added to `@vmd/tokens`.
- [ ] No new duplication (jscpd < 2%).
- [ ] Accessibility: keyboard operable, labelled, AA contrast (AAA on legal/fees).
- [ ] If behaviour changes a documented decision, the relevant `docs/` file is updated
      (or a new ADR added). A stale source of truth is worse than none.

## Non-negotiables (compliance)
- No invented success rates, no guaranteed-outcome language, ever (Code of Conduct / ACL).
- Disclaimers are a designed, legible component — never hidden fine print.
- No fabricated reviews, testimonials, grant outcomes, or fees. Empty states until real,
  consented data exists.
