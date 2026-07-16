# ADR-0003 — AI-ready content & document architecture

- **Status:** Accepted (forward-looking; nothing AI runs at launch)
- **Date:** July 2026

## Decision

Design the schema so future AI features attach without a migration-heavy rebuild:

1. **Structured, not blobbed.** Health Check answers persist as typed columns/fields
   (Blueprint §9.4), never a text blob — already the case in `@vmd/schema`.
2. **Embeddings-ready.** A guarded `pgvector` extension + `article_embeddings` table
   (nullable, populated later) enables semantic search / AI-citation tooling without
   touching the content model.
3. **Document quality checks.** A `document_ai_checks` table records future automated
   checks against uploaded client documents (status, findings JSONB), decoupled from the
   document row so the checker is swappable — the same port pattern as scheduling (ADR-0001).
4. **OneDrive-ready uploads.** `client_documents` carries a `provider` + `provider_ref`
   so storage can later mirror to OneDrive without changing the row shape.

Nothing here activates at launch; it is structure, so the expensive rebuild never happens.
