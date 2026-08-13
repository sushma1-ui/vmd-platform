import { PRACTICE } from '@vmd/config';

export interface MetaInput {
  title: string;
  description: string;
  path: string; // e.g. "/about/"
  // When a page is intentionally reachable at more than one path (e.g. an article
  // rendered at both /blog/<slug>/ and /resources/<slug>/), set canonicalPath to the
  // ONE primary URL so search engines consolidate on it instead of seeing duplicates.
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}
export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

/** Pure: typed input -> the meta tags the layout renders. Canonical from one origin. */
export function buildMeta(input: MetaInput) {
  const site = `https://${PRACTICE.domain}`;
  const canonical = new URL(input.canonicalPath ?? input.path, site).href;
  // Append the brand only when the page title doesn't already contain it, so titles
  // like "Our Services | Visa & Migration Doctors" don't double the brand name (B3).
  const title = input.title.includes(PRACTICE.legalName)
    ? input.title
    : `${input.title} · ${PRACTICE.legalName}`;
  const image = input.ogImage ?? `${site}/og-default.png`;
  const tags: MetaTag[] = [
    { name: 'description', content: input.description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: input.description },
    { property: 'og:type', content: input.type ?? 'website' },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    { property: 'og:site_name', content: PRACTICE.legalName },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: image },
  ];
  if (input.noindex) tags.push({ name: 'robots', content: 'noindex, nofollow' });
  return { title, canonical, tags };
}
