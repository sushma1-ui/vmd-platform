import type { CollectionBeforeChangeHook, TypeWithID } from 'payload';

interface Publishable extends TypeWithID {
  status?: 'draft' | 'scheduled' | 'published' | null;
  publishedAt?: string | null;
}

/**
 * Auto "Published" date (Blueprint §6). Set ONCE — the first time status becomes
 * 'published' — and immutable afterwards. Editors cannot change it (the field is
 * readOnly in admin, and this hook always restores the original value on edit).
 *
 * "Last Updated" needs no hook: Payload's built-in `updatedAt` is set automatically
 * on every save and is not editable — the frontend simply displays it.
 */
export const setPublishedAt: CollectionBeforeChangeHook<Publishable> = ({ data, originalDoc }) => {
  if (originalDoc?.publishedAt) {
    data.publishedAt = originalDoc.publishedAt;
  } else if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }
  return data;
};
