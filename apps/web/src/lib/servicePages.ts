/** Shared types + helpers for "Our Services" pages (service-pages collection). */

export interface ServiceDoc {
  id: string | number;
  title: string;
  slug: string;
  section: 'visas' | 'services' | 'root';
  subtitle?: string | null;
  content?: unknown;
  featured?: boolean | null;
  faq?: { question?: string | null; answer?: string | null }[] | null;
  cta?: { heading?: string | null; body?: string | null } | null;
  relatedLinks?: { label?: string | null }[] | null;
  disclaimer?: string | null;
  readingTime?: number | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    noindex?: boolean | null;
  } | null;
}

/** Live URL for a service page — the document's exact, mixed-prefix slugs. */
export const servicePageHref = (p: { section: string; slug: string }): string =>
  p.section === 'root' ? `/${p.slug}` : `/${p.section}/${p.slug}`;
