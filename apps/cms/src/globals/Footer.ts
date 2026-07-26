import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';

/**
 * Footer — the link columns at the bottom of every page.
 *
 * The brand block (name, address, phone, email, RMA line) and the legal
 * copyright line are single-sourced from Global Settings / @vmd/config and are
 * NOT edited here — only the navigation columns are. Leave the columns empty to
 * use the built-in defaults.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: 'Site Settings',
    description:
      'The link columns in the site footer. The address, phone and legal line come from Global Settings.',
  },
  access: { read: anyone, update: isEditorial },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Footer columns',
      labels: { singular: 'Column', plural: 'Columns' },
      admin: {
        description:
          'Each column has a heading and a list of links. Leave empty to use the site defaults.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
          admin: { placeholder: 'e.g. Our Services' },
        },
        {
          name: 'links',
          type: 'array',
          labels: { singular: 'Link', plural: 'Links' },
          fields: [
            { name: 'label', type: 'text', required: true, admin: { placeholder: 'All services' } },
            { name: 'href', type: 'text', required: true, admin: { placeholder: '/services/' } },
          ],
        },
      ],
    },
  ],
};
