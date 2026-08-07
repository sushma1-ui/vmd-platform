import type { APIRoute } from 'astro';
import { cms } from '../lib/cms.ts';
import { servicePageHref, type ServiceDoc } from '../lib/servicePages.ts';

/**
 * Build-time search index. Emitted as a static JSON file the client fetches once
 * and searches locally — no per-query serverless cost, works even if the CMS is
 * offline at request time, and stays in sync because it's regenerated on every
 * build (and Vercel ISR revalidation).
 *
 * Each entry is intentionally tiny: t=title, u=url, k=kind, d=short description,
 * kw=extra keywords. All CMS reads fail open to [] so a search index always
 * builds, even with an empty/unreachable CMS.
 */
export const prerender = true;

interface Entry {
  t: string;
  u: string;
  k: string;
  d: string;
  kw?: string;
}

const clean = (s: unknown): string => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : '');

/** Curated evergreen pages that aren't CMS-driven but users search for. */
const STATIC_PAGES: Entry[] = [
  { t: 'Home', u: '/', k: 'Page', d: 'Registered Migration Agent in Perth.' },
  { t: 'About Us', u: '/about/', k: 'Page', d: 'Who we are and how we work.' },
  {
    t: 'Sunil Uprety — Registered Migration Agent',
    u: '/about/sunil-uprety/',
    k: 'Page',
    d: 'Sunil Uprety, your Registered Migration Agent (RMA) — MARN 2318234.',
  },
  { t: 'Our Fees', u: '/about/fees/', k: 'Page', d: 'How our professional fees work.' },
  { t: 'Contact', u: '/contact/', k: 'Page', d: 'Get in touch with our Perth office.' },
  {
    t: 'Book a Consultation',
    u: '/book-consultation/',
    k: 'Action',
    d: 'Book a migration consultation.',
  },
  {
    t: 'Free Visa Health Check',
    u: '/health-check/',
    k: 'Action',
    d: 'Check your visa eligibility.',
    kw: 'eligibility assessment',
  },
  {
    t: 'Success Stories',
    u: '/results/success-stories/',
    k: 'Page',
    d: 'Real client outcomes and testimonials.',
    kw: 'testimonials results reviews',
  },
  { t: 'Google Reviews', u: '/results/reviews/', k: 'Page', d: 'What our clients say on Google.' },
  { t: 'Case Studies', u: '/results/case-studies/', k: 'Page', d: 'Detailed client case studies.' },
  {
    t: 'Frequently Asked Questions',
    u: '/resources/faq/',
    k: 'Page',
    d: 'Answers to common migration questions.',
    kw: 'faq help',
  },
  {
    t: 'Processing Times',
    u: '/resources/processing-times/',
    k: 'Page',
    d: 'Current visa processing times.',
  },
  {
    t: 'Migration Agent Perth',
    u: '/locations/migration-agent-perth/',
    k: 'Page',
    d: 'Migration services in Perth.',
  },
  {
    t: 'Migration Agent WA',
    u: '/locations/migration-agent-wa/',
    k: 'Page',
    d: 'Migration services across Western Australia.',
  },
  { t: 'Complaints', u: '/complaints/', k: 'Page', d: 'How to raise a complaint.' },
  { t: 'Privacy Policy', u: '/privacy/', k: 'Page', d: 'How we handle your data.' },
  { t: 'Terms', u: '/terms/', k: 'Page', d: 'Website terms of use.' },
];

export const GET: APIRoute = async () => {
  const entries: Entry[] = [...STATIC_PAGES];

  // --- Service pages (the 14 visa/service pages) ---
  const servicePages = (await cms.servicePages().catch(() => [])) as ServiceDoc[];
  for (const p of servicePages) {
    if (!p?.slug || p.seo?.noindex) continue;
    entries.push({
      t: clean(p.title),
      u: servicePageHref(p),
      k: p.section === 'visas' ? 'Visa' : 'Service',
      d: clean(p.subtitle ?? p.seo?.metaDescription),
      kw: clean((p.faq ?? []).map((f) => f?.question).join(' ')) || undefined,
    });
  }

  // --- Blog / insights ---
  const articles = (await cms.articles().catch(() => [])) as Array<Record<string, unknown>>;
  for (const a of articles) {
    const slug = clean(a.slug);
    if (!slug) continue;
    entries.push({
      t: clean(a.title),
      u: `/blog/${slug}/`,
      k: 'Article',
      d: clean(a.excerpt),
    });
  }

  // --- Situation hubs ---
  const situations = (await cms.situations().catch(() => [])) as Array<Record<string, unknown>>;
  for (const s of situations) {
    const slug = clean(s.slug);
    if (!slug) continue;
    entries.push({
      t: clean(s.title),
      u: `/your-situation/${slug}/`,
      k: 'Situation',
      d: clean(s.empathyLine),
    });
  }

  // De-dupe by URL, keep first (curated static wins over CMS collisions).
  const seen = new Set<string>();
  const deduped = entries.filter((e) => {
    if (!e.t || !e.u || seen.has(e.u)) return false;
    seen.add(e.u);
    return true;
  });

  return new Response(JSON.stringify(deduped), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
