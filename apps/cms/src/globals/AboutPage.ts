import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';
import { seoField, headingIntro } from '../fields/index.ts';

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
        {
          label: 'Team',
          name: 'team',
          description:
            'The heading and intro for the "Our team" section. The people themselves are now managed in Website Content → Team Members (add, reorder and publish each person there).',
          fields: [
            ...headingIntro({
              heading: 'Our team',
              intro: 'You deal with the people who prepare your case — not a call centre.',
            }),
            // Legacy members array — RETAINED (hidden from editors) only so its DB
            // table isn't dropped. On this push-based setup, dropping it at the same
            // time the Team Members collection tables are created makes the schema
            // sync ambiguous (rename vs create) and requires an interactive answer.
            // The website reads team members from the Team Members collection now;
            // this field is unused and can be removed once DB migrations are adopted.
            {
              name: 'members',
              type: 'array',
              admin: { hidden: true },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text' },
                { name: 'credential', type: 'text' },
                { name: 'specialisations', type: 'text' },
                { name: 'bio', type: 'textarea' },
                { name: 'photo', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
};
