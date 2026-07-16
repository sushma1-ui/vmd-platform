# @vmd/scheduling  (ADR-0001)

Provider-agnostic scheduling. The booking flow depends on the `SchedulingProvider`
port; concrete providers are internal and swapped via `SCHEDULING_PROVIDER`.

**V1:** `ManualSchedulingProvider` — the appointment-only practice records intent,
confirmation happens out of band, and no external calendar can cause a lost lead.

**Adding a provider** (future): implement `SchedulingProvider` in `src/adapters/`,
register it in the `getSchedulingProvider` factory. No changes to `apps/web` or the
business logic. Full rationale + extension points: `docs/ADR/0001-*`.

Depends on `@vmd/schema` + `@vmd/config`.
