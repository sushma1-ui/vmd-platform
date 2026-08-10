import type { CollectionConfig } from 'payload';
import { isEditorial, isAgent } from '../access/index.ts';

/**
 * Leads (Plane A). Created SERVER-SIDE only (apps/web API routes via the Payload
 * Local API) — never browser-direct — so the write path is auth-controlled and the
 * service-role key never ships to a client. Health Check answers persist as
 * structured fields, not a blob (Blueprint §9.4). `submissionId` is the globally
 * unique, human-friendly reference (VMD-YYYYMMDD-NNNNNN) quoted to clients.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Website Enquiry', plural: 'Website Enquiries' },
  admin: {
    group: 'Enquiries',
    useAsTitle: 'email',
    defaultColumns: ['submissionId', 'email', 'source', 'status', 'createdAt'],
    description:
      'Enquiries submitted through the website forms. These arrive automatically — you don’t add them by hand.',
  },
  access: {
    read: isEditorial,
    create: isAgent, // server-to-server via agent API key
    update: isEditorial,
    delete: isEditorial,
  },
  fields: [
    {
      name: 'submissionId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Globally-unique, human-friendly reference: VMD-YYYYMMDD-NNNNNN.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      index: true,
      options: [
        'health-check',
        'second-opinion',
        'consultation',
        'guide-download',
        'newsletter',
        'quick-enquiry',
        'general-enquiry',
      ],
    },
    { name: 'firstName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'mobile', type: 'text' },
    { name: 'situation', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'nationality', type: 'text' },
    { name: 'currentVisa', type: 'text' },
    { name: 'goal', type: 'text' },
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
    {
      name: 'healthCheck',
      type: 'json',
      admin: { description: 'Structured Health Check answers.' },
    },
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
    {
      name: 'crm',
      type: 'group',
      admin: {
        description: 'CRM sync state (e.g. HubSpot). Written by the sync, not by staff.',
      },
      fields: [
        { name: 'provider', type: 'text', admin: { readOnly: true } },
        { name: 'contactId', type: 'text', admin: { readOnly: true } },
        { name: 'syncedAt', type: 'date', admin: { readOnly: true } },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          options: ['pending', 'synced', 'skipped', 'error'],
          admin: { readOnly: true },
        },
      ],
    },
  ],
};
