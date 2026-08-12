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
    {
      name: 'reviewerName',
      type: 'text',
      required: true,
      label: 'Reviewer name',
      admin: { description: "The reviewer's name as it appears on Google." },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: { description: 'Star rating, 1 to 5.' },
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Review text',
      admin: { description: 'The review, in the client’s own words.' },
    },
    {
      name: 'reviewDate',
      type: 'text',
      label: 'Review date',
      admin: {
        description:
          'When the review was left, e.g. "July 2026". Reviews must be dated (register A4).',
      },
    },
    {
      name: 'googleReviewUrl',
      type: 'text',
      label: 'Link to the review on Google (optional)',
      admin: { placeholder: 'https://…' },
    },
    {
      name: 'pinnedOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Order',
      admin: { description: 'Lower numbers show first (0, 1, 2…).' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft (hidden)', value: 'draft' },
        { label: 'Published (live)', value: 'published' },
      ],
      admin: { description: 'Set to Published to show this review on the website.' },
    },
  ],
};
