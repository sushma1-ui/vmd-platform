/**
 * @vmd/config — public API.
 *
 * The foundation package. It depends on nothing (see ARCHITECTURE.md §4.2) so
 * that everything else can stand on it. It holds ONLY:
 *   - genuinely cross-cutting constants (the practice's canonical identity)
 *   - the environment schema (./env)
 *   - shared tsconfig / eslint / prettier presets
 *
 * It is NOT a dumping ground. If a helper belongs to a capability, it lives in
 * that capability's package.
 */

export { serverEnv, publicEnv, type ServerEnv, type PublicEnv } from './env.ts';

/**
 * Canonical practice identity. Single source of truth for NAP and registration.
 * NOTE: this is verifiable public identity data (registration, address, channels)
 * defined once so it can never drift between header, footer and schema.org output.
 * It is NOT marketing content or business data (fees, outcomes) — that lives in the CMS.
 */
export const PRACTICE = {
  legalName: 'Visa & Migration Doctors',
  descriptor: 'MIGRATION ADVISORY · PERTH',
  principal: {
    name: 'Sunil Uprety',
    title: 'Director · Registered Migration Agent',
    marn: '2318234',
  },
  regulator: {
    name: 'OMARA',
    longName: 'Office of the Migration Agents Registration Authority',
    registerUrl: 'https://www.mara.gov.au/',
    registerSearchUrl: 'https://portal.mara.gov.au/search-the-register-of-migration-agents/',
  },
  contact: {
    phone: '+61493719431',
    phoneDisplay: '+61 493 719 431',
    email: 'sunil@migrationdoctors.com.au',
  },
  address: {
    street: 'Level 27, 44 St Georges Terrace',
    locality: 'Perth',
    region: 'WA',
    postcode: '6000',
    country: 'AU',
  },
  hoursNote: 'Mon–Fri 9–5 AWST · Appointment-only',
  domain: 'migrationdoctors.com.au',
  timezone: 'Australia/Perth',
  /**
   * Official social profiles. Single source of truth for the header/footer icons.
   * NOTE: confirm these handles are correct before launch; only profiles with a
   * URL here are rendered. Set a value to '' to hide that icon.
   */
  social: {
    // All four confirmed. Set any value to '' to hide that icon.
    instagram: 'https://www.instagram.com/visa_and_migration_doctors',
    facebook: 'https://www.facebook.com/profile.php?id=61574457641534',
    linkedin: 'https://www.linkedin.com/company/visa-migration-doctors/',
    tiktok: 'https://www.tiktok.com/@visa.and.migratio',
  },
} as const;

/**
 * Canonical RMA identity line — the SINGLE source of truth for how the agent and MARN
 * are presented. Compliance rules: the MARN is NEVER shown alone, and the wording is
 * NEVER abbreviated differently between pages. Referenced by the header, footer, trust
 * strip, author bylines, contact page and anywhere the practitioner is identified.
 * To change the presentation, change it here only.
 */
export const RMA_LINE = `Registered Migration Agent (RMA): ${PRACTICE.principal.name} | MARN: ${PRACTICE.principal.marn}`;

/**
 * Canonical firm-credentials sentence. A BUSINESS cannot be a Registered Migration
 * Agent — only a person can — so wherever the practice's credentials are described in
 * prose, use this statement (never wording that implies the practice itself is
 * registered). Single-sourced here.
 */
export const RMA_STATEMENT = `${PRACTICE.legalName} is a migration practice led by Registered Migration Agent (RMA) ${PRACTICE.principal.name} (MARN: ${PRACTICE.principal.marn}).`;

/**
 * The non-negotiable compliance strings. Rendered by the Disclaimer component
 * (packages/ui) so wording is identical everywhere and can be audited in one place.
 */
export const DISCLAIMERS = {
  outcomes:
    'Every application is decided on its own merits under Australian migration law. Past outcomes do not indicate or guarantee future results.',
  generalInformation:
    'This is general information, not migration, legal or financial advice. Speak to a Registered Migration Agent about your circumstances.',
} as const;

/**
 * Default call-to-action destinations. These are FALLBACKS only — the CMS Settings
 * global (`ctaLinks`) overrides them at runtime, so the URLs can change without a
 * code change. Primary CTA is "Book a Consultation"; secondary is the Free Visa
 * Health Check lead-gen flow.
 */
export const CTA_ROUTES = {
  bookConsultation: '/book-consultation',
  healthCheck: '/health-check',
} as const;

/**
 * Client Portal navigation button — defaults. The CMS Settings global overrides label,
 * url and visibility so the practice can change them without a code change. Colour is
 * the brand blue (--color-interactive); an optional CMS colour override is validated
 * as a hex value before use.
 */
export const CLIENT_PORTAL = {
  label: 'Client Portal',
  // Points at the existing Migration Manager DocumentPortal (clients log in there).
  // The website only provides the entry point; portal functionality stays in MM.
  // CMS-overridable via Settings → clientPortal.url.
  url: 'https://studentsavenue.mmportal.cloud/DocumentPortal2/login',
  enabled: true,
} as const;
