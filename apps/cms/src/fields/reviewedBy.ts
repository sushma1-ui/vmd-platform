import type { Field } from 'payload';
/**
 * "Last reviewed [date] by Sunil Uprety, RMA" — the E-E-A-T + freshness signal
 * (Blueprint §13.8). On every legal/eligibility page. The MARN defaults to the
 * single practice value; it is not editable per-row by accident.
 */
export const reviewedByField: Field = {
  name: 'reviewedBy',
  type: 'group',
  admin: { description: 'Freshness + author accountability. Verify on every legal change.' },
  fields: [
    { name: 'lastReviewedAt', type: 'date', index: true },
    { name: 'reviewer', type: 'relationship', relationTo: 'users' },
    { name: 'marn', type: 'text', defaultValue: '2318234', admin: { readOnly: true } },
  ],
};
