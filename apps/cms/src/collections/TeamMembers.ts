import type { CollectionConfig, Field } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/**
 * Team Members — the people shown in the "Our team" section on the About page (and,
 * later, individual profile pages). A collection (not a global array) so each person
 * is a document that can be added, reordered, featured, drafted/published and — in
 * future — related to service pages or articles, all without a code change.
 *
 * Public gate: the website only ever fetches members with status = 'published'
 * (enforced by publishedOrEditorial + the web query filter).
 */

/** A reorderable list of short text items (qualifications, expertise, languages…). */
const listField = (name: string, label: string, placeholder: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular: label.replace(/s$/, ''), plural: label },
  admin: { description: 'Add one item per row. Drag to reorder.' },
  fields: [{ name: 'item', type: 'text', required: true, admin: { placeholder } }],
});

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team Member', plural: 'Meet the Team' },
  admin: {
    group: 'Website Content',
    description:
      'The people shown in the "Our team" section on the About page. Add a person, drag Display order to reorder, and set Status to Published to show them on the site.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'status', 'featured', 'displayOrder'],
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { placeholder: 'Sudeep Bartaula' } },

    // Publishing controls — in the sidebar so the main area stays focused on content.
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft (hidden)', value: 'draft' },
        { label: 'Published (live)', value: 'published' },
      ],
      admin: { position: 'sidebar', description: 'Only Published members appear on the website.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Highlight this person (e.g. shown first).' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: { position: 'sidebar', description: 'Lower numbers show first (1, 2, 3…).' },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          description: 'The core details shown wherever this person appears.',
          fields: [
            {
              name: 'position',
              type: 'text',
              label: 'Position',
              admin: { placeholder: 'e.g. Registered Migration Agent, or Client Liaison' },
            },
            {
              name: 'credential',
              type: 'text',
              admin: {
                placeholder: 'e.g. MARN 2318234 (leave blank if not applicable)',
                description: 'Shown next to the name. Leave blank for non-registered staff.',
              },
            },
            {
              name: 'shortBio',
              type: 'textarea',
              label: 'Short bio',
              admin: { description: 'One or two lines shown on the About page and previews.' },
            },
            {
              name: 'motto',
              type: 'text',
              label: 'Motto (optional)',
              admin: {
                description:
                  'A short personal line shown in quotes under the bio on the About page. Leave blank to hide.',
                placeholder: 'e.g. Clients and compliance.',
              },
            },
            {
              name: 'fullBio',
              type: 'richText',
              label: 'Full biography',
              admin: { description: 'The full profile — headings, paragraphs and lists allowed.' },
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile image',
              admin: {
                description: 'A square headshot works best. Initials show until one is added.',
              },
            },
          ],
        },
        {
          label: 'Credentials',
          description: 'Lists shown on the profile. All optional — leave empty to hide a list.',
          fields: [
            listField(
              'qualifications',
              'Qualifications',
              'e.g. Registered Migration Agent (MARN 2318234)',
            ),
            listField('education', 'Education', 'e.g. Master of Business Analytics'),
            listField('experience', 'Experience', 'e.g. 5+ years in migration client services'),
            listField('expertise', 'Areas of expertise', 'e.g. Student visas'),
            listField('languages', 'Languages spoken', 'e.g. English'),
            listField('certifications', 'Certifications', 'e.g. Certificate IV in …'),
          ],
        },
        {
          label: 'Contact & Social',
          description: 'All optional. Only add what you want shown publicly.',
          fields: [
            { name: 'email', type: 'email', label: 'Contact email (optional)' },
            { name: 'phone', type: 'text', label: 'Contact phone (optional)' },
            {
              name: 'social',
              type: 'array',
              label: 'Social links',
              labels: { singular: 'Social link', plural: 'Social links' },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  options: [
                    'LinkedIn',
                    'Facebook',
                    'Instagram',
                    'X (Twitter)',
                    'TikTok',
                    'YouTube',
                    'Website',
                  ],
                },
                { name: 'url', type: 'text', admin: { placeholder: 'https://…' } },
              ],
            },
          ],
        },
      ],
    },
  ],
};
