import { z } from 'zod';

/** Australian + international friendly phone. Accepts +, spaces, digits. */
export const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{6,20}$/, 'Enter a valid phone number');

export const email = z.string().trim().toLowerCase().email('Enter a valid email');
export const firstName = z.string().trim().min(1, 'Please enter your first name').max(80);

/**
 * Country of residence and nationality — collected on the Visa Health Check (§9.4)
 * so the migration team can assess a case. Free text (the form supplies a country
 * list); trimmed and length-bounded here.
 */
export const country = z.string().trim().min(1, 'Select your country of residence').max(80);
export const nationality = z.string().trim().min(1, 'Select your nationality').max(80);

/** UTM + attribution captured on every submission (Blueprint §9.4). Every field is
 *  length-bounded so a hostile client can't stuff large blobs into these
 *  free-text, client-supplied values (unbounded strings are a payload/storage
 *  abuse vector). Overlong values are TRUNCATED to the cap (not rejected), so a
 *  genuine long referrer URL never fails an otherwise valid enquiry; a non-string
 *  falls back to empty. */
const capped = (max: number) =>
  z
    .string()
    .trim()
    .transform((s) => s.slice(0, max))
    .catch('')
    .optional();
export const attribution = z.object({
  utmSource: capped(512),
  utmMedium: capped(512),
  utmCampaign: capped(512),
  landingPage: capped(2048),
  referrer: capped(2048),
  device: z.enum(['mobile', 'tablet', 'desktop']).optional(),
});

/** Marketing consent is ALWAYS a separate, unticked box from the enquiry (§9.4). */
export const marketingConsent = z.boolean().default(false);

export const situations = [
  'skilled-professional',
  'student',
  'partnered-to-australian',
  'employer',
  'visa-refused',
  'bridging-visa',
] as const;
export const situation = z.enum(situations);
