import type { CollectionAfterChangeHook } from 'payload';

/**
 * Revalidate hook — pings the web app's on-demand ISR endpoint after a content
 * change so edits go live without a full rebuild.
 */
export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, collection }) => {
  const url = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return doc;
  try {
    await fetch(`${url}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ collection: collection.slug, slug: (doc as { slug?: string }).slug }),
    });
  } catch { /* revalidation is best-effort */ }
  return doc;
};
