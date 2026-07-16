# @vmd/tokens

THE design system, as one package (ARCHITECTURE.md §6). One vocabulary — colour,
type, space, shadow, motion, radius — emitted as **CSS custom properties** and
**typed TS**, from a single source.

- `pnpm --filter @vmd/tokens build` → generates `dist/tokens.css` + `dist/tokens.ts`.
- The build **fails** if any text-role token drops below WCAG AA, or if gold/azure
  is ever mapped to a light-text role. Gold can never carry text — by construction.
- `@vmd/tokens/tailwind-preset` maps only token values into Tailwind, so no
  off-brand utility class is expressible.

Depends only on `@vmd/config`.
