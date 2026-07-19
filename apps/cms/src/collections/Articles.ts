import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField, reviewedByField } from '../fields/index.ts';

/**
 * Articles — the ONE Knowledge Centre content type (ARCHITECTURE.md §2.2). Blog
 * posts and resource articles are the same object with a category. Scheduling +
 * draft/publish workflow via `status` + `publishedAt`. Author byline carries E-E-A-T.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'status', 'publishedAt'] },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
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
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    { name: 'publishedAt', type: 'date', index: true },
    { name: 'excerpt', type: 'textarea', maxLength: 300 },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },
    { name: 'tags', type: 'text', hasMany: true, index: true },
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
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'relatedArticles', type: 'relationship', relationTo: 'articles', hasMany: true },
    { name: 'relatedSubclasses', type: 'relationship', relationTo: 'subclasses', hasMany: true },
    reviewedByField,
    seoField,
  ],
};
