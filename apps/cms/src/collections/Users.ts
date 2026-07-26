import type { CollectionConfig } from 'payload';
import { requireRole } from '@vmd/auth';
import { isAdmin, isEditorial } from '../access/index.ts';

/**
 * The one collection needed to boot the admin. Auth-enabled. Role drives RBAC.
 * The full content model (Articles, Services, Consultations, Leads, Media, Audit…)
 * is defined in the Database + Admin modules.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: { useAPIKey: true },
  admin: {
    group: 'System',
    useAsTitle: 'email',
    // Only staff can open the admin UI at all — a 'client' account cannot reach the
    // Payload dashboard shell (belt-and-braces with per-collection access below).
    hidden: ({ user }) => !user || (user as { role?: string }).role === 'client',
  },
  access: {
    // Restrict read: without this, any authenticated user could enumerate staff via
    // the REST API. Editorial staff can read the user list; nobody else.
    read: isEditorial,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: ({ req }) => requireRole('admin', 'editor', 'agent')(req.user),
  },
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
