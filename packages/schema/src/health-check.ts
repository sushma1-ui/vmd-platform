import { z } from 'zod';
import { email, firstName, phone, situation } from './common.ts';

/**
 * Visa Health Check — 6 progressive steps (Blueprint §9.3). Bracketed inputs
 * reduce perceived intrusion. Email is NOT collected until step 6.
 * This schema is the contract; the adaptive question flow lives in packages/forms
 * and the island in apps/web (built in a later module).
 */
export const healthCheckSubmission = z.object({
  situation, // step 1
  location: z.enum(['australia', 'offshore']), // step 2
  currentVisa: z.string().trim().max(120).optional(),
  ageBracket: z.enum(['under-25', '25-32', '33-39', '40-44', '45-plus']).optional(), // step 3
  qualification: z
    .enum(['none', 'certificate', 'diploma', 'bachelor', 'masters', 'doctorate'])
    .optional(),
  skilledExperienceYears: z.enum(['0', '1-2', '3-4', '5-7', '8-plus']).optional(),
  englishTest: z.enum(['yes', 'no', 'not-sure']).optional(), // step 4
  skillsAssessment: z.enum(['yes', 'no', 'not-sure']).optional(),
  everRefusedOrCancelled: z.enum(['yes', 'no', 'not-sure']), // step 5 — routes Second Opinion
  // step 6 — the ask, after five investments
  firstName,
  email,
  mobile: phone.optional(),
  preferredContact: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  sensitiveInfoAcknowledged: z.boolean().default(false),
});
export type HealthCheckSubmission = z.infer<typeof healthCheckSubmission>;
