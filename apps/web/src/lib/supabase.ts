/**
 * Supabase glue for the client portal (Plane B). Server client is cookie-bound for
 * per-request, RLS-enforced reads; browser client is for interactive auth + uploads.
 * Only the ANON key is ever used here — RLS is the boundary (ADR-0002). If Supabase
 * isn't configured, factories return null and the portal renders its signed-out state.
 */
import { createServerClient, createBrowserClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export function serverSupabase(cookies: AstroCookies) {
  if (!url || !anon) return null;
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookies.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (list) =>
        list.forEach(({ name, value, options }) => cookies.set(name, value, options)),
    },
  });
}

export function browserSupabase() {
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

export async function getSessionUser(cookies: AstroCookies) {
  const sb = serverSupabase(cookies);
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}
