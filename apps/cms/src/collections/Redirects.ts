import type { CollectionConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';

/** Redirects — preserve link equity through the WordPress→Astro migration (§13). */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { group: 'System', useAsTitle: 'from' },
  access: { read: anyone, create: isEditorial, update: isEditorial, delete: isEditorial },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true, index: true },
    { name: 'to', type: 'text', required: true },
    { name: 'code', type: 'select', defaultValue: '301', options: ['301', '302'] },
  ],
};
