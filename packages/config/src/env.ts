/**
 * Environment schema — validated at boot. A missing or malformed variable fails
 * fast with a readable message instead of surfacing as a runtime bug in production.
 *
 * CRITICAL SECURITY BOUNDARY:
 *   - `publicEnv` may be exposed to the browser (PUBLIC_* / client-safe).
 *   - `serverEnv` MUST NEVER reach a client bundle. SUPABASE_SERVICE_ROLE_KEY,
 *     PAYLOAD_SECRET and provider tokens live here only. CI greps client bundles
 *     for the service-role key (scripts/check-no-service-role.sh).
 */
import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database (Supabase Postgres). Payload uses the POOLED url on serverless (Supavisor).
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_URL: z.string().url().optional(),

  // Payload
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 chars'),
  REVALIDATE_SECRET: z.string().optional(),
  PAYLOAD_API_KEY: z.string().optional(),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().default('vmd-media'),

  // Supabase Storage S3-compatible credentials (Storage settings -> S3 access keys)
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('ap-southeast-2'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Email (Postmark — ARCHITECTURE.md, packages/email)
  POSTMARK_SERVER_TOKEN: z.string().min(1).optional(),
  POSTMARK_FROM_EMAIL: z.string().email().optional(),
  // Where new-lead admin notifications are sent. Optional: defaults to
  // PRACTICE.contact.email when unset (apps/web /api/health-check).
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),

  // CRM (HubSpot — ADR-0005). Server-only Private App token. Optional: when absent
  // the lead pipeline uses the manual (no-op) adapter; presence activates the
  // HubSpot Contact upsert with no code change (@vmd/crm).
  HUBSPOT_ACCESS_TOKEN: z.string().optional(),

  // Analytics (server-side GA4 Measurement Protocol)
  GA4_MEASUREMENT_ID: z.string().optional(),
  GA4_API_SECRET: z.string().optional(),

  // Spam / rate limiting
  TURNSTILE_SECRET_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Scheduling (ADR-0001). Selects the adapter; 'manual' requires no external creds.
  SCHEDULING_PROVIDER: z
    .enum(['manual', 'calcom', 'calendly', 'google', 'outlook'])
    .default('manual'),
});

const publicSchema = z.object({
  PUBLIC_SITE_URL: z.string().url().default('https://migrationdoctors.com.au'),
  PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  PLAUSIBLE_DOMAIN: z.string().default('migrationdoctors.com.au'),
  PUBLIC_CMS_URL: z.string().url().default('http://localhost:3000'),
  PUBLIC_SUPABASE_URL: z.string().url().optional(),
  PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof publicSchema>;

function read(source: Record<string, string | undefined>) {
  return source ?? {};
}

/** Parse & cache. Call once at server boot; throws on invalid config. */
export function serverEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = serverSchema.safeParse(read(source));
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    );
  }
  return parsed.data;
}

/** Client-safe subset. Never reference serverEnv() from browser code. */
export function publicEnv(source: Record<string, string | undefined> = process.env): PublicEnv {
  const parsed = publicSchema.safeParse(read(source));
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    );
  }
  return parsed.data;
}
