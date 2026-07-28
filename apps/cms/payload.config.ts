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
const connectionString = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL || '';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  editor: lexicalEditor(),
  // Cap upload size (8 MB) so a hostile or accidental huge file can't exhaust
  // storage/memory. Comfortably covers high-resolution photography.
  upload: { limits: { fileSize: 8 * 1024 * 1024 } },
  db: postgresAdapter({ pool: { connectionString } }),
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
