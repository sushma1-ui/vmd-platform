import { withPayload } from '@payloadcms/next/withPayload';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };

/* configPath is passed explicitly so the @payload-config alias resolves regardless of
   the working directory the build runs from (e.g. `turbo build` from the repo root). */
export default withPayload(nextConfig, { configPath: path.resolve(dir, 'payload.config.ts') });
