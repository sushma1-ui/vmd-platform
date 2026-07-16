-- 0001_client_plane.sql — Plane B (Supabase-owned, RLS-enforced). Forward-only.
-- Client-portal tables. Accessed browser-direct with the client's JWT; RLS is the
-- boundary (ADR-0002). References Plane-A ids but holds only client-readable data.

create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  lead_id text,                       -- soft ref to Payload leads.id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('client','practice')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_client_messages_user on public.client_messages(user_id, created_at desc);

create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,         -- private bucket object path
  mime_type text,
  size_bytes bigint,
  provider text not null default 'supabase',   -- ADR-0003: onedrive-ready
  provider_ref text,
  uploaded_at timestamptz not null default now()
);
create index if not exists idx_client_documents_user on public.client_documents(user_id, uploaded_at desc);

alter table public.client_profiles  enable row level security;
alter table public.client_messages  enable row level security;
alter table public.client_documents enable row level security;
