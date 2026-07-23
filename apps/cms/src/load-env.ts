/**
 * Load the monorepo-root .env for standalone scripts (seed, one-off tooling) that run
 * outside Next.js. The Next dev/build server loads it via next.config.mjs; scripts run
 * with `node` do not, so they import THIS module FIRST — before payload.config — so
 * DATABASE_URL / PAYLOAD_SECRET are present when the config is evaluated.
 *
 * No-op if the file is absent (e.g. when the platform injects env directly).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.resolve(here, '../../../.env'));
} catch {
  /* env provided by the platform (Vercel etc.) — nothing to load */
}
