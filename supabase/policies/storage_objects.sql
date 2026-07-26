-- Storage security for the client portal (S-1). Run in the Supabase SQL editor before
-- inviting clients. Enforces, at the database, what the portal UI can only suggest:
-- a client may read/upload/delete ONLY files under their own user-id folder, and the
-- bucket rejects oversized or wrong-type uploads.
--
-- Path convention (apps/web/src/pages/client/documents.astro): `<auth.uid()>/<filename>`,
-- so the first path segment must equal the caller's user id.

-- 1) Private client-documents bucket + hard limits (15 MB; pdf/jpg/png/docx only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vmd-client-docs',
  'vmd-client-docs',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) Public-read media bucket for Payload (writes happen via the service role, which
--    bypasses RLS — no write policy needed).
insert into storage.buckets (id, name, public)
values ('vmd-media', 'vmd-media', true)
on conflict (id) do update set public = excluded.public;

-- 3) RLS on storage.objects (enabled by default in Supabase; policies are deny-by-default).
--    Scope every client action to their own folder in vmd-client-docs.
drop policy if exists "client docs: read own" on storage.objects;
create policy "client docs: read own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'vmd-client-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "client docs: upload own" on storage.objects;
create policy "client docs: upload own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vmd-client-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "client docs: delete own" on storage.objects;
create policy "client docs: delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vmd-client-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- No UPDATE policy: clients cannot overwrite an object (uploads use upsert:false).
-- Public read of vmd-media is granted by the bucket's public=true flag, not a policy.
