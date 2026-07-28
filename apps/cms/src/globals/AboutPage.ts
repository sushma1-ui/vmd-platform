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
          description: 'The people shown in the "Our team" section on the About page.',
          fields: [
            ...headingIntro({
              heading: 'Our team',
              intro: 'You deal with the people who prepare your case — not a call centre.',
            }),
            {
              name: 'members',
              type: 'array',
              labels: { singular: 'Team member', plural: 'Team members' },
              admin: {
                description:
                  'Add each person. Drag to reorder. A photo is optional (initials show until one is added).',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'Sunil Uprety' },
                },
                {
                  name: 'role',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g. Registered Migration Agent, or Migration Consultant',
                  },
                },
                {
                  name: 'credential',
                  type: 'text',
                  admin: { placeholder: 'e.g. MARN 2318234 (leave blank if not applicable)' },
                },
                {
                  name: 'specialisations',
                  type: 'text',
                  admin: { placeholder: 'e.g. Skilled visas · Employer sponsorship' },
                },
                {
                  name: 'bio',
                  type: 'textarea',
                  admin: { placeholder: 'A short intro — a few sentences.' },
                },
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
