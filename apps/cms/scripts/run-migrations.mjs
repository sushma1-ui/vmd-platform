// Runs pending Payload/Drizzle migrations before the Next build.
//
// WHY THIS EXISTS
// ---------------
// @payloadcms/db-postgres only auto-syncs the schema (Drizzle `push`) in
// DEVELOPMENT. In production it does nothing unless migrations are applied — so
// without this step every schema change silently fails to reach the database and
// saves that touch a new column blow up as a generic "Something went wrong".
//
// This is invoked from the `build` script. On Vercel (NODE_ENV=production with a
// real DATABASE_URL) it applies migrations; locally — where .env holds a
// placeholder DB host — it skips cleanly so `pnpm build` never fails on a DB it
// cannot reach. A migration error aborts the build on purpose: better a blocked
// deploy than a half-migrated live database.
import { execSync } from 'node:child_process';

const url = process.env.DATABASE_URL || process.env.DATABASE_POOL_URL || '';
const isProd = process.env.NODE_ENV === 'production';
// Guard against the committed placeholder host so a misconfigured local build
// can never point migrations at nothing (or, worse, the wrong database).
const looksReal = url && !url.includes('abcdefgh') && !url.includes('example');

if (!isProd) {
  console.log('[migrate] skipped — not a production build (NODE_ENV != production).');
  process.exit(0);
}
if (!looksReal) {
  console.log('[migrate] skipped — no real DATABASE_URL is configured for this build.');
  process.exit(0);
}

console.log('[migrate] applying pending Payload migrations…');
try {
  // `payload` resolves from node_modules/.bin because this runs inside the cms
  // package script. Migrations connect via the direct (non-pooled) URL — see
  // payload.config.ts, which selects it when argv includes "migrate".
  execSync('payload migrate', { stdio: 'inherit', env: process.env });
  console.log('[migrate] done.');
} catch (err) {
  console.error('[migrate] FAILED — aborting build so a broken schema is not deployed.');
  process.exit(1);
}
