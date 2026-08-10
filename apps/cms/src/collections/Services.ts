import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField, reviewedByField } from '../fields/index.ts';

/**
 * Services — the canonical Service Hub model. One CMS entry per category powers a
 * full hub page. Pathways are NOT stored here; they're queried live from Subclasses
 * where service = this, so adding a subclass automatically appears on its hub.
 * Text is `localized` for future multilingual.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  // Technical service-hub taxonomy (ties visa subclasses to hub pages). Hidden from
  // the simplified editor; the editable "Our Services" content lives in Service Pages.
  admin: {
    group: 'Services',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status'],
    hidden: true,
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },

    // hero
    { name: 'valueProposition', type: 'textarea', localized: true },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'heroIllustration', type: 'upload', relationTo: 'media' },

    // §2 who this is for — personas (expandable)
    {
      name: 'personas',
      type: 'array',
      labels: { singular: 'Persona', plural: 'Personas' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },

    // §4 why choose this pathway
    {
      name: 'whyChoose',
      type: 'group',
      fields: [
        {
          name: 'benefits',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'detail', type: 'text', localized: true },
          ],
        },
        { name: 'typicalOutcomes', type: 'textarea', localized: true },
        {
          name: 'considerations',
          type: 'textarea',
          localized: true,
          admin: { description: 'Honest limitations — on brand.' },
        },
      ],
    },

    // §5 high-level journey (links to subclasses)
    {
      name: 'journey',
      type: 'array',
      labels: { singular: 'Journey step', plural: 'Journey steps' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'linkedSubclass', type: 'relationship', relationTo: 'subclasses' },
      ],
    },

    // legacy field kept
    { name: 'whatGoesWrong', type: 'textarea', localized: true },
    { name: 'situation', type: 'relationship', relationTo: 'situations' },

    // relationships
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
    { name: 'relatedResources', type: 'relationship', relationTo: 'articles', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'featuredReviews', type: 'relationship', relationTo: 'pinned-reviews', hasMany: true },

    reviewedByField,
    seoField,
  ],
};
