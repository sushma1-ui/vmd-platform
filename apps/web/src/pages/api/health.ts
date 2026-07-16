import type { APIRoute } from 'astro';
// Liveness endpoint for uptime checks + CI smoke test. No secrets, no DB.
export const prerender = false;
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ status: 'ok', service: 'vmd-web' }), {
    headers: { 'content-type': 'application/json' },
  });
