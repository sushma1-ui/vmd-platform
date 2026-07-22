import type { Field } from 'payload';
/**
 * Shared SEO group. Used by every indexable collection so meta/OG/canonical are
 * modelled once (ARCHITECTURE.md §1: schema generated from typed data).
 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  admin: { description: 'Search + social metadata. Human-written, unique per page.' },
  fields: [
    // Limits are advisory guidance, kept generous so authoritative, human-written
    // copy is never truncated (some service pages run ~80-char titles / ~190-char
    // descriptions). Search engines truncate the *display*, not the stored value.
    { name: 'metaTitle', type: 'text', maxLength: 120 },
    { name: 'metaDescription', type: 'textarea', maxLength: 220 },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    { name: 'canonicalUrl', type: 'text' },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
};
