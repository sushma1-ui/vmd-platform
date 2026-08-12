import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField } from '../fields/index.ts';
import { setPublishedAt, syncStatusWithPublish } from '../hooks/index.ts';

/**
 * Service Pages ("Our Services") — content-shaped, one entry per service, rendered
 * dynamically at /services/[slug]. Every field an editor needs is here; the body is
 * Lexical rich text so the source document's headings, paragraphs, tables, bullet
 * points and disclaimers are preserved verbatim. Adding a new service requires zero
 * code (Blueprint: "Future services should require zero coding").
 *
 * Published date is auto-set once (setPublishedAt); "Last Updated" is Payload's
 * automatic `updatedAt`; reading time is estimated on the frontend from `content`
 * (with an optional editor override).
 */
export const ServicePages: CollectionConfig = {
  slug: 'service-pages',
  labels: { singular: 'Service Page', plural: 'Services' },
  admin: {
    group: 'Services',
    description:
      'The "Our Services" pages shown on the website. Edit the hero, body, FAQ, CTA and SEO here, then set Status to Published to go live.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'featured', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  versions: { drafts: true },
  hooks: { beforeChange: [syncStatusWithPublish, setPublishedAt] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      // URL prefix — the live path is `/{section}/{slug}` (or `/{slug}` for 'root').
      // Preserves the source document's exact, mixed-prefix SEO URLs.
      name: 'section',
      type: 'select',
      required: true,
      defaultValue: 'visas',
      index: true,
      options: [
        { label: 'Visa (/visas/…)', value: 'visas' },
        { label: 'Service (/services/…)', value: 'services' },
        { label: 'Root (/…)', value: 'root' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'scheduled', 'published'],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },

    // Hero
    { name: 'subtitle', type: 'textarea', admin: { description: 'Hero subtitle / lead.' } },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Card + Open Graph image.' },
    },

    // Main content — verbatim from the source document (headings, tables, lists…).
    { name: 'content', type: 'richText' },

    // Related links — verbatim labels from the source ("Related:" line). Rendered as
    // internal links where a label resolves to another service page, plain text otherwise.
    {
      name: 'relatedLinks',
      type: 'array',
      admin: { description: 'Verbatim "Related:" labels from the source document.' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'service-pages',
      hasMany: true,
      admin: { description: 'Optional resolved internal links for the related labels.' },
    },

    // FAQ — verbatim Q/A. Rendered on the page and emitted as FAQ structured data.
    {
      name: 'faq',
      type: 'array',
      admin: { description: 'Optional. Only shown when provided.' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },

    // CTA ("Ready to get started?") — heading + verbatim body paragraph + action button.
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea', admin: { description: 'Verbatim CTA paragraph.' } },
        { name: 'buttonLabel', type: 'text' },
        { name: 'buttonHref', type: 'text' },
      ],
    },

    // Compliance disclaimer — verbatim, per page (some pages carry variant wording).
    // Always rendered. MARN is never shown alone (see the source text).
    { name: 'disclaimer', type: 'textarea' },

    // Metadata (auto)
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
        description: 'Set automatically on first publish. Never changes.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: { description: 'Minutes. Leave blank to auto-estimate from the content.' },
    },
    { name: 'author', type: 'relationship', relationTo: 'users' },

    seoField,
  ],
};
