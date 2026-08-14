import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField, reviewedByField } from '../fields/index.ts';
import { setPublishedAt, syncStatusWithPublish } from '../hooks/index.ts';

/**
 * Articles — the ONE Knowledge Centre content type (ARCHITECTURE.md §2.2). Blog
 * posts and resource articles are the same object with a category. Scheduling +
 * draft/publish workflow via `status` + `publishedAt`. Author byline carries E-E-A-T.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Blog & Insights' },
  admin: {
    group: 'Blog & Resources',
    description:
      'Blog posts and resource articles. Write your post, then set Status to Published to go live.',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
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
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'The web address for this post — lowercase words separated by hyphens, e.g. "why-applications-get-refused".',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        'guide',
        'migration-news',
        'employer-hub',
        'student-hub',
        'partner-visa-hub',
        'visitor-visa-hub',
        'refusals-appeals',
        'moving-to-perth',
        'case-study',
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'scheduled', 'published'],
      admin: {
        description:
          'Set to "Published" to show this article on the website. "Draft" keeps it hidden.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Tick to highlight this post in the "Featured" row on the blog.' },
    },
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
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'A short summary shown on the blog listing cards (max 300 characters).',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'The main image shown at the top of the article.' },
    },
    { name: 'content', type: 'richText' },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      index: true,
      admin: { description: 'Optional keywords to help search and grouping.' },
    },
    {
      name: 'faq',
      type: 'array',
      admin: { description: 'Optional Q&A. Rendered on the article and emitted as FAQ schema.' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: { description: 'Minutes. Leave blank to auto-estimate from the content.' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'The byline. Defaults to the practice principal.' },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: { hidden: true },
    },
    {
      name: 'relatedSubclasses',
      type: 'relationship',
      relationTo: 'subclasses',
      hasMany: true,
      admin: { hidden: true },
    },
    reviewedByField,
    seoField,
  ],
};
