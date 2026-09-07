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
  'educational',
  'standard',
  'online',
  'in-person',
]);

export const consultationRequest = z.object({
  type: consultationType,
  // Context captured to make an enquiry useful BEFORE it reaches the agent. Both are
  // free-form slugs from the form's dropdowns (kept as strings, not enums, so the
  // option lists can evolve without a schema/DB change). Optional for backwards
  // compatibility with existing submissions/integrations.
  journeyStage: z.string().trim().max(120).optional(), // "Where are you in your journey?"
  matter: z.string().trim().max(120).optional(), // "Matter to be discussed"
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
