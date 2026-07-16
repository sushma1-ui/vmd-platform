/** @vmd/seo — public API. Pure generators: typed data in, meta/JSON-LD out. */
export { buildMeta, type MetaInput, type MetaTag } from './meta.ts';
export {
  organizationSchema, localBusinessSchema, personSchema,
  articleSchema, faqSchema, breadcrumbSchema, serviceSchema,
} from './schema-org.ts';
