/**
 * Seed. Public visa taxonomy for ALL services, plus a fully populated example —
 * "Employer Sponsored Visas" — to validate the hub + subclass architecture end to
 * end. All populated copy is general, public-knowledge migration information.
 * NOT seeded (require verification/consent, §19): government/professional fees,
 * grant outcomes, testimonials, reviews.
 *
 * Run: `pnpm --filter @vmd/cms seed` (needs DATABASE_URL).
 */
import './load-env.ts'; // MUST be first: loads root .env before payload.config is evaluated
import { getPayload } from 'payload';
import config from '../payload.config.ts';

const rt = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
      },
    ],
  },
});

const services = [
  { slug: 'general-skilled-migration', title: 'General Skilled Migration' },
  { slug: 'employer-sponsored', title: 'Employer Sponsored Visas' },
  { slug: 'skills-assessments', title: 'Skills Assessments' },
  { slug: 'family-partner', title: 'Family & Partner Visas' },
  { slug: 'student-visas', title: 'Student Visas' },
  { slug: 'temporary-work', title: 'Temporary Work Visas' },
  { slug: 'visitor-visas', title: 'Visitor Visas' },
  { slug: 'refusals-and-appeals', title: 'Refusals, Cancellations & Appeals' },
];
const subclasses = [
  [
    'general-skilled-migration',
    '189',
    'Skilled Independent (Subclass 189)',
    'skilled-independent-189',
    'permanent',
  ],
  [
    'general-skilled-migration',
    '190',
    'Skilled Nominated (Subclass 190)',
    'skilled-nominated-190',
    'permanent',
  ],
  [
    'general-skilled-migration',
    '491',
    'Skilled Work Regional (Subclass 491)',
    'skilled-work-regional-491',
    'provisional',
  ],
  [
    'employer-sponsored',
    '482',
    'Skills in Demand (Subclass 482)',
    'skills-in-demand-482',
    'temporary',
  ],
  [
    'employer-sponsored',
    '186',
    'Employer Nomination Scheme (Subclass 186)',
    'employer-nomination-186',
    'permanent',
  ],
  [
    'employer-sponsored',
    '494',
    'Skilled Employer Sponsored Regional (Subclass 494)',
    'skilled-employer-regional-494',
    'provisional',
  ],
  [
    'family-partner',
    '820/801',
    'Partner (Subclass 820/801)',
    'partner-onshore-820-801',
    'permanent',
  ],
  ['student-visas', '500', 'Student (Subclass 500)', 'student-500', 'temporary'],
  [
    'temporary-work',
    '485',
    'Temporary Graduate (Subclass 485)',
    'temporary-graduate-485',
    'temporary',
  ],
  ['visitor-visas', '600', 'Visitor (Subclass 600)', 'visitor-600', 'temporary'],
];
const situations = [
  ['skilled-professional', "I'm a skilled professional"],
  ['student', "I'm a student"],
  ['partnered-to-australian', "I'm partnered with an Australian Citizen or Permanent Resident"],
  ['employer', "I'm an employer"],
  ['visa-refused', 'My visa was refused'],
  ['bridging-visa', "I'm on a bridging visa"],
];

