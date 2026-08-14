import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/** Testimonials — name · situation · subclass · date · consented (Blueprint §10.3). */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Written Testimonial', plural: 'Written Testimonials' },
  admin: {
    group: 'Website Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'situation', 'date', 'status'],
    description:
      'Short written client quotes. Only publish these with the client’s recorded consent.',
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Client name',
      admin: { description: "The client's name or initials, as agreed in their consent." },
    },
    {
      name: 'situation',
      type: 'text',
      admin: { description: 'A short context line, e.g. "Skilled migration from India".' },
    },
    {
      name: 'subclass',
      type: 'relationship',
      relationTo: 'subclasses',
      label: 'Related visa (optional)',
      admin: { hidden: true },
    },
    {
      name: 'date',
      type: 'date',
      admin: { description: 'When the testimonial was given.' },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: { description: 'The testimonial, in the client’s own words.' },
    },
    {
      name: 'consentRecorded',
      type: 'checkbox',
      required: true,
      label: 'Consent recorded',
      admin: { description: 'Tick only once the client’s consent to publish is on file.' },
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
      admin: { description: 'Set to Published to show this on the website.' },
    },
  ],
};
