import { leadSchema, type Lead } from '@vmd/schema';
export { verifyTurnstile, turnstileConfigured, type TurnstileOptions } from './spam.ts';
export { rateLimit, type UpstashConfig } from './rate-limit.ts';
export { readJson, type ReadJsonResult } from './body.ts';

export type ValidationResult<T> =
  { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string> };

export function validateLead(input: unknown): ValidationResult<Lead> {
  const parsed = leadSchema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
  return { ok: false, fieldErrors };
}

export interface SpamSignals {
  honeypot?: string;
  turnstileToken?: string;
  ip?: string;
}
