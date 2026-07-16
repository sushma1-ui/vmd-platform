#!/usr/bin/env node
/**
 * CI gate — Collection read-contract completeness (ADR-0004).
 *
 * The rule: every Payload collection must have a DECIDED read contract before it can be
 * rendered. A collection is either
 *   • PUBLIC_CONTENT — rendered on the public site → MUST have a `cms.*` read helper, or
 *   • SYSTEM_READ    — world-readable but consumed by a system function, not a page
 *                      (e.g. redirects → getRedirects, used by middleware), or
 *   • PRIVATE        — operational/admin data → MUST NOT appear in the public `cms` read
 *                      object (Leads/Consultations are written server-side; never read to
 *                      the browser — see ADR-0002, two-plane data model).
 *
 * Any collection that is not classified fails the build: adding a collection forces an
 * explicit read-contract decision rather than letting it drift in undefined. This turns
 * the audit from manual into mechanical (ARCHITECTURE.md §4.3).
 *
 * Enforced now: the read-contract rung (helper present / correctly absent).
 * Reported (informational): the renderer and test rungs of the pipeline
 *   Collection → cms.ts helper → typed interface → renderer(s) → tests
 * so the remaining work is visible without over-gating ahead of the phases that build it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const COLLECTIONS_DIR = `${ROOT}apps/cms/src/collections`;
const CMS_LIB = `${ROOT}apps/web/src/lib/cms.ts`;

// --- Classification. Keyed by collection slug; grounded in ADR-0002. ---------------
const PUBLIC_CONTENT = new Set([
  'articles', 'services', 'subclasses', 'situations', 'faqs',
  'testimonials', 'case-studies', 'grant-ledger', 'processing-times', 'pinned-reviews',
]);
const SYSTEM_READ = new Set(['redirects']); // read by getRedirects(), consumed by middleware
const PRIVATE = new Set(['leads', 'consultations', 'users', 'audit-log', 'media']);

// slug → the primary helper name expected on the `cms` object (informational rungs).
const HELPER = {
  articles: 'articles', services: 'services', subclasses: 'subclasses', situations: 'situations',
  faqs: 'faqs', testimonials: 'testimonials', 'case-studies': 'caseStudies',
  'grant-ledger': 'grantLedger', 'processing-times': 'processingTimes', 'pinned-reviews': 'pinnedReviews',
};

// --- Read the authoritative slugs straight from the collection sources -------------
function collectionSlugs() {
  const out = [];
  for (const file of readdirSync(COLLECTIONS_DIR)) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    const src = readFileSync(`${COLLECTIONS_DIR}/${file}`, 'utf8');
    const m = src.match(/slug:\s*'([^']+)'/);
    if (m) out.push({ file, slug: m[1] });
  }
  return out;
}

// Extract the `export const cms = { ... };` object body by brace-matching.
function cmsReadObject(src) {
  const start = src.indexOf('export const cms = {');
  if (start === -1) throw new Error('cms.ts: `export const cms = {` not found');
  let depth = 0, i = src.indexOf('{', start);
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

function webGrep(needle) {
  try {
    execSync(`grep -rlF ${JSON.stringify(needle)} ${ROOT}apps/web/src`, { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

// --- Run ---------------------------------------------------------------------------
const cmsSrc = readFileSync(CMS_LIB, 'utf8');
const readObj = cmsReadObject(cmsSrc);
const slugs = collectionSlugs();
const failures = [];
const rows = [];

for (const { file, slug } of slugs) {
  const inReadObj = readObj.includes(`'${slug}'`);
  let bucket, contract;

  if (PUBLIC_CONTENT.has(slug)) {
    bucket = 'public';
    if (inReadObj) contract = 'ok';
    else { contract = 'MISSING helper'; failures.push(`${slug}: PUBLIC_CONTENT but no cms.* read helper (add query('${slug}'…))`); }
  } else if (SYSTEM_READ.has(slug)) {
    bucket = 'system';
    if (inReadObj) { contract = 'EXPOSED'; failures.push(`${slug}: SYSTEM_READ must not sit on the public cms read object`); }
    else if (!cmsSrc.includes('getRedirects')) { contract = 'no reader'; failures.push(`${slug}: SYSTEM_READ has no dedicated reader (getRedirects)`); }
    else contract = 'ok (getRedirects)';
  } else if (PRIVATE.has(slug)) {
    bucket = 'private';
    if (inReadObj) { contract = 'EXPOSED'; failures.push(`${slug}: PRIVATE collection must not be readable via the public cms object (ADR-0002)`); }
    else contract = 'ok (not exposed)';
  } else {
    bucket = 'UNCLASSIFIED';
    contract = '—';
    failures.push(`${slug}: unclassified collection — decide its read contract in scripts/check-cms-contract.mjs (public / system / private)`);
  }

  // Informational rungs (not gated here).
  let renderer = '—', tests = '—';
  if (bucket === 'public') {
    renderer = webGrep(`cms.${HELPER[slug]}(`) ? 'wired' : 'pending';
    tests = 'pending';
  }
  rows.push({ collection: file.replace('.ts', ''), slug, bucket, contract, renderer, tests });
}

// --- Report ------------------------------------------------------------------------
const pad = (s, n) => String(s).padEnd(n);
console.log('\nCollection read-contract audit (ADR-0004)\n');
console.log(pad('COLLECTION', 18) + pad('SLUG', 18) + pad('CLASS', 14) + pad('CONTRACT', 20) + pad('RENDERER', 10) + 'TESTS');
console.log('-'.repeat(86));
for (const r of rows) {
  console.log(pad(r.collection, 18) + pad(r.slug, 18) + pad(r.bucket, 14) + pad(r.contract, 20) + pad(r.renderer, 10) + r.tests);
}
console.log('');

if (failures.length) {
  console.error('✖ Read-contract completeness failed:\n');
  for (const f of failures) console.error(`  • ${f}`);
  console.error('');
  process.exit(1);
}
console.log('✔ Every collection has a decided read contract.\n');
