/**
 * CMS content client (web-only glue, thin — ARCHITECTURE.md apps/web/src/lib).
 * Reads PUBLISHED content from Payload's REST API at build time. Every call falls
 * back to an empty result if the CMS is unreachable, so the site builds and renders
 * honest empty states without a live CMS. Types come from @vmd/schema.
 */
import { CTA_ROUTES, CLIENT_PORTAL } from '@vmd/config';
import type { ArticleMeta, CaseStudy, Testimonial, PinnedReview, SiteSettings } from '@vmd/schema';

const BASE = import.meta.env.PUBLIC_CMS_URL ?? 'http://localhost:3000';

type Doc = Record<string, unknown> & { id: string; slug?: string };

async function query<T = Doc>(
  collection: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const search = new URLSearchParams({
    'where[status][equals]': 'published',
    limit: '200',
    depth: '1',
    ...params,
  });
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
    query('articles', category ? { 'where[category][equals]': category } : {}) as Promise<
      (ArticleMeta & Doc)[]
    >,
  articleBySlug: async (slug: string) => {
    const docs = await query('articles', { 'where[slug][equals]': slug, limit: '1' });
    return docs[0] ?? null;
  },
  subclasses: () => query('subclasses', { depth: '2' }),
  subclassBySlug: async (slug: string) =>
    (await query('subclasses', { 'where[slug][equals]': slug, limit: '1', depth: '2' }))[0] ?? null,
  services: () => query('services'),
  serviceBySlug: async (slug: string) =>
    (await query('services', { 'where[slug][equals]': slug, limit: '1', depth: '2' }))[0] ?? null,
  // Success Stories / Client Results. Consent is enforced at the query: the public
  // site never fetches an entry whose consent box is unticked.
  successStories: () =>
    query('success-stories', { 'where[consent][equals]': 'true', sort: 'order', depth: '1' }),
  // "Our Services" content pages (/visas/…, /services/…, /initial-consultation).
  servicePages: () => query('service-pages', { depth: '1' }),
  servicePageBySlug: async (slug: string) =>
    (await query('service-pages', { 'where[slug][equals]': slug, limit: '1', depth: '1' }))[0] ??
    null,
  subclassesForService: (serviceId: string) =>
    query('subclasses', { 'where[service][equals]': serviceId, depth: '1' }),
  processingTimes: () => query('processing-times'),
  faqs: (subclass?: string) =>
    query('faqs', subclass ? { 'where[subclass][equals]': subclass } : {}),
  situations: () => query('situations', { depth: '1' }),
  situationBySlug: async (slug: string) =>
    (await query('situations', { 'where[slug][equals]': slug, limit: '1', depth: '1' }))[0] ?? null,
  caseStudies: (subclassCode?: string) =>
    query<CaseStudy>(
      'case-studies',
      subclassCode ? { 'where[subclass.code][equals]': subclassCode, depth: '1' } : { depth: '1' },
    ),
  testimonials: () => query<Testimonial>('testimonials', { sort: '-date' }),
  pinnedReviews: () => query<PinnedReview>('pinned-reviews', { sort: 'pinnedOrder' }),
  // Team Members (About page "Our team"). Published only, ordered by Display order.
  teamMembers: () => query<TeamMember & Doc>('team-members', { sort: 'displayOrder', depth: '1' }),
};

export type CtaLinks = { bookUrl: string; healthCheckUrl: string };
let ctaLinksCache: Promise<CtaLinks> | null = null;

/**
 * Resolve the two site-wide CTA destinations — the single source of truth for every
 * "Book a Consultation" and "Free Visa Health Check" button. Reads the CMS Settings
 * global and falls back to the @vmd/config CTA_ROUTES defaults, so the URLs are
 * editable in the CMS but a build never breaks when the CMS is unreachable.
 *
 * Memoised per process: many components call this during one build, and settings are
 * constant within a build. A redeploy picks up changed settings.
 */
export function getCtaLinks(): Promise<CtaLinks> {
  ctaLinksCache ??= (async () => {
    const settings = await getSettings();
    return {
      bookUrl: settings?.ctaLinks?.bookConsultationUrl || CTA_ROUTES.bookConsultation,
      healthCheckUrl: settings?.ctaLinks?.healthCheckUrl || CTA_ROUTES.healthCheck,
    };
  })();
  return ctaLinksCache;
}

export type ClientPortalNav = {
  enabled: boolean;
  label: string;
  url: string;
  color: string | null;
};
let clientPortalCache: Promise<ClientPortalNav> | null = null;

/**
 * Resolve the Client Portal nav button config from the CMS Settings global, falling
 * back to @vmd/config CLIENT_PORTAL defaults. The optional colour override is validated
 * as a hex value (defence-in-depth: never inject an arbitrary string into a style).
 */
