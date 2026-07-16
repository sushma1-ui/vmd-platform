# @vmd/web — public platform (Astro)
Static-first, ~0KB JS by default. Interactivity is opt-in per island (§1). Consumes
the shared packages; imports the token stylesheet once via the Base layout. The
3 authenticated client routes live under `src/pages/client/` (noindex, SSR) — not
a separate app (ARCHITECTURE.md §3.1). Pages are built module by module.
