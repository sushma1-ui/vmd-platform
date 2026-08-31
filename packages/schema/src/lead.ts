import { z } from 'zod';
import {
  attribution,
  country,
  email,
  firstName,
  marketingConsent,
  nationality,
  phone,
  situation,
} from './common.ts';

/**
 * ONE definition of a Lead. Lead scoring/routing (Blueprint §9.4) is derived
 * from the source, never hand-set by the client.
 */
export const leadSource = z.enum([
  'health-check',
  'second-opinion',
  'consultation',
  'educational-consultation',
  'guide-download',
  'newsletter',
  'quick-enquiry',
  'general-enquiry',
]);

export const leadSchema = z.object({
  source: leadSource,
  /** Stable, human-readable id generated server-side. Ties the stored lead, the
   *  admin/client emails and the CRM contact together for support + audit. */
  submissionId: z.string().trim().max(64).optional(),
  firstName,
  email,
  mobile: phone.optional(),
  situation: situation.optional(),
  country: country.optional(),
  nationality: nationality.optional(),
  currentVisa: z.string().trim().max(120).optional(),
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
    'educational-consultation': 65,
    'guide-download': 30,
    newsletter: 10,
    'quick-enquiry': 20,
    'general-enquiry': 20,
  };
  return table[source];
}
