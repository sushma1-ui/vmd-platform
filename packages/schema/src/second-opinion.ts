import { z } from 'zod';
import { attribution, email, firstName, phone } from './common.ts';

/**
 * Second Opinion priority intake (Blueprint §7.2/§9.4). Decision-letter date is the
 * FIRST field; mobile is REQUIRED (acute, deadline-driven). The free-text box is
 * dignity — let a distressed person tell someone. Highest-scoring lead source.
 */
export const secondOpinionIntake = z.object({
  decisionDate: z.string().optional(), // ISO date from the letter; drives urgency
  firstName,
  email,
  mobile: phone, // required
  subclass: z.string().trim().max(60).optional(),
  alreadyLodged: z.enum(['yes', 'no', 'not-sure']).optional(),
  message: z.string().trim().max(6000).optional(),
  hasDocument: z.boolean().default(false), // upload wired in the storage module
  sensitiveInfoAcknowledged: z.boolean().default(false),
  attribution: attribution.optional(),
});
export type SecondOpinionIntake = z.infer<typeof secondOpinionIntake>;

/**
 * Indicative review-window guidance. Deliberately GENERAL — review time limits vary
 * by decision type and can be very short. This returns a conservative "as early as"
 * date to create appropriate urgency; it is NOT a statement of the user's actual
 * legal deadline, and the UI says so plainly.
 */
export function indicativeReviewWindow(
  decisionISO: string,
): { earliest: string; typical: string } | null {
  const d = new Date(decisionISO);
  if (Number.isNaN(d.getTime())) return null;
  const add = (days: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x.toISOString().slice(0, 10);
  };
  return { earliest: add(7), typical: add(28) };
}
