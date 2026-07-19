import { z } from 'zod';
import { attribution, country, email, firstName, nationality, phone, situation } from './common.ts';

/**
 * Visa Health Check — progressive steps (Blueprint §9.3). Bracketed inputs reduce
 * perceived intrusion. Email is NOT collected until the final step.
 *
 * This is a LEAD-CAPTURE questionnaire, not an assessment tool: it collects the
 * information a registered migration agent needs to review a case. It never
 * computes or returns an eligibility result — that judgement is human and happens
 * after submission (Blueprint §9.4).
 */
export const healthCheckSubmission = z.object({
  situation, // step 1
  location: z.enum(['australia', 'offshore']), // step 2
  country, // step 2 — country of residence
  nationality, // step 2 — nationality / passport
  currentVisa: z.string().trim().max(120).optional(),
  // step 2 — what the client wants to achieve (their destination goal)
  goal: z
    .enum([
      'permanent-residence',
      'temporary-work',
      'study',
      'family-partner',
      'visitor',
      'business-investment',
      'not-sure',
    ])
    .optional(),
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
  // Attribution captured client-side (UTM + referrer + landing page + device).
  attribution: attribution.optional(),
});
export type HealthCheckSubmission = z.infer<typeof healthCheckSubmission>;
