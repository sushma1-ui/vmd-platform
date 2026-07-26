import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/**
 * PinnedReviews — for FEATURING specific real Google reviews. The live 5.0★/39 is
 * embedded from Google; this collection only pins selected, real, consented ones.
 * Empty until real reviews are entered — never fabricated.
 */
export const PinnedReviews: CollectionConfig = {
  slug: 'pinned-reviews',
  admin: { group: 'Client Results', useAsTitle: 'reviewerName' },
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
