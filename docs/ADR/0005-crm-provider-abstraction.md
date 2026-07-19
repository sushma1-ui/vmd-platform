# ADR-0005 — Provider-agnostic CRM + HubSpot migration plan (`packages/crm`)

- **Status:** Accepted (this engagement)
- **Date:** July 2026
- **Related:** ADR-0001 (scheduling provider), ADR-0002 (two-plane data model).

## Context

Every **Free Visa Health Check** is lead capture, not an automated assessment. The
client requires that each submission automatically becomes a CRM **Contact** and can
later be attached to a **sales pipeline** (HubSpot is the chosen CRM). The CRM must be
**swappable** and must never be a hard dependency of the submission flow — a CRM outage
or missing credentials must not stop a client from submitting.

The ratified architecture classifies reusable, provider-swappable code as **capability
packages** (`email`, `scheduling`). The CRM is exactly such a capability.

## Decision

1. **`packages/crm`** — a leaf capability exposing the `CrmProvider` **port** and
   internal **adapters**. The lead pipeline depends on the port, never a concrete CRM.
   - `ManualCrmProvider` — secure-by-default no-op (no external call); used whenever no
     CRM credentials exist. Returns a typed `{ ok: true, skipped: true }`.
   - `HubSpotCrmProvider` — idempotent Contact upsert by email (CRM v3 batch upsert).
     Never throws for expected conditions; failures become a typed `{ ok: false }`.
   - `getCrmProvider(config)` — factory; selects HubSpot iff a token is configured,
     otherwise manual. Adding a real token later activates HubSpot with **no caller
     change**.
2. **The system of record is our own `leads` collection** (Plane A), written first.
   HubSpot is a downstream integration, mirroring the ADR-0001 "store first" rule.
3. **The token is server-only** (`HUBSPOT_ACCESS_TOKEN`), read in the web API route,
   never shipped to the browser.

## Pipeline

```
Website → Free Visa Health Check form
        → validate (Zod, @vmd/schema)
        → store in `leads` (Payload, server-side, agent key)   ← system of record
        → email: admin notification + client confirmation (@vmd/email)
        → CRM upsert Contact (@vmd/crm; manual no-op until HubSpot is wired)
        → thank-you page (no advice, no eligibility result)

Later (sales): HubSpot Contact → Lifecycle stage → Deal in the sales pipeline
             → Consultation booking (ADR-0001)
```

The submission never blocks on email or CRM: both are best-effort side effects after
the lead is safely stored.

## Contact data mapping (`CrmContact` → HubSpot)

| CrmContact         | HubSpot property (standard/custom) |
| ------------------ | ---------------------------------- |
| `email`            | `email` (standard, idProperty)     |
| `firstName`        | `firstname` (standard)             |
| `phone`            | `phone` (standard)                 |
| `country`          | `country` (standard)               |
| `lifecycleStage`   | `lifecyclestage` (standard)        |
| `leadSource`       | `lead_source` (custom)             |
| `submissionId`     | `submission_id` (custom)           |
| `nationality`      | `nationality` (custom)             |
| `currentVisa`      | `current_visa` (custom)            |
| `situation`        | `situation` (custom)               |
| `answers`, `notes` | Note engagement (see phase 3)      |

## Migration plan (HubSpot)

**Phase 0 — shipped now (no credentials):**

- `packages/crm` with the port + manual + HubSpot adapters, unit-tested with a stubbed
  transport. The web API route already calls `getCrmProvider(...).upsertContactFromLead`.
  With no token, the manual adapter runs (no external call). Nothing else to change.

**Phase 1 — HubSpot portal setup (client, no code):**

- Create a **Private App** access token with `crm.objects.contacts.read/write` scopes.
- Create the **custom contact properties** in the mapping table above
  (`lead_source`, `submission_id`, `nationality`, `current_visa`, `situation`).
- Confirm lifecycle stages and create the **sales pipeline** + deal stages.

**Phase 2 — activate (one env var):**

- Add `HUBSPOT_ACCESS_TOKEN` to `.env`. The factory now returns the HubSpot adapter and
  every submission upserts a Contact. **No structural code change.**
- Add `HUBSPOT_ACCESS_TOKEN` (optional) to the env schema and `.env.example`.

**Phase 3 — enrich (incremental, additive):**

- Attach a **Note** engagement carrying the full questionnaire to the Contact.
- Create/associate a **Company** when an employer sponsor is identified.
- Create a **Deal** in the sales pipeline and associate the Contact, so a Health Check
  can flow to a consultation booking (ADR-0001).
- These are new methods on the port + adapter; callers are unaffected.

## Consequences

- The submission flow is resilient: no CRM credentials, or a HubSpot outage, degrade to
  "stored + emailed", never to "lost".
- Swapping CRM (or running two) is an adapter, not a rewrite.
- Secrets stay server-side; the browser never sees the CRM token.
