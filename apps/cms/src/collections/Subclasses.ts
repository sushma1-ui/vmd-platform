import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';
import { seoField, reviewedByField } from '../fields/index.ts';

/**
 * Subclasses — the definitive visa page model (×20+ tier). Powers the entire
 * subclass template from CMS with no frontend change. Text fields are
 * `localized` for future multilingual. Typed At-a-Glance doubles as the unit a
 * future comparison page (SC186 vs SC482) will diff. Numeric/fee fields render
 * as em-dashes until verified — never estimated (§19).
 */
export const Subclasses: CollectionConfig = {
  slug: 'subclasses',
  admin: {
    group: 'Visa Reference',
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'complexity', 'status'],
  },
  access: {
    read: publishedOrEditorial,
    create: isEditorial,
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    // --- identity ---
    {
      name: 'code',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'e.g. 190, 482, 820/801' },
    },
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: ['draft', 'published'],
    },
    { name: 'service', type: 'relationship', relationTo: 'services' },

    // --- hero ---
    {
      name: 'valueProposition',
      type: 'textarea',
      localized: true,
      admin: { description: 'One-line hero value proposition.' },
    },
    { name: 'plainOneLiner', type: 'textarea', localized: true },

    // --- quick facts / sticky summary (typed = comparable) ---
    {
      name: 'atAGlance',
      type: 'group',
      fields: [
        {
          name: 'visaType',
          type: 'select',
          options: ['permanent', 'temporary', 'provisional', 'bridging'],
        },
        { name: 'costRange', type: 'text' },
        { name: 'processingTime', type: 'text' },
        { name: 'duration', type: 'text' },
        { name: 'onshoreOffshore', type: 'select', options: ['onshore', 'offshore', 'either'] },
        { name: 'pointsNeeded', type: 'text' },
      ],
    },
    {
      name: 'governmentFee',
      type: 'group',
      admin: {
        description: 'Renders ONLY with a verified amount + as-at date + source. Never estimate.',
      },
      fields: [
        { name: 'amount', type: 'text' },
        { name: 'asAt', type: 'date' },
        { name: 'sourceUrl', type: 'text' },
      ],
    },
    {
      name: 'complexity',
      type: 'group',
      fields: [
        { name: 'level', type: 'select', options: ['straightforward', 'moderate', 'complex'] },
        {
          name: 'note',
          type: 'textarea',
          localized: true,
          admin: { description: 'General guidance, not a prediction.' },
        },
      ],
    },

    // --- overview ---
    {
      name: 'overview',
      type: 'group',
      fields: [
        { name: 'whatItIs', type: 'richText', localized: true },
        { name: 'whoItIsFor', type: 'richText', localized: true },
        { name: 'whyThisPathway', type: 'richText', localized: true },
      ],
    },

    // --- eligibility (modular, expandable) ---
    {
      name: 'eligibility',
      type: 'array',
      labels: { singular: 'Eligibility group', plural: 'Eligibility groups' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'requirement', type: 'text', localized: true },
            { name: 'detail', type: 'textarea', localized: true },
          ],
        },
      ],
    },

    // --- benefits ---
    {
      name: 'benefits',
      type: 'group',
      fields: [
        { name: 'permanentResidency', type: 'checkbox' },
        { name: 'familyInclusion', type: 'checkbox' },
        { name: 'workRights', type: 'checkbox' },
        { name: 'studyRights', type: 'checkbox' },
        { name: 'medicare', type: 'checkbox' },
        { name: 'travelRights', type: 'checkbox' },
        {
          name: 'custom',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'detail', type: 'text', localized: true },
          ],
        },
      ],
    },

    // --- process timeline (steps + docs per stage) ---
    {
      name: 'process',
      type: 'array',
      labels: { singular: 'Process step', plural: 'Process steps' },
      fields: [
        { name: 'stepTitle', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'estimatedDuration', type: 'text' },
        {
          name: 'documents',
          type: 'array',
          fields: [{ name: 'doc', type: 'text', localized: true }],
        },
      ],
    },

    // --- required documents (categorized) ---
    {
      name: 'documents',
      type: 'array',
      labels: { singular: 'Document category', plural: 'Document categories' },
      fields: [
        { name: 'category', type: 'text', localized: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'name', type: 'text', localized: true },
            { name: 'note', type: 'text', localized: true },
          ],
        },
      ],
    },

    // --- costs ---
    {
      name: 'costs',
      type: 'group',
      fields: [
        { name: 'professionalFeeEnabled', type: 'checkbox', defaultValue: false },
        { name: 'professionalFeeRange', type: 'text' },
        { name: 'notes', type: 'textarea', localized: true },
      ],
    },

    // --- common mistakes / refusal reasons (educational, trust) ---
    {
      name: 'commonMistakes',
      type: 'array',
      labels: { singular: 'Common mistake', plural: 'Common mistakes' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'detail', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'whatGoesWrong',
      type: 'array',
      fields: [{ name: 'item', type: 'textarea', localized: true }],
    },

    // --- is this you (kept) ---
    {
      name: 'isThisYou',
      type: 'array',
      fields: [{ name: 'check', type: 'text', localized: true }],
    },

    // --- relationships: faqs, resources, services, related visas, success stories ---
    { name: 'faqs', type: 'relationship', relationTo: 'faqs', hasMany: true },
    { name: 'relatedResources', type: 'relationship', relationTo: 'articles', hasMany: true },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    {
      name: 'relatedVisas',
      type: 'relationship',
      relationTo: 'subclasses',
      hasMany: true,
      admin: { description: 'For "related visa" recommendations + comparison pages.' },
    },
    {
      name: 'featuredTestimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
    },
    { name: 'featuredReviews', type: 'relationship', relationTo: 'pinned-reviews', hasMany: true },

    reviewedByField,
    seoField,
  ],
};
