# @vmd/schema

The shared contract (ARCHITECTURE.md §2.4). Zod schemas consumed by **both** apps:
`apps/web` validates form submissions against them; `apps/cms` derives collection
shapes from them. One `Lead`, one `Consultation`, one `HealthCheckSubmission`,
one `Article`. If web and cms ever define the same shape twice, CI (jscpd + the
boundary rules) is designed to surface it.

Depends only on `@vmd/config` (implicitly) + `zod`.
