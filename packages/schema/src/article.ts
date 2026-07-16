import { z } from 'zod';

/**
 * ONE content type for the Knowledge Centre. A blog post and a resource article
 * are the same object with a category (ARCHITECTURE.md §2.2). This schema is the
 * shared shape; the Payload collection (apps/cms) and the renderer (apps/web)
 * both derive from it.
 */
export const articleCategory = z.enum([
  'guide',
  'migration-news',
  'employer-hub',
  'student-hub',
  'partner-visa-hub',
  'visitor-visa-hub',
  'refusals-appeals',
  'moving-to-perth',
  'case-study',
]);

export const articleStatus = z.enum(['draft', 'scheduled', 'published']);

export const articleMeta = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: articleCategory,
  status: articleStatus,
  excerpt: z.string().max(300).optional(),
  authorMarn: z.string().default('2318234'),
  lastReviewedUtc: z.string().datetime().optional(),
  publishedUtc: z.string().datetime().optional(),
});
export type ArticleMeta = z.infer<typeof articleMeta>;
