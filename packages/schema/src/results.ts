import { z } from 'zod';

/**
 * Domain models for the Results cluster — the "evidence, not testimony" surfaces.
 * These are the STABLE shapes renderers depend on (ADR-0004, the Type rung): a helper
 * returns `CaseStudy[]`, never a raw Payload response, so the wire shape can change
 * without touching a page. richText bodies are opaque lexical roots, rendered via
 * apps/web lib/lexical; typed as `unknown` here rather than leaking the editor's tree.
 */

/** Payload relationship: either an unresolved id or a populated doc. */
const relationship = z.union([z.string(), z.record(z.string(), z.unknown())]).optional();
const lexical = z.unknown().optional();

export const testimonial = z.object({
  id: z.string(),
  name: z.string(),
  situation: z.string().optional(),
  subclass: relationship,
  date: z.string().optional(),
  quote: z.string(),
});
export type Testimonial = z.infer<typeof testimonial>;

export const pinnedReview = z.object({
  id: z.string(),
  reviewerName: z.string(),
  rating: z.number().min(1).max(5).optional(),
  text: z.string().optional(),
  reviewDate: z.string().optional(),
  googleReviewUrl: z.string().optional(),
  pinnedOrder: z.number().optional(),
});
export type PinnedReview = z.infer<typeof pinnedReview>;

export const caseStudy = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  subclass: relationship,
  problem: lexical,
  approach: lexical,
  outcome: lexical,
});
export type CaseStudy = z.infer<typeof caseStudy>;

/** Sitewide Settings global (googleReviews aggregate is DATA, never hardcoded). */
export const siteSettings = z.object({
  googleReviews: z
    .object({
      rating: z.number().optional(),
      count: z.number().optional(),
      profileUrl: z.string().optional(),
    })
    .optional(),
  whatsappNumber: z.string().optional(),
  bookingEnabled: z.boolean().optional(),
  migrationManagerUrl: z.string().optional(),
  // Configurable CTA destinations (override the @vmd/config CTA_ROUTES defaults).
  ctaLinks: z
    .object({
      bookConsultationUrl: z.string().optional(),
      healthCheckUrl: z.string().optional(),
    })
    .optional(),
  // Client Portal navigation button (override @vmd/config CLIENT_PORTAL defaults).
  clientPortal: z
    .object({
      enabled: z.boolean().optional(),
      label: z.string().optional(),
      url: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
});
export type SiteSettings = z.infer<typeof siteSettings>;
