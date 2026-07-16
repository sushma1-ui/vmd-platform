# ADR-0001 — Provider-agnostic scheduling (`packages/scheduling`)

- **Status:** Accepted (ratified by the client, this engagement)
- **Date:** July 2026
- **Supersedes:** the Modular Architecture tree's placement of booking as
  "a Bookings collection + web component" only. Adds one leaf capability package.

## Context

The client's Version 1 requires a **native VMD consultation booking flow**, with the
scheduling layer kept **swappable** (Cal.com, Google Calendar, Outlook, Calendly, or
another provider) with no change to the frontend or business logic. All consultation
requests must be **stored in our own database first**, with the provider acting only
as an integration layer.

The ratified Modular Architecture (§2.3) classifies *content types* as CMS collections
and *capabilities* (reusable, provider-swappable code) as packages — `email` is the
canonical example. Scheduling has both aspects: the **record** is a content type; the
**provider** is a capability. Splitting it along the doc's own taxonomy resolves the
apparent conflict.

## Decision

1. **`apps/cms/collections/Consultations.ts`** — the system-of-record. Owns the status
   lifecycle (`requested → confirmed → rescheduled → completed → cancelled → no_show`),
   independent of any external calendar.
2. **`packages/scheduling`** — a new **leaf capability** (peer of `email`, `auth`,
   `database`, `analytics`; depends only on `@vmd/schema` + `@vmd/config`). It exposes
   the `SchedulingProvider` **port** and internal **adapters**.
3. **`packages/schema/src/booking.ts`** — the shared `ConsultationRequest` /
   `ConsultationRecord` contract, consumed by both apps.

The booking flow depends on the **port**, never a concrete provider. Provider selection
is `SCHEDULING_PROVIDER` (env). V1 ships the **manual** adapter (appointment-only
practice); others are added later with zero caller changes.

## The interface (port)

```ts
interface SchedulingProvider {
  readonly id: 'manual' | 'calcom' | 'calendly' | 'google' | 'outlook';
  getAvailability(range: DateRange, opts: AvailabilityOptions): Promise<Slot[]>;
  createAppointment(input: AppointmentInput): Promise<ProviderRef>;   // idempotent by bookingKey
  reschedule(ref: ProviderRef, slot: Slot): Promise<ProviderRef>;
  cancel(ref: ProviderRef): Promise<void>;
}
```

## Guarantees (design invariants)

- **Record-first.** Our DB row is written and confirmed *before* the provider call, so
  a provider outage never loses a lead.
- **Idempotent.** `createAppointment` is keyed by our consultation id (`bookingKey`);
  retries never double-book.
- **Minimal PII crosses the boundary.** Only what scheduling needs (name, email, slot);
  sensitive migration context stays in our DB under RLS.
- **Reconciliation.** The opaque `ProviderRef` is stored on the record; status syncs via
  provider webhooks where supported, polling where not.

## Extension points (adding a provider)

1. Implement `SchedulingProvider` in `packages/scheduling/src/adapters/<provider>.ts`.
2. Register it in the `getSchedulingProvider` factory (`src/index.ts`).
3. Add any provider env to `@vmd/config/env`.
No changes to `apps/web` or the booking business logic.

## Consequences

- One extra package (accepted). The public surface (`getSchedulingProvider` + port types)
  is small and stable.
- Callers must import from `@vmd/scheduling` only, never an adapter directly — enforced by
  the no-deep-import lint rule (LAW 2).
