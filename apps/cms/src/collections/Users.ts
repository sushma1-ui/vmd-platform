import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/index.ts';

/**
 * The one collection needed to boot the admin. Auth-enabled. Role drives RBAC.
 * The full content model (Articles, Services, Consultations, Leads, Media, Audit…)
 * is defined in the Database + Admin modules.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: { useAPIKey: true },
  admin: { useAsTitle: 'email' },
  access: { create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: ['admin', 'editor', 'agent', 'client'],
    },
    { name: 'name', type: 'text' },
  ],
};
