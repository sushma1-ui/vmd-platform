import type { CollectionAfterChangeHook, GlobalAfterChangeHook, TypeWithID } from 'payload';

/**
 * Publish hooks — after a content change, make it go live on the website.
 *
 * Two mechanisms, BOTH best-effort (a content save must NEVER fail because the site
 * could not be refreshed):
 *   1. ping()          — asks the web app's on-demand ISR endpoint to re-render the
 *                        affected pages (fast, per-page) when it is reachable.
 *   2. triggerDeploy() — fires a Vercel Deploy Hook that rebuilds the whole site.
 *                        This is the RELIABLE path: the web is a Turborepo project
 *                        that skips rebuilds on CMS-only changes, and CMS *content*
 *                        never touches the repo — so without an explicit trigger a
 *                        published edit would never reach the live (static) site.
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

/** Fire the Vercel Deploy Hook (VERCEL_DEPLOY_HOOK_URL) to rebuild the live site. */
async function triggerDeploy(): Promise<void> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return;
  try {
    await fetch(hook, { method: 'POST' });
  } catch {
    /* rebuild is best-effort — never block or fail a content save */
  }
}

/**
 * Only rebuild for content that is actually public: skip pure draft saves (whose
 * _status is 'draft'). Content types without a draft/publish workflow have no
 * _status and are live on save, so they rebuild too.
 */
function isLive(doc: { _status?: string | null } | undefined): boolean {
  return doc?._status !== 'draft';
}

/** Runs on every collection; passes the collection slug + document slug. */
export const revalidateAfterChange: CollectionAfterChangeHook<TypeWithID> = async ({
  doc,
  collection,
}) => {
  await ping(collection.slug, (doc as { slug?: string }).slug);
  if (isLive(doc as { _status?: string | null })) await triggerDeploy();
  return doc;
};

/** Runs on every global; the global slug (e.g. "homepage") drives the path map. */
export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({ doc, global }) => {
  await ping(global.slug);
  if (isLive(doc as { _status?: string | null })) await triggerDeploy();
};
