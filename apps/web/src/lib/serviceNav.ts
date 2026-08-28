/**
 * serviceNav — turns the live CMS service pages into the "Our Services" mega-menu
 * structure. Titles and links come straight from the CMS (nothing hardcoded), so
 * adding or renaming a service in the admin flows through automatically. Only the
 * *grouping* and short display labels are curated here — presentation, not content —
 * because the collection has no nav-group field. Employer-sponsored leads, since it
 * is the practice's strategic focus.
 */
import { servicePageHref, type ServiceDoc } from './servicePages.ts';

export interface NavItem {
  label: string;
  href: string;
}
export interface NavColumn {
  heading: string;
  items: NavItem[];
}
export interface ServiceNav {
  featured: {
    tag: string;
    heading: string;
    blurb: string;
    href: string;
    items: NavItem[];
  };
  columns: NavColumn[];
  seeAllHref: string;
}

// Short, breathable labels for known services, keyed by slug. Falls back to the CMS
// title for anything not listed, so new services still appear (just with their full name).
const SHORT_LABELS: Record<string, string> = {
  'subclass-482-skills-in-demand-visa': 'Skills in Demand (482)',
  'subclass-186-employer-nomination-scheme-visa': 'Employer Nomination (186)',
  'subclass-189-skilled-independent-visa': 'Skilled Independent (189)',
  'subclass-190-skilled-nominated-visa': 'Skilled Nominated (190)',
  'subclass-191-permanent-residence-skilled-regional-visa': 'Skilled Regional PR (191)',
  'subclass-491-skilled-work-regional-visa': 'Skilled Work Regional (491)',
  'subclass-485-temporary-graduate-visa': 'Temporary Graduate (485)',
  'partner-visa-onshore-820-801': 'Partner — Onshore (820/801)',
  'partner-visa-offshore-309-100': 'Partner — Offshore (309/100)',
  'subclass-500-student-visa': 'Student (500)',
  'subclass-600-visitor-visa': 'Visitor (600)',
  'skills-assessment': 'Skills Assessment',
  'art-review-applications': 'ART merits review',
};

// Which column a service belongs to, by slug. Order within each list is preserved.
const EMPLOYER = [
  'subclass-482-skills-in-demand-visa',
  'subclass-186-employer-nomination-scheme-visa',
];
const SKILLED = [
  'subclass-189-skilled-independent-visa',
  'subclass-190-skilled-nominated-visa',
  'subclass-491-skilled-work-regional-visa',
  'subclass-191-permanent-residence-skilled-regional-visa',
  'subclass-485-temporary-graduate-visa',
  'skills-assessment',
];
const FAMILY_STUDY = [
  'partner-visa-onshore-820-801',
  'partner-visa-offshore-309-100',
  'subclass-500-student-visa',
  'subclass-600-visitor-visa',
];

const labelOf = (p: ServiceDoc) => SHORT_LABELS[p.slug] || p.title;

/** Order a slug list against the CMS docs, keeping only ones that actually exist. */
function pick(bySlug: Map<string, ServiceDoc>, slugs: string[]): NavItem[] {
  return slugs
    .map((s) => bySlug.get(s))
    .filter((p): p is ServiceDoc => !!p)
    .map((p) => ({ label: labelOf(p), href: servicePageHref(p) }));
}

export function buildServiceNav(docs: ServiceDoc[]): ServiceNav {
  const bySlug = new Map(docs.map((p) => [p.slug, p]));
  const known = new Set([...EMPLOYER, ...SKILLED, ...FAMILY_STUDY]);

  // Anything published but not slotted above (e.g. a brand-new visa) still shows up.
  const leftovers = docs
    .filter((p) => p.section === 'visas' && !known.has(p.slug))
    .map((p) => ({ label: labelOf(p), href: servicePageHref(p) }));

  const skilled = pick(bySlug, SKILLED);
  // "Study in Australia" is a bespoke education page (not a CMS service doc); it sits in
  // the study/partner column, next to the Student (500) pathway, inside Our Services.
  const familyStudy = [
    ...pick(bySlug, FAMILY_STUDY),
    { label: 'Study in Australia', href: '/study-in-australia/' },
    ...leftovers,
  ];
  const employerItems = pick(bySlug, EMPLOYER);

  // Reviews & second opinion — the dedicated pages plus ART merits review.
  const reviews: NavItem[] = [
    { label: 'Second Opinion', href: '/services/second-opinion/' },
    { label: 'Refusal Recovery', href: '/services/refusal-recovery/' },
    ...pick(bySlug, ['art-review-applications']),
  ];

  return {
    featured: {
      tag: 'Our focus',
      heading: 'Employer-sponsored visas',
      blurb: 'Helping Australian businesses bring in the skilled people they need.',
      href: employerItems[0]?.href || '/services/',
      items: employerItems,
    },
    columns: [
      { heading: 'Skilled & graduate', items: skilled },
      { heading: 'Partner, study & visit', items: familyStudy },
      { heading: 'Refusals & review', items: reviews },
    ].filter((c) => c.items.length > 0),
    seeAllHref: '/services/',
  };
}
