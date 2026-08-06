/**
 * Featured team — the single source of truth for the people shown on the
 * "Meet the Team" page (/about/team/) and the homepage glimpse.
 *
 * Design intent: the two featured professionals are always present with polished
 * default copy, so the page looks complete today. When staff add real entries to
 * the CMS "Team Members" collection (with professional portraits), that data is
 * merged over the defaults by name — and any additional members simply append.
 * Adding people later never requires touching the page layout.
 *
 * Compliance: Sunil's professional title and MARN are stored together and are
 * always rendered together (see TeamCard) — they must never be separated.
 */
import { PRACTICE } from '@vmd/config';
import type { TeamMember } from './cms.ts';

export interface FeaturedMember extends TeamMember {
  name: string;
  position: string;
  /** Kept immediately beside the title, e.g. "MARN 2318234". Never separated. */
  credential?: string | null;
  /** Small, tasteful trust badge shown on the portrait (use sparingly). */
  badge?: string | null;
  /** One-line professional philosophy, shown as a pull quote. */
  philosophy?: string | null;
  /** "View full profile" target, when the person has a dedicated page. */
  profileHref?: string | null;
  /**
   * Other names the same person may appear under in the CMS (e.g. an earlier or
   * mistyped entry). A CMS member matching an alias is treated as THIS person —
   * absorbed into their card rather than shown as a separate one.
   */
  aliases?: string[];
}

const li = (arr: string[]) => arr.map((item) => ({ item }));

export const FEATURED_TEAM: FeaturedMember[] = [
  {
    name: PRACTICE.principal.name, // Sunil Uprety
    position: 'Registered Migration Agent (RMA)',
    credential: `MARN ${PRACTICE.principal.marn}`,
    badge: 'OMARA-registered',
    profileHref: '/about/sunil-uprety/',
    photo: { url: '/team/sunil-portrait.jpg', alt: 'Sunil Uprety, Registered Migration Agent' },
    shortBio:
      'Sunil leads the practice and personally assesses every matter. You get an honest read on where your case stands — including the best time and way to move forward — from the Registered Migration Agent, not a caseworker.',
    philosophy:
      'Good migration advice starts with an honest diagnosis — even when the honest answer is to wait.',
    expertise: li([
      'Skilled migration',
      'Employer-sponsored visas',
      'Student & graduate visas',
      'Partner visas',
      'Refusals & appeals',
    ]),
  },
  {
    name: 'Sudeep Bartaula',
    position: 'Data & Compliance Officer',
    profileHref: '/about/sudeep-bartaula/',
    photo: { url: '/team/sudeep-portrait.jpg', alt: 'Sudeep Bartaula, Data & Compliance Officer' },
    shortBio:
      'Sudeep keeps every client file accurate, secure and complete — managing the documentation and data behind each application, so nothing is missed and every deadline is tracked. It is the quiet, careful work that keeps a case moving.',
    philosophy:
      'Behind every smooth application is careful preparation — getting the detail right, so your case is ready when it matters.',
    expertise: li([
      'Document management',
      'Application compliance',
      'Data accuracy & privacy',
      'Client file integrity',
      'Deadline tracking',
    ]),
  },
];

const norm = (s?: string | null) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

/** All names (canonical + aliases) a featured person may appear under in the CMS. */
const matchNames = (d: FeaturedMember) => [d.name, ...(d.aliases ?? [])].map(norm);

/**
 * Merge CMS team members over the featured defaults:
 *  - the two featured pros are always shown with their curated identity and copy;
 *    from a matching CMS entry (by name OR alias) we adopt only the professional
 *    PHOTO — never the CMS name/title/bio, so a stale or mistyped entry can't
 *    corrupt the card;
 *  - any genuinely new CMS members append, ordered by displayOrder — so people
 *    can be added later without touching this file.
 */
export function resolveTeam(cmsMembers: TeamMember[] = []): FeaturedMember[] {
  const featured = FEATURED_TEAM.map((d) => {
    const names = matchNames(d);
    const c = cmsMembers.find((m) => names.includes(norm(m.name)));
    // Adopt only the uploaded photo; keep every other field curated.
    return c?.photo ? ({ ...d, photo: c.photo } as FeaturedMember) : d;
  });
  const consumed = new Set(FEATURED_TEAM.flatMap(matchNames));
  const extras = cmsMembers
    .filter((m) => !consumed.has(norm(m.name)))
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)) as FeaturedMember[];
  return [...featured, ...extras];
}

/** Shared field helpers so the card renders CMS and default shapes identically. */
export const roleOf = (m: TeamMember) => m.position || m.role || '';
export const bioOf = (m: TeamMember) => m.shortBio || m.bio || '';
export const listItems = (arr?: { item?: string | null }[] | null): string[] =>
  (arr ?? []).map((e) => e?.item).filter((s): s is string => !!s);
export const photoUrlOf = (m: TeamMember): string | null =>
  m.photo && typeof m.photo === 'object' && m.photo.url ? m.photo.url : null;
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
