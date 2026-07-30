import { PRACTICE } from '@vmd/config';
import type { ArticleMeta } from '@vmd/schema';

const SITE = `https://${PRACTICE.domain}`;
const address = {
  '@type': 'PostalAddress',
  streetAddress: PRACTICE.address.street,
  addressLocality: PRACTICE.address.locality,
  addressRegion: PRACTICE.address.region,
  postalCode: PRACTICE.address.postcode,
  addressCountry: PRACTICE.address.country,
};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE}/#practice`,
    name: PRACTICE.legalName,
    url: SITE,
    telephone: PRACTICE.contact.phoneDisplay,
    email: PRACTICE.contact.email,
    address,
    areaServed: 'AU',
    founder: personSchema(),
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: PRACTICE.legalName,
    address,
    telephone: PRACTICE.contact.phoneDisplay,
    url: SITE,
  };
}

/** The E-E-A-T anchor. hasCredential = MARN; sameAs -> OMARA register. */
export function personSchema() {
  return {
    '@type': 'Person',
    name: PRACTICE.principal.name,
    jobTitle: PRACTICE.principal.title,
    worksFor: { '@type': 'Organization', name: PRACTICE.legalName },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Registered Migration Agent',
      identifier: `MARN ${PRACTICE.principal.marn}`,
    },
    sameAs: [PRACTICE.regulator.registerSearchUrl],
  };
}

export function articleSchema(meta: ArticleMeta, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    url: new URL(path, SITE).href,
    datePublished: meta.publishedUtc,
    dateModified: meta.lastReviewedUtc ?? meta.publishedUtc,
    author: personSchema(),
    publisher: { '@type': 'Organization', name: PRACTICE.legalName },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: new URL(t.path, SITE).href,
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? 'Migration advice',
    provider: { '@type': 'ProfessionalService', name: PRACTICE.legalName, url: SITE },
    areaServed: { '@type': 'Country', name: 'Australia' },
    url: new URL(input.path, SITE).href,
  };
}
