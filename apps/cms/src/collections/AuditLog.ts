import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/index.ts';

/**
 * AuditLog — append-only trail (Blueprint §17). Written by the audit hook; readable
 * by admins only; never edited or deleted through the UI.
 */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  admin: {
    group: 'System',
    useAsTitle: 'action',
    defaultColumns: ['action', 'collectionSlug', 'docId', 'user', 'createdAt'],
  },
  access: { read: isAdmin, create: () => false, update: () => false, delete: () => false },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: ['create', 'update', 'delete'],
      index: true,
    },
    { name: 'collectionSlug', type: 'text', required: true, index: true },
    { name: 'docId', type: 'text', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'summary', type: 'text' },
  ],
};
