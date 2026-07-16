import type { CollectionConfig } from 'payload';
import { publishedOrEditorial, isEditorial } from '../access/index.ts';

/**
 * Grant Ledger — dated, anonymised, subclass-tagged records (Blueprint §10.3).
 * COMPLIANCE GUARDRAILS, enforced by schema shape:
 *  - NO names, NO photos, NO success rates, NO percentages.
 *  - Consent recorded for EVERY entry (required), even anonymised.
 *  - Descriptor is coarse (e.g. "RN, offshore"); the render layer must never
 *    combine occupation + location + date so an individual is identifiable.
 * The standing disclaimer is rendered by the UI, not stored per row.
 */
export const GrantLedger: CollectionConfig = {
  slug: 'grant-ledger',
  admin: { useAsTitle: 'descriptor', defaultColumns: ['subclassCode', 'outcome', 'decisionDate'] },
  access: { read: publishedOrEditorial, create: isEditorial, update: isEditorial, delete: isEditorial },
  fields: [
    { name: 'subclassCode', type: 'text', required: true, index: true },
    { name: 'subclass', type: 'relationship', relationTo: 'subclasses' },
    {
      name: 'outcome',
      type: 'select',
      required: true,
      index: true,
      options: ['granted', 'nomination-approved', 'set-aside', 'favourable-review'],
    },
    { name: 'decisionDate', type: 'date', required: true, index: true },
    { name: 'descriptor', type: 'text', required: true, admin: { description: 'Coarse, non-identifying, e.g. "RN, offshore". No names.' } },
    { name: 'consentRecorded', type: 'checkbox', required: true },
    { name: 'status', type: 'select', defaultValue: 'draft', index: true, options: ['draft', 'published'] },
  ],
};
