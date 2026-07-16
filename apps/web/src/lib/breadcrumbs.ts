/** Derive a breadcrumb trail from a pathname. One implementation, used everywhere. */
const LABELS: Record<string, string> = {
  'visa-services': 'Visa Services',
  'your-situation': 'Your Situation',
  'general-skilled-migration': 'General Skilled Migration',
  'employer-sponsored': 'Employer Sponsored',
  'skills-assessments': 'Skills Assessments',
  'family-partner': 'Family & Partner',
  'student-visas': 'Student Visas',
  'temporary-work': 'Temporary Work',
  'visitor-visas': 'Visitor Visas',
  'refusals-and-appeals': 'Refusals & Appeals',
  'sunil-uprety': 'Sunil Uprety, RMA',
  'grant-ledger': 'Grant Ledger',
  'case-studies': 'Case Studies',
  'processing-times': 'Processing Times',
  'moving-to-perth': 'Moving to Perth',
  'migration-agent-perth': 'Migration Agent Perth',
  'migration-agent-wa': 'Migration Agent WA',
};
const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function pathnameToTrail(pathname: string) {
  const segs = pathname.split('/').filter(Boolean);
  const trail = [{ name: 'Home', path: '/' }];
  let acc = '';
  for (const seg of segs) {
    acc += `/${seg}`;
    trail.push({ name: LABELS[seg] ?? titleCase(seg), path: `${acc}/` });
  }
  return trail;
}
