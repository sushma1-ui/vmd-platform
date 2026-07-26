import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField } from '../fields/index.ts';

/** Situation hubs (×6) — non-expert language: "I married an Australian". */
export const Situations: CollectionConfig = {
  slug: 'situations',
  admin: { group: 'Visa Reference', useAsTitle: 'title' },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: [
        'skilled-professional',
        'student',
        'partnered-to-australian',
        'employer',
        'visa-refused',
        'bridging-visa',
      ],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
    { name: 'empathyLine', type: 'text' },
    { name: 'destinationService', type: 'relationship', relationTo: 'services' },
    seoField,
  ],
};
