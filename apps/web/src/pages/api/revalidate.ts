import type { APIRoute } from 'astro';
export const prerender = false;

/**
 * On-demand ISR trigger, called by the Payload revalidate hook after a content
 * change. Verifies a shared secret, maps the changed collection/global to the
 * page paths it affects, then asks Vercel to regenerate each of those cached
 * pages by re-requesting them with the ISR bypass token (the same secret, set as
 * `isr.bypassToken` in astro.config). Detail pages not mapped here still refresh
 * on the 1-hour ISR timer.
 */
const SECRET = import.meta.env.REVALIDATE_SECRET;

function pathsToRevalidate(collection?: string, slug?: string): string[] {
  // The homepage aggregates featured services, blogs and reviews, so refresh it
  // for almost any content change.
  const paths = new Set<string>(['/']);
  switch (collection) {
    case 'homepage':
      break; // '/' already queued
    case 'about-page':
      paths.add('/about/');
      break;
    case 'contact-page':
      paths.add('/contact/');
      break;
    case 'articles':
      paths.add('/blog/');
      if (slug) paths.add(`/blog/${slug}/`);
      break;
    case 'service-pages':
      paths.add('/services/');
      // A service page lives under /services or /visas depending on its section;
      // regenerate both candidates (a 404 for the wrong one is harmless).
      if (slug) {
        paths.add(`/services/${slug}/`);
        paths.add(`/visas/${slug}/`);
      }
      break;
    // Sitewide chrome — refresh the primary landing pages.
    case 'navigation':
    case 'footer':
    case 'social-media':
    case 'settings':
    case 'disclaimers':
      ['/about/', '/contact/', '/services/', '/blog/'].forEach((p) => paths.add(p));
      break;
    default:
      // Reference/content collections surface on listings that the ISR timer
      // covers; still refresh the homepage above.
      break;
  }
  return [...paths];
}

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get('x-revalidate-secret');
  if (!SECRET || !secret || secret !== SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: { collection?: string; slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* an empty/invalid body just refreshes the homepage */
  }

  const origin = new URL(request.url).origin;
  const paths = pathsToRevalidate(body.collection, body.slug);

  // Requesting a path with the bypass token makes Vercel re-render and re-cache it.
  const results = await Promise.allSettled(
    paths.map((p) =>
      fetch(new URL(p, origin).toString(), {
        headers: { 'x-prerender-revalidate': SECRET },
      }),
    ),
  );
  const revalidated = results.filter((r) => r.status === 'fulfilled').length;

  return new Response(JSON.stringify({ ok: true, paths, revalidated }), {
    headers: { 'content-type': 'application/json' },
  });
};
