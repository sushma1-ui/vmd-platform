/**
 * CMS content client (web-only glue, thin — ARCHITECTURE.md apps/web/src/lib).
 * Reads PUBLISHED content from Payload's REST API at build time. Every call falls
 * back to an empty result if the CMS is unreachable, so the site builds and renders
 * honest empty states without a live CMS. Types come from @vmd/schema.
 */
import type { ArticleMeta, CaseStudy, Testimonial, PinnedReview, GrantLedgerEntry, SiteSettings } from '@vmd/schema';

const BASE = import.meta.env.PUBLIC_CMS_URL ?? 'http://localhost:3000';

type Doc = Record<string, unknown> & { id: string; slug?: string };

async function query<T = Doc>(collection: string, params: Record<string, string> = {}): Promise<T[]> {
  const search = new URLSearchParams({ 'where[status][equals]': 'published', limit: '200', depth: '1', ...params });
  try {
    const res = await fetch(`${BASE}/api/${collection}?${search.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: T[] };
    return data.docs ?? [];
  } catch {
    return []; // CMS unreachable — pages render their empty state
  }
}

export const cms = {
  articles: (category?: string) =>
    query('articles', category ? { 'where[category][equals]': category } : {}) as Promise<(ArticleMeta & Doc)[]>,
  articleBySlug: async (slug: string) => {
    const docs = await query('articles', { 'where[slug][equals]': slug, limit: '1' });
    return docs[0] ?? null;
  },
  subclasses: () => query('subclasses', { depth: '2' }),
  subclassBySlug: async (slug: string) => (await query('subclasses', { 'where[slug][equals]': slug, limit: '1', depth: '2' }))[0] ?? null,
  services: () => query('services'),
  serviceBySlug: async (slug: string) => (await query('services', { 'where[slug][equals]': slug, limit: '1', depth: '2' }))[0] ?? null,
  subclassesForService: (serviceId: string) => query('subclasses', { 'where[service][equals]': serviceId, depth: '1' }),
  grantLedger: (subclassCode?: string) =>
    query<GrantLedgerEntry>('grant-ledger', subclassCode ? { 'where[subclassCode][equals]': subclassCode } : {}),
  processingTimes: () => query('processing-times'),
  faqs: (subclass?: string) => query('faqs', subclass ? { 'where[subclass][equals]': subclass } : {}),
  situations: () => query('situations', { depth: '1' }),
  situationBySlug: async (slug: string) =>
    (await query('situations', { 'where[slug][equals]': slug, limit: '1', depth: '1' }))[0] ?? null,
  caseStudies: (subclassCode?: string) =>
    query<CaseStudy>('case-studies', subclassCode ? { 'where[subclass.code][equals]': subclassCode, depth: '1' } : { depth: '1' }),
  testimonials: () => query<Testimonial>('testimonials', { sort: '-date' }),
  pinnedReviews: () => query<PinnedReview>('pinned-reviews', { sort: 'pinnedOrder' }),
};

export type Redirect = { from: string; to: string; code: 301 | 302 };

/**
 * Read the sitewide Settings global. Globals are single objects (no {docs}) and the
 * Settings read access is public. Returns null if unreachable so pages fall to honest
 * empty states (e.g. the reviews aggregate simply doesn't render). Typed via @vmd/schema.
 */
export async function getSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${BASE}/api/globals/settings?depth=0`);
    if (!res.ok) return null;
    return (await res.json()) as SiteSettings;
  } catch {
    return null;
  }
}

/**
 * Read editor-managed redirects. The Redirects collection is world-readable and has
 * NO status field, so it can't go through query() (which forces where[status]=published).
 * Falls back to [] if the CMS is unreachable, so a build/request never breaks on it.
 */
export async function getRedirects(): Promise<Redirect[]> {
  try {
    const res = await fetch(`${BASE}/api/redirects?limit=1000&depth=0`);
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: Array<{ from: string; to: string; code?: string }> };
    return (data.docs ?? []).map((d) => ({ from: d.from, to: d.to, code: d.code === '302' ? 302 : 301 }));
  } catch {
    return [];
  }
}

/** SERVER-ONLY write: create a lead in Payload via REST with the agent API key. */
export async function createLead(lead: Record<string, unknown>, apiKey: string): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `users API-Key ${apiKey}` },
      body: JSON.stringify(lead),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { doc?: { id: string } };
    return data.doc ? { id: data.doc.id } : null;
  } catch {
    return null;
  }
}

/** SERVER-ONLY: create a consultation record (system-of-record, ADR-0001). */
export async function createConsultation(rec: Record<string, unknown>, apiKey: string): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${BASE}/api/consultations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `users API-Key ${apiKey}` },
      body: JSON.stringify(rec),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { doc?: { id: string } };
    return data.doc ? { id: data.doc.id } : null;
  } catch { return null; }
}

/** SERVER-ONLY: patch a consultation (e.g. store the provider reference). */
export async function patchConsultation(id: string, data: Record<string, unknown>, apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', Authorization: `users API-Key ${apiKey}` },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch { return false; }
}
