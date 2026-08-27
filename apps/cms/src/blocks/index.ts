import type { Block } from 'payload';

/**
 * Reusable content Blocks.
 *
 * Defined once, dropped into any Global or Collection that exposes a `blocks`
 * field — so editors build FAQ lists, CTA banners and testimonial rows the same
 * way on every page, and future landing/campaign pages inherit them for free
 * without a schema change (Long-term Architecture goal).
 */

/** A call-to-action banner: heading, body, one or two buttons. */
export const CtaBannerBlock: Block = {
  slug: 'ctaBanner',
  labels: { singular: 'CTA banner', plural: 'CTA banners' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: { placeholder: 'Not sure where you stand?' },
    },
    {
      name: 'body',
      type: 'textarea',
      admin: { placeholder: 'One line that motivates the click.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryLabel',
          type: 'text',
          admin: { width: '50%', placeholder: 'Start your Free Visa Health Check' },
        },
        {
          name: 'primaryHref',
          type: 'text',
          admin: { width: '50%', placeholder: '/health-check/' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'secondaryLabel',
          type: 'text',
          admin: { width: '50%', placeholder: '(optional) Book a consultation' },
        },
        {
          name: 'secondaryHref',
          type: 'text',
          admin: { width: '50%', placeholder: '/book-consultation/' },
        },
      ],
    },
  ],
};

/** A frequently-asked-questions list. */
export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ list', plural: 'FAQ lists' },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      admin: { description: 'Each row is one question and its answer.' },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          admin: { placeholder: 'Do I have to pay for the health check?' },
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          admin: { placeholder: 'The plain-English answer.' },
        },
      ],
    },
  ],
};

/** A row of trust / credential statements (badges, memberships, guarantees). */
export const TrustBlock: Block = {
  slug: 'trust',
  labels: { singular: 'Trust row', plural: 'Trust rows' },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Statement', plural: 'Statements' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { placeholder: 'e.g. OMARA-registered' },
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link (optional)',
          admin: { placeholder: 'https://…' },
        },
      ],
    },
  ],
};

/** Every reusable block, for a page's flexible `blocks` field. */
export const contentBlocks: Block[] = [CtaBannerBlock, FaqBlock, TrustBlock];
