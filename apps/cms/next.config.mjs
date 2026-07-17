import { withPayload } from '@payloadcms/next/withPayload';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Build-time ESLint lints the application source. The standalone `seed.ts` dev
     script (run via `node --experimental-strip-types`, never part of the app
     runtime or bundle) is intentionally out of this scope so its pragmatic
     generic-Payload `any` does not gate the app build. Linting is NOT disabled —
     seed.ts can still be linted directly by path, and every app directory below
     is fully linted. */
  eslint: {
    dirs: ['src/access', 'src/app', 'src/collections', 'src/fields', 'src/globals', 'src/hooks'],
  },
};

/* configPath is passed explicitly so the @payload-config alias resolves regardless of
   the working directory the build runs from (e.g. `turbo build` from the repo root). */
export default withPayload(nextConfig, { configPath: path.resolve(dir, 'payload.config.ts') });
