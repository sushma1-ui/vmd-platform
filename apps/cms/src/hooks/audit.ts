import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

/**
 * Audit hook — appends to audit-log on every change/delete across Plane A. Attached
 * globally in payload.config. The audit-log collection itself is excluded to avoid
 * recursion. (Blueprint §17.)
 */
export const auditAfterChange: CollectionAfterChangeHook = async ({
  req,
  operation,
  collection,
  doc,
}) => {
  if (collection.slug === 'audit-log') return doc;
  await req.payload.create({
    collection: 'audit-log',
    data: {
      action: operation === 'create' ? 'create' : 'update',
      collectionSlug: collection.slug,
      docId: String(doc.id),
      user: req.user?.id,
      summary: `${operation} on ${collection.slug}`,
    },
    overrideAccess: true,
  });
  return doc;
};

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ req, collection, id }) => {
  if (collection.slug === 'audit-log') return;
  await req.payload.create({
    collection: 'audit-log',
    data: {
      action: 'delete',
      collectionSlug: collection.slug,
      docId: String(id),
      user: req.user?.id,
    },
    overrideAccess: true,
  });
};
