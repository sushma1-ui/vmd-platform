-- RLS: a client sees and edits only their own profile.
create policy "profiles_select_own" on public.client_profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.client_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_insert_self" on public.client_profiles
  for insert with check (auth.uid() = user_id);
