-- RLS: a client reads and uploads only their own documents. No cross-tenant access.
create policy "documents_select_own" on public.client_documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.client_documents
  for insert with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.client_documents
  for delete using (auth.uid() = user_id);
