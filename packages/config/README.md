# @vmd/config

The **foundation** package. Depends on nothing (ARCHITECTURE.md §4.2) so everything
else can stand on it.

Exports:

- `./tsconfig.base.json` — the strict TS base every package extends.
- `./eslint` — shared flat config, including the no-deep-import boundary rule (LAW 2).
- `./prettier` — shared formatting.
- `./env` — `serverEnv()` / `publicEnv()`, Zod-validated, with the server/public split.
- `.` — canonical `PRACTICE` identity (NAP, MARN, regulator) and the locked `DISCLAIMERS`.

This is **not** a utility junk drawer. Capability helpers live in their own package.
