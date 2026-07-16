import { z } from 'zod';
/** Client-portal message (Plane B). Browser-direct under RLS; sender is constrained. */
export const clientMessage = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sender: z.enum(['client', 'practice']),
  body: z.string().trim().min(1).max(8000),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type ClientMessage = z.infer<typeof clientMessage>;
