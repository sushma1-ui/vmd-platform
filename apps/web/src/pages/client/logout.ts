import type { APIRoute } from 'astro';
import { serverSupabase } from '../../lib/supabase.ts';
export const prerender = false;
export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sb = serverSupabase(cookies);
  if (sb) await sb.auth.signOut();
  return redirect('/client/login');
};