/** WCAG contrast ratio of a hex colour against white — the button always uses white text. */
function contrastWithWhite(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.replace(/(.)/g, '$1$1') : h;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(parseInt(full.slice(0, 2), 16));
  const g = lin(parseInt(full.slice(2, 4), 16));
  const b = lin(parseInt(full.slice(4, 6), 16));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (lum + 0.05);
}

export function getClientPortal(): Promise<ClientPortalNav> {
  clientPortalCache ??= (async () => {
    const s = await getSettings();
    const cp = s?.clientPortal ?? {};
    const raw = (cp.color ?? '').trim();
    // Accept a CMS colour only if it is a valid hex AND clears AA (4.5:1) against the
    // white button text — otherwise ignore it and fall back to the accessible default.
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw);
    const color = isHex && contrastWithWhite(raw) >= 4.5 ? raw : null;
    return {
      enabled: cp.enabled ?? CLIENT_PORTAL.enabled,
      label: cp.label || CLIENT_PORTAL.label,
      // Use the CMS URL only when it's a real override — treat the legacy internal
      // default '/client-portal' as "unset" so it falls through to the configured
      // (Migration Manager) destination. The CMS can still override with any other URL.
      url: cp.url && cp.url !== '/client-portal' ? cp.url : CLIENT_PORTAL.url,
      color,
    };
  })();
  return clientPortalCache;
}

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

// --- Homepage global (tabbed, section-by-section editing) -------------------
type Link = { label?: string | null; href?: string | null } | null;
/** Shape of the Homepage global. Every field optional: the page falls back to
 *  its built-in copy when a field (or the whole global) is absent. */
export interface HomepageContent {
  hero?: {
    eyebrow?: string | null;
    title?: string | null;
    lead?: string | null;
    primaryCta?: Link;
    secondaryCta?: Link;
  };
  situations?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    items?: { label?: string | null; description?: string | null; href?: string | null }[] | null;
  };
  whyChoose?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    promises?: { text?: string | null }[] | null;
  };
  successStories?: {
    show?: boolean | null;
    eyebrow?: string | null;
    heading?: string | null;
    intro?: string | null;
    link?: Link;
  };
  featuredServices?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    seeAll?: Link;
    secondaryLink?: Link;
  };
  howWeWork?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    steps?: { label?: string | null; description?: string | null }[] | null;
  };
  practitioner?: {
    show?: boolean | null;
    eyebrow?: string | null;
    heading?: string | null;
    body?: { text?: string | null }[] | null;
    button?: Link;
  };
  googleReviews?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    count?: number | null;
  };
  featuredBlogs?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    link?: Link;
  };
  faqs?: {
    show?: boolean | null;
    heading?: string | null;
    intro?: string | null;
    items?: { question?: string | null; answer?: string | null }[] | null;
  };
  finalCta?: {
    show?: boolean | null;
    heading?: string | null;
    lead?: string | null;
    buttonLabel?: string | null;
    promise?: string | null;
  };
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    noindex?: boolean | null;
  } | null;
}
let homepageCache: Promise<HomepageContent | null> | null = null;

/**
 * Read the Homepage global (published version). Memoised per build. Returns null
 * if unreachable so the homepage renders entirely from its built-in fallback copy
 * — the CMS being down never breaks the home page.
 */
export function getHomepage(): Promise<HomepageContent | null> {
  homepageCache ??= (async () => {
    try {
      const res = await fetch(`${BASE}/api/globals/homepage?depth=1`);
      if (!res.ok) return null;
      return (await res.json()) as HomepageContent;
    } catch {
      return null;
    }
  })();
  return homepageCache;
}

// --- About / Contact page globals ------------------------------------------
/** A list item ({ item: '…' }) as stored by the Team Members array fields. */
type ListItem = { item?: string | null };
export interface TeamMember {
  name?: string | null;
  position?: string | null;
  /** Legacy alias for position (older About-global data). */
  role?: string | null;
  credential?: string | null;
  shortBio?: string | null;
  /** Short personal line shown in quotes under the bio on the About page. */
  motto?: string | null;
  /** Legacy alias for shortBio (older About-global data). */
  bio?: string | null;
  /** Legacy free-text specialisations (older About-global data). */
  specialisations?: string | null;
  fullBio?: unknown; // Lexical rich text — rendered via lexicalToHtml where shown
  qualifications?: ListItem[] | null;
  education?: ListItem[] | null;
  experience?: ListItem[] | null;
  expertise?: ListItem[] | null;
  languages?: ListItem[] | null;
  certifications?: ListItem[] | null;
  email?: string | null;
  phone?: string | null;
  social?: { platform?: string | null; url?: string | null }[] | null;
  photo?: { url?: string | null; alt?: string | null } | string | null;
  displayOrder?: number | null;
  featured?: boolean | null;
}
/** A bold lead-in term + description, as stored by the method/beliefs/whyVmd arrays. */
export type TermItem = { term?: string | null; description?: string | null };
export interface AboutContent {
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  body?: { text?: string | null }[] | null;
  /** "Diagnosis / Pathway / Outcome" — the clinical method. */
  method?: TermItem[] | null;
  /** "Care / Clarity / Consistency" — the practice's core value. */
  coreValue?: TermItem[] | null;
  /** "What we believe" list. */
  beliefs?: TermItem[] | null;
  /** "Why VMD" list. */
  whyVmd?: TermItem[] | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  team?: { heading?: string | null; intro?: string | null; members?: TeamMember[] | null } | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}
