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
    { name: 'metaTitle', type: 'text', maxLength: 70 },
    { name: 'metaDescription', type: 'textarea', maxLength: 160 },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    { name: 'canonicalUrl', type: 'text' },
    { name: 'noindex', type: 'checkbox', defaultValue: false },
  ],
};
