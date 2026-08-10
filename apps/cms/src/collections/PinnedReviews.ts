import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/**
 * PinnedReviews — for FEATURING specific real Google reviews. The live 5.0★/39 is
 * embedded from Google; this collection only pins selected, real, consented ones.
 * Empty until real reviews are entered — never fabricated.
 */
export const PinnedReviews: CollectionConfig = {
  slug: 'pinned-reviews',
  labels: { singular: 'Google Review', plural: 'Google Reviews' },
  admin: {
    group: 'Client Testimonials',
    useAsTitle: 'reviewerName',
    defaultColumns: ['reviewerName', 'rating', 'reviewDate', 'status'],
    description:
      'Featured real Google reviews. Add the reviewer name, rating (1–5) and the review text.',
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'reviewerName', type: 'text', required: true },
    { name: 'rating', type: 'number', min: 1, max: 5 },
    { name: 'text', type: 'textarea' },
    {
      name: 'reviewDate',
      type: 'text',
      admin: {
        description:
          'When the review was left, e.g. "July 2026". Reviews must be dated (register A4).',
      },
    },
    { name: 'googleReviewUrl', type: 'text' },
    { name: 'pinnedOrder', type: 'number', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
  ],
};
