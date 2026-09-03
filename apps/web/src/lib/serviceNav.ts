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
  'skills-assessment': 'Skill Assessment',
  'art-review-applications': 'ART Merits Review',
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
];
// Student & graduate visas grouped together.
const STUDENT_GRADUATE = ['subclass-500-student-visa', 'subclass-485-temporary-graduate-visa'];
const FAMILY_VISIT = [
  'partner-visa-onshore-820-801',
  'partner-visa-offshore-309-100',
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
  const known = new Set([
    ...EMPLOYER,
    ...SKILLED,
    ...STUDENT_GRADUATE,
    ...FAMILY_VISIT,
    'skills-assessment',
    'initial-consultation',
    'art-review-applications',
  ]);

  // Anything published but not slotted above (e.g. a brand-new visa) still shows up.
  const leftovers = docs
    .filter((p) => p.section === 'visas' && !known.has(p.slug))
    .map((p) => ({ label: labelOf(p), href: servicePageHref(p) }));

  const skilled = [...pick(bySlug, SKILLED), ...leftovers];
  const studentGraduate = pick(bySlug, STUDENT_GRADUATE);
  const familyVisit = pick(bySlug, FAMILY_VISIT);
  const employerItems = pick(bySlug, EMPLOYER);

  // Other services. "Admissions" is the Study in Australia education page (bespoke —
  // not a CMS service doc), labelled simply "Admissions". "ART Merits Review" is the
  // refusal/review wording used throughout the navbar. Second Opinion and Refusal
  // Recovery are the dedicated review pages.
  const otherServices: NavItem[] = [
    { label: 'Admissions', href: '/study-in-australia/' },
    { label: 'Health Insurance', href: '/resources/health-insurance/' },
    ...pick(bySlug, ['skills-assessment']),
    ...pick(bySlug, ['initial-consultation']),
    ...pick(bySlug, ['art-review-applications']),
    { label: 'Second Opinion', href: '/services/second-opinion/' },
    { label: 'Refusal Recovery', href: '/services/refusal-recovery/' },
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
      { heading: 'Skilled', items: skilled },
      { heading: 'Student & Graduate Visa', items: studentGraduate },
      { heading: 'Family & Visit Visa', items: familyVisit },
      { heading: 'Other Services', items: otherServices },
    ].filter((c) => c.items.length > 0),
    seeAllHref: '/services/',
  };
}