export interface ContactContent {
  eyebrow?: string | null;
  title?: string | null;
  lead?: string | null;
  hoursNote?: string | null;
  whatsappUrl?: string | null;
  formHeading?: string | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}
async function getGlobal<T>(slug: string, depth = 0): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/api/globals/${slug}?depth=${depth}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
let aboutCache: Promise<AboutContent | null> | null = null;
let contactCache: Promise<ContactContent | null> | null = null;
/** About page copy (published), or null to use built-in defaults. Memoised.
 *  depth:1 so team-member photos resolve to URLs. */
export function getAboutPage(): Promise<AboutContent | null> {
  aboutCache ??= getGlobal<AboutContent>('about-page', 1);
  return aboutCache;
}
/** Contact page copy (published), or null to use built-in defaults. Memoised. */
export function getContactPage(): Promise<ContactContent | null> {
  contactCache ??= getGlobal<ContactContent>('contact-page');
  return contactCache;
}

// --- Footer global (link columns) ------------------------------------------
export type FooterColumn = { heading: string; links: { label: string; href: string }[] };
let footerCache: Promise<FooterColumn[] | null> | null = null;

/** Footer link columns from the CMS, or null to use the site defaults. Memoised. */
export function getFooterColumns(): Promise<FooterColumn[] | null> {
  footerCache ??= (async () => {
    try {
      const res = await fetch(`${BASE}/api/globals/footer?depth=0`);
      if (!res.ok) return null;
      const data = (await res.json()) as { columns?: FooterColumn[] };
      const cols = (data.columns ?? []).filter((c) => c?.heading && c.links?.length);
      return cols.length ? cols : null;
    } catch {
      return null;
    }
  })();
  return footerCache;
}

// --- Social Media global ----------------------------------------------------
export type SocialLinksMap = {
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
};
let socialCache: Promise<SocialLinksMap> | null = null;

/** Social profile URLs from the CMS. Empty object if unreachable, so callers
 *  fall back to @vmd/config PRACTICE.social. Only http(s) URLs are returned. */
export function getSocialLinks(): Promise<SocialLinksMap> {
  socialCache ??= (async () => {
    try {
      const res = await fetch(`${BASE}/api/globals/social-media?depth=0`);
      if (!res.ok) return {};
      const raw = (await res.json()) as SocialLinksMap;
      const safe = (v: unknown): string | undefined =>
        typeof v === 'string' && /^https?:\/\//i.test(v.trim()) ? v.trim() : undefined;
      return {
        facebook: safe(raw.facebook),
        instagram: safe(raw.instagram),
        linkedin: safe(raw.linkedin),
        tiktok: safe(raw.tiktok),
        youtube: safe(raw.youtube),
      };
    } catch {
      return {};
    }
  })();
  return socialCache;
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
    const data = (await res.json()) as {
      docs?: Array<{ from: string; to: string; code?: string }>;
    };
    return (data.docs ?? []).map((d) => ({
      from: d.from,
      to: d.to,
      code: d.code === '302' ? 302 : 301,
    }));
  } catch {
    return [];
  }
}

/** SERVER-ONLY write: create a lead in Payload via REST with the agent API key. */
export async function createLead(
  lead: Record<string, unknown>,
  apiKey: string,
): Promise<{ id: string } | null> {
  // Storing the lead is best-effort: the notification email is the critical
  // delivery. Abort after 4s so a slow or unreachable CMS can never delay (or
  // hang) the API response — which would leave the client stuck on "Sending…".
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `users API-Key ${apiKey}` },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { doc?: { id: string } };
    return data.doc ? { id: data.doc.id } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** SERVER-ONLY: create a consultation record (system-of-record, ADR-0001). */
export async function createConsultation(
  rec: Record<string, unknown>,
  apiKey: string,
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${BASE}/api/consultations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `users API-Key ${apiKey}` },
      body: JSON.stringify(rec),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { doc?: { id: string } };
    return data.doc ? { id: data.doc.id } : null;
  } catch {
    return null;
  }
}

/** SERVER-ONLY: patch a consultation (e.g. store the provider reference). */
export async function patchConsultation(
  id: string,
  data: Record<string, unknown>,
  apiKey: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', Authorization: `users API-Key ${apiKey}` },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}
