import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/** Processing Times Tracker — monthly-verified. Highest AI-citation asset (§13.9). */
export const ProcessingTimes: CollectionConfig = {
  slug: 'processing-times',
  admin: { useAsTitle: 'subclassCode', defaultColumns: ['subclassCode', 'currentEstimate', 'lastVerifiedAt'] },
  access: { read: publishedOrEditorial, create: isEditorial, update: isEditorial, delete: isEditorial },
  fields: [
    { name: 'subclassCode', type: 'text', required: true, index: true },
    { name: 'currentEstimate', type: 'text', admin: { description: 'e.g. "8–12 months". Empty renders as em-dash.' } },
    { name: 'sourceUrl', type: 'text', admin: { description: 'Home Affairs source, linked on the page.' } },
    { name: 'lastVerifiedAt', type: 'date', index: true },
    { name: 'status', type: 'select', defaultValue: 'draft', index: true, options: ['draft', 'published'] },
  ],
};
