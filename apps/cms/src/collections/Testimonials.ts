import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/** Testimonials — name · situation · subclass · date · consented (Blueprint §10.3). */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'name' },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'situation', type: 'text' },
    { name: 'subclass', type: 'relationship', relationTo: 'subclasses' },
    { name: 'date', type: 'date' },
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'consentRecorded',
      type: 'checkbox',
      required: true,
      admin: { description: 'Publish only with recorded consent.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
  ],
};
