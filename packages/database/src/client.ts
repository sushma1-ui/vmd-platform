import { createClient, type SupabaseClient } from '@supabase/supabase-js';
/** Browser-safe Supabase client (anon key). RLS applies. Never add the service key. */
export interface PublicDbConfig {
  url: string;
  anonKey: string;
}
export function createPublicClient(cfg: PublicDbConfig): SupabaseClient {
  return createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true } });
}
