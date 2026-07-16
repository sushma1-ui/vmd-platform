# ADR-0002 — Two-plane data model (Payload-owned vs Supabase-RLS)

- **Status:** Accepted
- **Date:** July 2026
- **Context doc:** Modular Architecture §2.3 (content types are collections),
  Blueprint §9 (lead capture), §17 (security), §18 (client portal, Phase 2).

## Problem

Payload and Supabase both want to own Postgres. RLS only protects **browser-direct**
access (anon/authenticated JWTs); it does not constrain Payload, which connects with a
privileged role. We must say, per table, which system is the access boundary — or the
security model is ambiguous exactly where it matters (the refusal intake, client docs).

## Decision — two planes on one Postgres database

**Plane A — Content & operations (Payload-owned).** Managed in the admin; access control
is **Payload RBAC**, not RLS. Public form submissions are written **server-side** via the
Payload Local API from `apps/web` API routes — never from the browser. Tables:
Articles, Services, Subclasses, Situations, FAQs, Testimonials, CaseStudies, GrantLedger,
ProcessingTimes, PinnedReviews, Redirects, Users, Media, AuditLog, **Leads**, **Consultations**.

**Plane B — Client portal (Supabase-owned, RLS-enforced).** Accessed **browser-direct**
by an authenticated client using their Supabase JWT; **RLS** enforces per-user isolation
(`auth.uid()`). Tables: `client_profiles`, `client_messages`, `client_documents`. These
reference Plane-A records by id but expose only what a logged-in client may read. Built as
foundation now; surfaced in the Phase-2 portal.

## Consequences

- One writer per table. Leads/Consultations are Payload's; the browser never writes them
  directly, so the service-role key never reaches the client (CI-verified).
- Client documents live in a private Supabase Storage bucket with RLS + type/size limits
  + encryption at rest (Blueprint §17.4). File-upload architecture is future-ready for
  OneDrive automation and AI document checks (see ADR-0003).
- The two planes share ids but not credentials; a breach of one plane does not grant the other.