// --- Employer Sponsored: full hub content (public-knowledge, general) ---
const ES_SERVICE = {
  valueProposition:
    "Bring skilled workers to Australia — or move on an employer's sponsorship. Clear guidance on sponsorship, nomination and the compliance that protects both sides.",
  summary:
    'Guidance for employers and skilled workers on sponsorship requirements, nomination and visa applications.',
  personas: [
    {
      title: "I'm an employer",
      description:
        "You have a role you can't fill locally and want to sponsor a skilled worker, in the city or in regional Australia.",
    },
    {
      title: "I'm a skilled worker",
      description:
        'You have an Australian job offer, or an employer willing to sponsor you, and want to understand the pathway.',
    },
    {
      title: "I'm already sponsored",
      description: 'You hold or held a sponsored visa and want to move toward permanent residence.',
    },
  ],
  whyChoose: {
    benefits: [
      {
        title: 'Access to skilled workers',
        detail: 'Fill genuine skill shortages where local recruitment has not succeeded.',
      },
      {
        title: 'Pathways to permanent residence',
        detail: 'Several employer-sponsored streams lead toward PR over time.',
      },
      {
        title: 'Regional concessions',
        detail: 'Designated regional areas can offer additional options and incentives.',
      },
    ],
    typicalOutcomes:
      'Depending on the stream, outcomes range from temporary skilled work rights through to permanent residence.',
    considerations:
      'Sponsorship carries obligations, and labour market testing and genuine-position requirements apply. Not every role or business qualifies — we tell you honestly before you invest.',
  },
};
const ES_FAQS = [
  {
    q: 'What is the difference between the 482, 186 and 494?',
    a: 'The 482 is a temporary skilled visa; the 186 is a permanent employer-sponsored visa; the 494 is a provisional visa for designated regional areas. Which fits depends on the role, the business and the location.',
  },
  {
    q: 'Does the employer or the worker apply?',
    a: 'Both play a part: the business becomes an approved sponsor and nominates the position, and the worker lodges the visa application. We coordinate both sides.',
  },
  {
    q: 'Is labour market testing required?',
    a: 'For many nominations, yes — evidence that the role was genuinely advertised and could not be filled locally. Requirements change, so we confirm current rules for your case.',
  },
  {
    q: 'Can an employer-sponsored visa lead to permanent residence?',
    a: 'Several streams provide a pathway to permanent residence over time. Eligibility depends on the visa held, the occupation and how long the role is held.',
  },
];
const ES_SUB_CONTENT: Record<string, any> = {
  '482': {
    valueProposition:
      'A temporary visa for skilled workers sponsored by an approved Australian employer to fill a genuine position.',
    plainOneLiner: 'Employer-sponsored temporary skilled work, with a possible pathway to PR.',
    atAGlance: { visaType: 'temporary', onshoreOffshore: 'either' },
    complexity: {
      level: 'moderate',
      note: 'Straightforward with a compliant employer and a clear occupation; more complex where the position or business is borderline.',
    },
    overview: {
      whatItIs: rt(
        'The Skills in Demand (Subclass 482) visa lets an approved employer sponsor a skilled worker to fill a genuine position they cannot fill locally.',
      ),
      whoItIsFor: rt(
        'Skilled workers with an eligible occupation and an approved sponsoring employer.',
      ),
    },
    eligibility: [
      {
        title: 'Core requirements',
        items: [
          {
            requirement: 'Approved sponsor',
            detail: 'The employer is an approved standard business sponsor.',
          },
          {
            requirement: 'Nominated occupation',
            detail: 'The role is on the relevant occupation list.',
          },
          {
            requirement: 'Skills and experience',
            detail: 'You meet the skill and experience requirements for the occupation.',
          },
          { requirement: 'English', detail: 'You meet the English requirement for the stream.' },
        ],
      },
    ],
    benefits: { workRights: true, familyInclusion: true, travelRights: true },
    process: [
      {
        stepTitle: 'Sponsorship',
        description: 'The business becomes an approved sponsor.',
        estimatedDuration: 'varies',
        documents: [{ doc: 'Business registration and financials' }],
      },
      {
        stepTitle: 'Nomination',
        description: 'The employer nominates the position and occupation.',
        estimatedDuration: 'varies',
        documents: [{ doc: 'Position description and labour market testing evidence' }],
      },
      {
        stepTitle: 'Visa application',
        description: 'The worker applies and meets health and character requirements.',
        estimatedDuration: 'varies',
        documents: [{ doc: 'Passport, skills evidence, English results' }],
      },
    ],
    documents: [
      {
        category: 'Identity',
        items: [{ name: 'Passport' }, { name: 'National ID (if applicable)' }],
      },
      {
        category: 'Skills & English',
        items: [{ name: 'Qualifications and references' }, { name: 'English test results' }],
      },
    ],
    commonMistakes: [
      {
        title: 'Weak labour market testing',
        detail: 'Insufficient evidence the role was genuinely advertised locally.',
      },
      { title: 'Occupation mismatch', detail: 'The duties do not match the nominated occupation.' },
    ],
  },
  '186': {
    valueProposition:
      'A permanent employer-sponsored visa for skilled workers nominated by an approved Australian employer.',
    plainOneLiner: 'Permanent residence through employer nomination.',
    atAGlance: { visaType: 'permanent', onshoreOffshore: 'either' },
    complexity: {
      level: 'moderate',
      note: 'General guidance only; each stream has its own requirements.',
    },
    overview: {
      whatItIs: rt(
        'The Employer Nomination Scheme (Subclass 186) is a permanent visa for skilled workers nominated by an approved employer.',
      ),
    },
    benefits: {
      permanentResidency: true,
      familyInclusion: true,
      workRights: true,
      studyRights: true,
      medicare: true,
      travelRights: true,
    },
    eligibility: [
      {
        title: 'Core requirements',
        items: [
          {
            requirement: 'Employer nomination',
            detail: 'An approved employer nominates the position.',
          },
          {
            requirement: 'Skills and experience',
            detail: 'You meet the requirements for the occupation and stream.',
          },
        ],
      },
    ],
  },
  '494': {
    valueProposition:
      'A provisional visa for skilled workers sponsored by an employer in designated regional Australia.',
    plainOneLiner: 'Regional employer sponsorship, with a pathway to PR.',
    atAGlance: { visaType: 'provisional', onshoreOffshore: 'either' },
    complexity: {
      level: 'complex',
      note: 'Regional requirements add moving parts; we map them before you commit.',
    },
    overview: {
      whatItIs: rt(
        'The Skilled Employer Sponsored Regional (Subclass 494) visa supports skilled workers sponsored by employers in designated regional areas.',
      ),
    },
    benefits: { workRights: true, familyInclusion: true, travelRights: true },
  },
};

