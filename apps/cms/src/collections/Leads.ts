import type { CollectionConfig } from 'payload';
import { isEditorial, isAgent } from '../access/index.ts';

/**
 * Leads (Plane A). Created SERVER-SIDE only (apps/web API routes via the Payload
 * Local API) — never browser-direct — so the write path is auth-controlled and the
 * service-role key never ships to a client. Score derives from source (@vmd/schema
 * scoreLead); it is not client-settable. Health Check answers persist as structured
 * fields, not a blob (Blueprint §9.4).
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'source', 'score', 'status', 'createdAt'] },
  access: {
    read: isEditorial,
    create: isAgent, // server-to-server via agent API key
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    {
      name: 'source',
      type: 'select',
      required: true,
      index: true,
      options: ['health-check', 'second-opinion', 'consultation', 'guide-download', 'newsletter', 'quick-enquiry', 'general-enquiry'],
    },
    { name: 'firstName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'mobile', type: 'text' },
    { name: 'situation', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'score', type: 'number', index: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      index: true,
      options: ['new', 'contacted', 'qualified', 'booked', 'won', 'lost'],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    { name: 'healthCheck', type: 'json', admin: { description: 'Structured Health Check answers.' } },
    {
      name: 'attribution',
      type: 'group',
      fields: [
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
        { name: 'landingPage', type: 'text' },
        { name: 'referrer', type: 'text' },
        { name: 'device', type: 'text' },
      ],
    },
    { name: 'marketingConsent', type: 'checkbox', defaultValue: false },
  ],
};
