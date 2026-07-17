import type { CollectionConfig } from 'payload';
import { isEditorial, isAgent } from '../access/index.ts';

/**
 * Consultations (ADR-0001). System-of-record for booking. Status lifecycle owned
 * here, independent of any scheduling provider. `providerRef` links to the external
 * calendar entry once created; record is written BEFORE the provider call.
 */
export const Consultations: CollectionConfig = {
  slug: 'consultations',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'type', 'status', 'createdAt'] },
  access: { read: isEditorial, create: isAgent, update: isEditorial, delete: isEditorial },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: ['standard', 'second-opinion', 'online', 'in-person'],
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
