import type { CollectionAfterChangeHook, GlobalAfterChangeHook, TypeWithID } from 'payload';

/**
 * Revalidate hooks — ping the web app's on-demand ISR endpoint after a content
 * change so edits go live without a full rebuild. Best-effort: if the web URL or
 * shared secret is not configured, this no-ops (the 1-hour ISR timer still applies).
 */
async function ping(collectionSlug: string, docSlug?: string): Promise<void> {
  const url = process.env.PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(`${url}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ collection: collectionSlug, slug: docSlug }),
    });
  } catch {
    /* revalidation is best-effort — never block or fail a content save */
  }
}

/** Runs on every collection; passes the collection slug + document slug. */
export const revalidateAfterChange: CollectionAfterChangeHook<TypeWithID> = async ({
  doc,
  collection,
}) => {
  await ping(collection.slug, (doc as { slug?: string }).slug);
  return doc;
};

/** Runs on every global; the global slug (e.g. "homepage") drives the path map. */
export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({ global }) => {
  await ping(global.slug);
};
