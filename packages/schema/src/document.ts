import { z } from 'zod';
/** Client document (Plane B). Private bucket; provider is swappable (ADR-0003). */
export const clientDocument = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  filename: z.string().min(1),
  storagePath: z.string().min(1),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  sizeBytes: z.number().int().nonnegative(),
  provider: z.enum(['supabase', 'onedrive']).default('supabase'),
  providerRef: z.string().nullable().default(null),
  uploadedAt: z.string().datetime(),
});
export type ClientDocument = z.infer<typeof clientDocument>;
