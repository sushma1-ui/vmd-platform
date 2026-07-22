import { z } from 'zod';
import { email, firstName, phone } from './common.ts';

/**
 * Consultation request — the system-of-record entity (ADR-0001). Stored in OUR
 * database first; the scheduling provider is an integration layer only. Status
 * lifecycle is owned by us, independent of any external calendar.
 */
export const consultationStatus = z.enum([
  'requested',
  'confirmed',
  'rescheduled',
  'completed',
  'cancelled',
  'no_show',
]);

// Consultation types offered on /book-consultation. 'standard'/'online'/'in-person'
// remain valid for backward compatibility with existing records.
export const consultationType = z.enum([
  'initial',
  'second-opinion',
  'follow-up',
  'standard',
  'online',
  'in-person',
]);

export const consultationRequest = z.object({
  type: consultationType,
  firstName,
  email,
  mobile: phone,
  // Requested slot is optional at intake: 'manual' provider confirms out of band.
  requestedStartUtc: z.string().datetime().optional(),
  timezone: z.string().default('Australia/Perth'),
  notes: z.string().trim().max(4000).optional(),
});
export type ConsultationRequest = z.infer<typeof consultationRequest>;

export const consultationRecord = consultationRequest.extend({
  id: z.string(),
  status: consultationStatus,
  providerRef: z.string().nullable().default(null),
  createdAtUtc: z.string().datetime(),
});
export type ConsultationRecord = z.infer<typeof consultationRecord>;
