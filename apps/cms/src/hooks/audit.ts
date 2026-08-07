import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypeWithID } from 'payload';

/**
 * Audit hook — appends to audit-log on every change/delete across Plane A. Attached
 * globally in payload.config. The audit-log collection itself is excluded to avoid
 * recursion. (Blueprint §17.)
 *
 * BEST-EFFORT: writing the audit trail must NEVER block or fail the content save
 * that triggered it. The main document has already been written by the time an
 * afterChange/afterDelete hook runs, so if the audit-log write throws (e.g. a
 * transient DB error), we log it and return normally rather than surfacing a
 * generic "Something went wrong" to the editor for a save that actually succeeded.
 *
 * Parameterised with `TypeWithID` because these hooks run on every collection — the
 * only field they read is the document `id`, so the base document type is exact.
 */
export const auditAfterChange: CollectionAfterChangeHook<TypeWithID> = async ({
  req,
  operation,
  collection,
  doc,
}) => {
  if (collection.slug === 'audit-log') return doc;
  try {
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
  } catch (err) {
    req.payload.logger.error(
      { err, collection: collection.slug, docId: doc.id },
      'audit-log write failed (content save was not affected)',
    );
  }
  return doc;
};

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ req, collection, id }) => {
  if (collection.slug === 'audit-log') return;
  try {
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
  } catch (err) {
    req.payload.logger.error(
      { err, collection: collection.slug, docId: id },
      'audit-log delete-log write failed (delete was not affected)',
    );
  }
};
