-- RLS: a client reads only their own thread and may only send as themselves.
create policy "messages_select_own" on public.client_messages
  for select using (auth.uid() = user_id);
create policy "messages_insert_as_client" on public.client_messages
  for insert with check (auth.uid() = user_id and sender = 'client');
-- Practice replies are written server-side with the service role (bypasses RLS).
