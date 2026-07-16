-- 0002_ai_ready.sql — ADR-0003. Structure only; nothing AI runs at launch.

-- Embeddings for future semantic search / AI-citation tooling. Nullable, populated later.
create extension if not exists vector;

create table if not exists public.article_embeddings (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,           -- soft ref to Payload articles.id
  embedding vector(1536),
  updated_at timestamptz not null default now()
);

-- Future automated document quality checks, decoupled from the document row so the
-- checker is swappable (same port pattern as scheduling, ADR-0001).
create table if not exists public.document_ai_checks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.client_documents(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','passed','flagged','failed')),
  findings jsonb not null default '{}'::jsonb,
  checked_at timestamptz
);

alter table public.article_embeddings enable row level security;
alter table public.document_ai_checks enable row level security;
