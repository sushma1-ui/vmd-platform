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

// Runtime uses the Supabase SESSION pooler (DATABASE_POOL_URL, Supavisor port 5432):
// it multiplexes the many short-lived serverless connections the direct connection
// can't absorb on the Nano tier, and — unlike the TRANSACTION pooler (6543) — it
// supports the prepared statements Payload's Postgres driver needs (verified against
// Supabase docs). Migrations run DDL (which poolers don't support) so they use the
// DIRECT connection (DATABASE_URL).
const isMigrating = process.argv.some((arg) => arg.includes('migrate'));
const pooledUrl = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL || '';
const directUrl = process.env.DATABASE_URL || process.env.DATABASE_POOL_URL || '';
const connectionString = isMigrating ? directUrl : pooledUrl;

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  editor: lexicalEditor(),
  // Cap upload size (8 MB) so a hostile or accidental huge file can't exhaust
  // storage/memory. Comfortably covers high-resolution photography.
  upload: { limits: { fileSize: 8 * 1024 * 1024 } },
  db: postgresAdapter({
    pool: {
      connectionString,
      // Supabase requires SSL, and its Supavisor pooler presents a private-CA cert
      // that node-postgres won't validate against the public CA set — so the
      // connection is encrypted but CA verification is skipped (the pooler host is
      // trusted). Without this the pooler connection fails outright. Can be hardened
      // later by bundling Supabase's root CA.
      ssl: { rejectUnauthorized: false },
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
