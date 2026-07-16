import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from './lib/supabase.ts';
import { getRedirects, type Redirect } from './lib/cms.ts';

/** Auth guard for the portal. /client/* requires a session, except login/logout. */
const PUBLIC_CLIENT = new Set(['/client/login', '/client/login/', '/client/logout', '/client/logout/']);

/** Canonical form for redirect matching: leading slash, no trailing slash (except root), lower-case. */
function canon(path: string): string {
  let p = path.trim().toLowerCase();
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * Editor-managed redirects, cached in module scope so the CMS is queried at most once
 * per cold instance per TTL — never per request. Empty/stale-safe: if the CMS is
 * unreachable getRedirects() returns [], and we simply don't redirect.
 */
const REDIRECT_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; map: Map<string, { to: string; code: 301 | 302 }> } | null = null;

async function redirectMap(): Promise<Map<string, { to: string; code: 301 | 302 }>> {
  if (cache && Date.now() - cache.at < REDIRECT_TTL_MS) return cache.map;
  const rows: Redirect[] = await getRedirects();
  const map = new Map<string, { to: string; code: 301 | 302 }>();
  for (const r of rows) if (r.from && r.to) map.set(canon(r.from), { to: r.to, code: r.code });
  cache = { at: Date.now(), map };
  return map;
}

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals }, next) => {
  const { pathname } = url;

  // 1 · Editor-managed redirects — preserve link equity from the WordPress→Astro
  // migration. Skip the portal, the API, and asset-like paths (anything with a dot).
  if (!pathname.startsWith('/client') && !pathname.startsWith('/api') && !pathname.includes('.')) {
    const map = await redirectMap();
    if (map.size) {
      const hit = map.get(canon(pathname));
      if (hit) return redirect(hit.to, hit.code);
    }
  }

  // 2 · Portal auth guard. /client/* requires a session, except login/logout.
  if (pathname.startsWith('/client')) {
    const user = await getSessionUser(cookies);
    (locals as Record<string, unknown>).user = user;
    if (!user && !PUBLIC_CLIENT.has(pathname)) {
      return redirect(`/client/login?next=${encodeURIComponent(pathname)}`);
    }
  }

  return next();
});
