import type { GlobalConfig } from 'payload';
import { anyone, isAdmin } from '../access/index.ts';

/**
 * Settings — sitewide values the admin controls (Blueprint §11.6 reviews embed,
 * §12 WhatsApp). The Google rating/count are DATA entered here, not hardcoded in
 * components; empty until real.
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Site Settings' },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      name: 'googleReviews',
      type: 'group',
      fields: [
        { name: 'rating', type: 'number', min: 0, max: 5 },
        { name: 'count', type: 'number', min: 0 },
        { name: 'profileUrl', type: 'text' },
      ],
    },
    { name: 'whatsappNumber', type: 'text' },
    { name: 'bookingEnabled', type: 'checkbox', defaultValue: true },
    {
      // Client Portal navigation button — label, destination, colour and visibility,
      // all editable without a code change.
      name: 'clientPortal',
      type: 'group',
      admin: { description: 'The Client Portal button in the site navigation.' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'label', type: 'text', defaultValue: 'Client Portal' },
        { name: 'url', type: 'text', defaultValue: '/client-portal' },
        {
          name: 'color',
          type: 'text',
          admin: {
            description:
              'Optional hex colour (e.g. #2589BA). Leave blank to use the brand blue. Non-hex values are ignored.',
          },
        },
      ],
    },
    {
      // Site-wide CTA destinations. Change these to move the URLs without a code
      // change (Blueprint: future-proof, CMS-configurable CTAs).
      name: 'ctaLinks',
      type: 'group',
      admin: { description: 'Where the two site-wide call-to-action buttons point.' },
      fields: [
        {
          name: 'bookConsultationUrl',
          type: 'text',
          defaultValue: '/book-consultation',
          admin: { description: 'Primary CTA — "Book a Consultation".' },
        },
        {
          name: 'healthCheckUrl',
          type: 'text',
          defaultValue: '/health-check',
          admin: { description: 'Secondary CTA — "Free Visa Health Check".' },
        },
      ],
    },
    {
      name: 'migrationManagerUrl',
      type: 'text',
      admin: {
        description:
          'Deep link to the Migration Manager practice system (client portal integration).',
      },
    },
  ],
};
