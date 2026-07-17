import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField } from '../fields/index.ts';

/** Case studies — problem → approach → outcome → disclaimer. Anonymised. */
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: { useAsTitle: 'title' },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'subclass', type: 'relationship', relationTo: 'subclasses' },
    { name: 'problem', type: 'richText' },
    { name: 'approach', type: 'richText' },
    { name: 'outcome', type: 'richText' },
    { name: 'consentRecorded', type: 'checkbox', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
    seoField,
  ],
};
