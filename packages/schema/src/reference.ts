import { z } from 'zod';

/**
 * Human-friendly, globally-unique lead reference: `VMD-YYYYMMDD-NNNNNN`
 * (e.g. `VMD-20260719-000123`). Staff quote it when a client calls or replies.
 * Uniqueness is enforced by a unique index on the `leads.submissionId` column;
 * the numeric suffix only needs enough entropy to make a same-day collision rare
 * (and a collision simply triggers a regenerate-and-retry at the write site).
 */
export const submissionReference = z
  .string()
  .regex(/^VMD-\d{8}-\d{6}$/, 'Invalid submission reference');

/**
 * Pure formatter. `date` supplies the day component (UTC); `sequence` is any
 * non-negative integer (a random 0–999999, or a database id) reduced to 6 digits.
 * Kept pure so it is unit-testable and identical on web + cms.
 */
export function formatSubmissionReference(date: Date, sequence: number): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const seq = String(Math.abs(Math.trunc(sequence)) % 1_000_000).padStart(6, '0');
  return `VMD-${y}${m}${d}-${seq}`;
}
