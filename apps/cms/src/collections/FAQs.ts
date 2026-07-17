import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/** FAQs — schema-marked (FAQPage), per-subclass. Feeds snippets + AI answers. */
export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question' },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'richText', required: true },
    { name: 'category', type: 'text', index: true },
    { name: 'subclass', type: 'relationship', relationTo: 'subclasses' },
    { name: 'order', type: 'number', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
  ],
};
