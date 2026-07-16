import { z } from 'zod';
import { attribution, email, firstName, marketingConsent, phone, situation } from './common.ts';

/**
 * ONE definition of a Lead. Lead scoring/routing (Blueprint §9.4) is derived
 * from the source, never hand-set by the client.
 */
export const leadSource = z.enum([
  'health-check',
  'second-opinion',
  'consultation',
  'guide-download',
  'newsletter',
  'quick-enquiry',
  'general-enquiry',
]);

export const leadSchema = z.object({
  source: leadSource,
  firstName,
  email,
  mobile: phone.optional(),
  situation: situation.optional(),
  message: z.string().trim().max(4000).optional(),
  marketingConsent,
  attribution: attribution.optional(),
});
export type Lead = z.infer<typeof leadSchema>;

/** Deterministic score from source (§9.4). Kept here so web + cms agree. */
export function scoreLead(source: z.infer<typeof leadSource>): number {
  const table: Record<z.infer<typeof leadSource>, number> = {
    'second-opinion': 100,
    'health-check': 60,
    consultation: 70,
    'guide-download': 30,
    newsletter: 10,
    'quick-enquiry': 20,
    'general-enquiry': 20,
  };
  return table[source];
}