async function upsert(
  payload: any,
  collection: string,
  slugField: string,
  slug: string,
  data: Record<string, unknown>,
) {
  const found = await payload.find({
    collection,
    where: { [slugField]: { equals: slug } },
    limit: 1,
  });
  if (found.docs.length)
    return payload.update({ collection, id: found.docs[0].id, data, overrideAccess: true });
  return payload.create({ collection, data: { ...data, [slugField]: slug }, overrideAccess: true });
}

export async function seed() {
  const payload = await getPayload({ config });
  const svc: Record<string, number> = {};
  for (const s of services) {
    const extra = s.slug === 'employer-sponsored' ? ES_SERVICE : {};
    const doc = await upsert(payload, 'services', 'slug', s.slug, {
      title: s.title,
      status: 'published',
      ...extra,
    });
    svc[s.slug] = doc.id;
  }
  const subIds: Record<string, number> = {};
  for (const [service, code, name, slug, visaType] of subclasses) {
    const extra = ES_SUB_CONTENT[code as string] ?? {};
    const base: any = { code, name, status: 'published', service: svc[service as string] };
    if (!extra.atAGlance) base.atAGlance = { visaType };
    const doc = await upsert(payload, 'subclasses', 'slug', slug as string, { ...base, ...extra });
    subIds[code as string] = doc.id;
  }
  // Each situation links to the Service it translates into; the [situation] page composes
  // that service's pathways + FAQs (no duplicated content). bridging-visa has no single
  // destination service, so it stays unlinked and renders its honest empty state.
  const situationDest: Record<string, string> = {
    'skilled-professional': 'general-skilled-migration',
    student: 'student-visas',
    'partnered-to-australian': 'family-partner',
    employer: 'employer-sponsored',
    'visa-refused': 'refusals-and-appeals',
  };
  for (const [key, title] of situations) {
    const destSlug = situationDest[key as string];
    const destinationService = destSlug ? svc[destSlug] : undefined;
    await upsert(payload, 'situations', 'slug', key as string, {
      key,
      title,
      status: 'published',
      ...(destinationService ? { destinationService } : {}),
    });
  }

  // Employer Sponsored FAQs -> relate to the service
  const faqIds: number[] = [];
  for (const f of ES_FAQS) {
    const doc = await upsert(payload, 'faqs', 'question', f.q, {
      question: f.q,
      answer: rt(f.a),
      category: 'employer-sponsored',
      status: 'published',
    });
    faqIds.push(doc.id);
  }
  // journey links to the 482/186 subclasses
  const employerSponsoredId = svc['employer-sponsored'];
  if (!employerSponsoredId) {
    throw new Error("Seed: 'employer-sponsored' service must exist before linking its journey");
  }
  await payload.update({
    collection: 'services',
    id: employerSponsoredId,
    overrideAccess: true,
    data: {
      faqs: faqIds,
      journey: [
        {
          title: 'Confirm eligibility',
          description: 'Check the occupation, the business and the worker against current rules.',
          linkedSubclass: subIds['482'],
        },
        {
          title: 'Sponsorship & nomination',
          description: 'The business becomes an approved sponsor and nominates the position.',
          linkedSubclass: subIds['482'],
        },
        {
          title: 'Toward permanent residence',
          description: 'Where eligible, move from temporary to permanent residence.',
          linkedSubclass: subIds['186'],
        },
      ],
      relatedServices: [svc['skills-assessments'], svc['general-skilled-migration']].filter(
        Boolean,
      ),
    },
  });

  console.log(
    'Seed complete. Employer Sponsored Visas fully populated (public-knowledge content). Fees/outcomes/testimonials/reviews left empty (require verification/consent).',
  );
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
