/**
 * Post-build fix: the @astrojs/vercel v7 adapter (the only one compatible with
 * Astro 4) emits its serverless functions with "runtime": "nodejs18.x", which
 * Vercel has discontinued (alongside Node 20). This rewrites the generated
 * function configs to a supported runtime so `Deploying outputs...` succeeds.
 *
 * It ONLY changes the `runtime` field, and ONLY when it is a discontinued
 * nodejs18/20 value — every other field is preserved untouched. If the adapter
 * is ever upgraded to emit a supported runtime, this becomes a harmless no-op.
 *
 * Runs after `astro build` (see apps/web package.json "build" script). cwd is the
 * web package, so the Build Output API functions live at .vercel/output/functions.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FN_DIR = '.vercel/output/functions';
const TARGET = 'nodejs22.x';
const DISCONTINUED = /^nodejs(18|20)\.x$/;

if (!existsSync(FN_DIR)) {
  console.log(`[fix-runtime] ${FN_DIR} not found (static-only build?) — nothing to do.`);
  process.exit(0);
}

let changed = 0;
let seen = 0;
for (const entry of readdirSync(FN_DIR)) {
  if (!entry.endsWith('.func')) continue;
  const cfgPath = join(FN_DIR, entry, '.vc-config.json');
  if (!existsSync(cfgPath)) continue;
  seen++;
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  if (typeof cfg.runtime === 'string' && DISCONTINUED.test(cfg.runtime)) {
    const old = cfg.runtime;
    cfg.runtime = TARGET;
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
    console.log(`[fix-runtime] ${entry}: ${old} -> ${TARGET}`);
    changed++;
  } else {
    console.log(`[fix-runtime] ${entry}: runtime "${cfg.runtime}" — left as-is`);
  }
}
console.log(`[fix-runtime] done: ${changed} of ${seen} function(s) updated to ${TARGET}.`);
