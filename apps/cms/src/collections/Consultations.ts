import type { CollectionConfig } from 'payload';
import { isEditorial, isAgent } from '../access/index.ts';

/**
 * Consultations (ADR-0001). System-of-record for booking. Status lifecycle owned
 * here, independent of any scheduling provider. `providerRef` links to the external
 * calendar entry once created; record is written BEFORE the provider call.
 */
export const Consultations: CollectionConfig = {
  slug: 'consultations',
  labels: { singular: 'Consultation Booking', plural: 'Consultation Bookings' },
  admin: {
    group: 'Enquiries',
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'status', 'createdAt'],
    description:
      'Consultation bookings. These arrive automatically when someone books — you don’t add them by hand.',
  },
  access: { read: isEditorial, create: isAgent, update: isEditorial, delete: isEditorial },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        'initial',
        'second-opinion',
        'follow-up',
        'educational',
        'standard',
        'online',
        'in-person',
      ],
    },
    // Enquiry context captured on the consultation form (see BookingForm island).
    // Stored as text so the option lists can evolve without a schema migration.
    {
      name: 'journeyStage',
      type: 'text',
      admin: { description: 'Where the person is in their migration journey (from the form).' },
    },
    {
      name: 'matter',
      type: 'text',
      admin: { description: 'The matter they want to discuss (from the form).' },
    },
    { name: 'firstName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'mobile', type: 'text', required: true },
    { name: 'requestedStartUtc', type: 'date' },
    { name: 'timezone', type: 'text', defaultValue: 'Australia/Perth' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'requested',
      index: true,
      options: ['requested', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'],
    },
    { name: 'providerRef', type: 'text', admin: { readOnly: true } },
    { name: 'lead', type: 'relationship', relationTo: 'leads' },
  ],
};
