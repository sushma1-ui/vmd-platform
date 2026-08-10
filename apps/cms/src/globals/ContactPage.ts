import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';
import { seoField } from '../fields/index.ts';

/**
 * Contact page — the "/contact" page copy. The phone, email and office address
 * are single-sourced from Global Settings / @vmd/config and are NOT edited here;
 * this global controls the surrounding copy, the office hours note, the optional
 * WhatsApp link and the enquiry-form heading.
 */
export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  label: 'Contact Page',
  admin: {
    group: 'Pages',
    description:
      'The copy on the Contact page (/contact). Phone, email and address come from Global Settings.',
    preview: () => `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/contact/`,
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
            { name: 'eyebrow', type: 'text', defaultValue: 'Contact' },
            { name: 'title', type: 'text', defaultValue: 'Talk to a registered agent' },
            {
              name: 'lead',
              type: 'textarea',
              defaultValue:
                'An appointment-only practice — a CBD address you can check, and three ways to reach a human.',
            },
            {
              name: 'hoursNote',
              type: 'text',
              label: 'Phone hours note',
              defaultValue: 'Mon–Fri 9–5 AWST',
            },
            {
              name: 'whatsappUrl',
              type: 'text',
              label: 'WhatsApp link',
              defaultValue: 'https://wa.me/61493719431',
              admin: { placeholder: 'https://wa.me/…  (leave blank to hide WhatsApp)' },
            },
            {
              name: 'formHeading',
              type: 'text',
              defaultValue: 'Send an enquiry',
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
};
