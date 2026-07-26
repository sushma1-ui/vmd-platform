import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/**
 * Success Stories / Client Results — the premium trust-building section. One
 * collection, many content types (review videos, testimonial videos, client photos,
 * redacted grant letters, written testimonials, success stories), organised into
 * visa-category carousels on /results/success-stories. Staff manage everything here:
 * no code changes to add, reorder, feature or remove content.
 *
 * Consent is explicit: the public site only ever fetches entries where consent=true.
 */
export const SuccessStories: CollectionConfig = {
  slug: 'success-stories',
  labels: { singular: 'Success Story', plural: 'Success Stories (Client Results)' },
  admin: {
    group: 'Client Results',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'category', 'featured', 'order', 'status'],
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Client review video', value: 'review-video' },
        { label: 'Client testimonial video', value: 'testimonial-video' },
        { label: 'Client photo', value: 'client-photo' },
        { label: 'Visa grant letter (redacted)', value: 'grant-letter' },
        { label: 'Written testimonial', value: 'written-testimonial' },
        { label: 'Success story', value: 'success-story' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Employer Sponsored Visas', value: 'employer-sponsored' },
        { label: 'Student Visas', value: 'student' },
        { label: 'Partner Visas', value: 'partner' },
        { label: 'Skilled Migration', value: 'skilled' },
        { label: 'Visitor Visas', value: 'visitor' },
        { label: 'Other Visa Success Stories', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short supporting line shown under the title.' },
    },
    {
      name: 'quote',
      type: 'textarea',
      admin: { description: 'The testimonial or story text (written types).' },
    },
    {
      name: 'clientName',
      type: 'text',
      admin: { description: 'Optional display name — only with the client’s permission.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Client photo or REDACTED grant letter image.' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: { description: 'YouTube or Vimeo URL for video types.' },
    },
    {
      name: 'consent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'REQUIRED before this appears publicly: the client has given permission to publish this content. The website only shows entries with consent ticked.',
      },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Display order within its carousel (lower shows first).' },
    },
  ],
};
