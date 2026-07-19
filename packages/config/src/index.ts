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
    street: '44 St Georges Terrace',
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
    facebook: 'https://www.facebook.com/migrationdoctors',
    instagram: 'https://www.instagram.com/migrationdoctors',
    linkedin: 'https://www.linkedin.com/company/visa-migration-doctors',
    tiktok: 'https://www.tiktok.com/@migrationdoctors',
  },
} as const;

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
