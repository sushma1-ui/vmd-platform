import { createClient, type SupabaseClient } from '@supabase/supabase-js';
/** SERVER-ONLY. Service-role key bypasses RLS. Never import from client code. */
export interface ServerDbConfig {
  url: string;
  serviceRoleKey: string;
}
export function createServerClient(cfg: ServerDbConfig): SupabaseClient {
  return createClient(cfg.url, cfg.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
