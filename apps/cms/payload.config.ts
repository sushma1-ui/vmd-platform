import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage } from '@payloadcms/storage-s3';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { collections } from './src/collections/index.ts';
import { globals } from './src/globals/index.ts';
import {
  auditAfterChange,
  auditAfterDelete,
  revalidateAfterChange,
  revalidateGlobalAfterChange,
} from './src/hooks/index.ts';

/**
 * Payload 3 config (Plane A). Postgres via the POOLED Supabase connection (Supavisor)
 * so serverless functions don't exhaust connections. Media + client documents go to
 * Supabase Storage over its S3-compatible endpoint. The audit hook is attached to
 * every collection. Connection happens at runtime — importing this file needs no DB.
 */
// Prefer a dedicated pooled URL for runtime; fall back to DATABASE_URL. Use `||` (not
// `??`) so an empty DATABASE_POOL_URL= line in .env correctly falls through instead of
// shadowing DATABASE_URL with an empty string.
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Both runtime and migrations use the DIRECT Postgres connection (DATABASE_URL);
// the bounded pool (below) keeps it within Supabase's connection limit. This is the
// stable, VERIFIED configuration for this low-traffic CMS, and it does not depend on
// a hand-pasted pooler string (which repeatedly failed to connect and took the CMS
// down). A Supavisor SESSION pooler can be layered in later, once validated end to
// end, by setting DATABASE_POOL_URL AND flipping the preference below — note the
// TRANSACTION pooler (port 6543) is NOT Payload-safe: it breaks initialization.
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_POOL_URL || '';

// Origins permitted for cross-origin API/cookie use. The website talks to the CMS
// server-to-server with an API key (no browser CORS involved), so this primarily
// hardens the admin panel's own cookie auth against cross-site use. Same-origin
// admin access is always allowed regardless of this list.
const siteUrl = process.env.PUBLIC_SITE_URL || 'https://migrationdoctors.com.au';
const cmsUrl = process.env.PUBLIC_CMS_URL || '';
const allowedOrigins = [
  siteUrl,
  'https://www.migrationdoctors.com.au',
  cmsUrl,
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000', 'http://localhost:4321']
    : []),
].filter((o): o is string => Boolean(o));

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  // Cross-origin allow-list for the REST/GraphQL API and CSRF-protected cookie auth.
  cors: allowedOrigins,
  csrf: allowedOrigins,
  // App-layer rate limit on the Payload API, keyed on the REAL client IP (trustProxy,
  // since we sit behind Vercel/Cloudflare). Unauthenticated writes are already denied
  // by access control; this caps hammering and brute-force against the login endpoint.
  // Generous enough never to throttle an editor working in the admin.
  rateLimit: { window: 60_000, max: 500, trustProxy: true },
  // Keep the GraphQL playground out of production and bound query complexity so a
  // crafted deep/nested query can't be used to exhaust the database.
  graphQL: { disablePlaygroundInProduction: true, maxComplexity: 1000 },
  // Brand the admin as VMD (browser tab + meta) so it reads as the practice's own
  // content manager, not a generic "Payload" install. A friendly welcome panel with
  // quick actions is added above the dashboard (see beforeDashboard).
  admin: {
    meta: {
      titleSuffix: '· Visa & Migration Doctors',
      description: 'Manage the content of the Visa & Migration Doctors website.',
    },
    components: {
      beforeDashboard: ['./src/admin/components/Welcome.tsx#Welcome'],
    },
  },
  editor: lexicalEditor(),
  // Cap upload size (15 MB) so a hostile or accidental huge file can't exhaust
  // storage/memory, while comfortably covering full-resolution phone photos and
  // stock images (a common cause of "upload failed" at the old 8 MB cap). Sharp
  // still generates small, optimised sizes for the website regardless of original.
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  db: postgresAdapter({
    pool: {
      connectionString,
      // Bound the per-instance pool so serverless cold-starts and concurrent
      // editors can't exhaust Supabase's connection slots (proven failure mode on
      // the Nano tier). max is well above 1 (so afterChange hooks don't deadlock)
      // and well below the tier limit; idle connections are released; a stuck
      // connect fails fast (10s) instead of hanging the request.
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
    // Committed migration files (see scripts/run-migrations.mjs). Generate with
    // `pnpm --filter @vmd/cms migrate:create`; they apply on deploy via `build`.
    migrationDir: path.resolve(dirname, 'src/migrations'),
  }),
  collections: collections.map((c) => ({
    ...c,
    hooks: {
      ...c.hooks,
      afterChange: [...(c.hooks?.afterChange ?? []), auditAfterChange, revalidateAfterChange],
      afterDelete: [...(c.hooks?.afterDelete ?? []), auditAfterDelete],
    },
  })),
  localization: { locales: ['en'], defaultLocale: 'en' }, // add locales later; fields are localization-ready
  globals: globals.map((g) => ({
    ...g,
    hooks: {
      ...g.hooks,
      afterChange: [...(g.hooks?.afterChange ?? []), revalidateGlobalAfterChange],
    },
  })),
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'vmd-media',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION ?? 'ap-southeast-2',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        },
      },
    }),
  ],
  typescript: { outputFile: './src/payload-types.ts' },
});
