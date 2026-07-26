import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';
import { seoField } from '../fields/index.ts';

/**
 * About page — the "/about" page copy. Simple, single-section page: an intro
 * (eyebrow, heading, lead), the body paragraphs, and the call-to-action button.
 * Every field defaults to the current live copy.
 */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  admin: {
    group: 'Website Content',
    description: 'The copy on the About page (/about).',
    preview: () => `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/about/`,
  },
  versions: { drafts: true },
  access: { read: anyone, update: isEditorial },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'The practice' },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'About the Practice',
            },
            {
              name: 'lead',
              type: 'textarea',
              defaultValue:
                'Why the clinical frame — Diagnosis, Pathway, Outcome — and what we will not do.',
            },
            {
              name: 'body',
              type: 'array',
              labels: { singular: 'Paragraph', plural: 'Paragraphs' },
              admin: { description: 'The body paragraphs of the About page.' },
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
            {
              name: 'ctaLabel',
              type: 'text',
              defaultValue: 'Meet Sunil Uprety, RMA',
            },
            {
              name: 'ctaHref',
              type: 'text',
              label: 'CTA link',
              defaultValue: '/about/sunil-uprety/',
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
};
