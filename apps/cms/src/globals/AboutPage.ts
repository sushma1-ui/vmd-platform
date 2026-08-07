import type { GlobalConfig, Field } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';
import { seoField, headingIntro } from '../fields/index.ts';

/**
 * About page — the "/about" page copy. The single source of truth for the About
 * hub, reconciled to the reviewed-and-approved "Our Story" content so only one
 * About body exists in the CMS. Every field defaults to that live copy, so an
 * editor opening this global sees exactly what the site renders and the public
 * page falls back to the same words if the CMS is ever unreachable.
 *
 * Sections (in page order): Our Story (intro + method), What we believe, the
 * team (people live in Website Content → Team Members), and Why VMD.
 */

/** A term + description pair — the shape of the method, belief and Why-VMD lists. */
const termList = (
  name: string,
  labels: { singular: string; plural: string },
  defaultValue: { term: string; description: string }[],
): Field => ({
  name,
  type: 'array',
  labels,
  defaultValue,
  admin: { description: 'A bold lead-in term and its description. Drag to reorder.' },
  fields: [
    { name: 'term', type: 'text', required: true, admin: { placeholder: 'e.g. Integrity.' } },
    { name: 'description', type: 'textarea', required: true },
  ],
});

const METHOD: { term: string; description: string }[] = [
  {
    term: 'Diagnosis.',
    description:
      'A thorough assessment of your circumstances — history, eligibility, risks — before anything is recommended, lodged or promised.',
  },
  {
    term: 'Pathway.',
    description:
      'A clear written strategy tailored to your situation and goals: your realistic options, with the trade-offs explained in plain language.',
  },
  {
    term: 'Outcome.',
    description:
      'Careful preparation and guidance throughout the application process, with you informed at every stage.',
  },
];

const CORE_VALUE: { term: string; description: string }[] = [
  {
    term: 'Care.',
    description:
      'Every matter is received with attention to the person behind it — including honest advice when the honest answer is to wait.',
  },
  {
    term: 'Clarity.',
    description:
      'Advice in plain language, a written strategy for every engagement, and transparent scope and fees from the outset.',
  },
  {
    term: 'Consistency.',
    description:
      'Documented processes and careful record-keeping, so every matter is handled to the same professional standard.',
  },
];

const BELIEFS: { term: string; description: string }[] = [
  {
    term: 'Integrity.',
    description:
      'Honest advice, even when the honest answer is to wait or to pursue a different pathway.',
  },
  {
    term: 'Professional competence.',
    description:
      'Recommendations grounded in current law, policy and evidence, and tailored to your circumstances.',
  },
  {
    term: 'Client-centred service.',
    description: 'Clear communication, regular updates and support at every stage of the process.',
  },
  {
    term: 'Independence.',
    description:
      'Professional judgement is exercised independently and is not directed by any referral or commercial arrangement.',
  },
];

const WHY_VMD: { term: string; description: string }[] = [
  {
    term: 'Considered attention on every matter.',
    description:
      'As a boutique, appointment-only practice, we take on a limited number of matters so each receives depth of attention. Every matter is assessed on its individual circumstances, and every client receives guidance tailored to their goals.',
  },
  {
    term: 'Direct access to the Registered Migration Agent.',
    description:
      'Your matter is personally assessed by Sunil Uprety, Registered Migration Agent (MARN 2318234). You receive advice directly from the practitioner responsible for your case.',
  },
  {
    term: 'Honest and practical advice.',
    description:
      'Migration decisions carry significant personal and financial consequences. If a pathway is not suitable, we will tell you. If waiting is the better option, we will tell you that too.',
  },
  {
    term: 'A multidisciplinary perspective.',
    description:
      'The practice draws on experience across migration, international education, business, accounting and compliance — a combination that helps identify practical solutions while maintaining a strong focus on legal and regulatory requirements.',
  },
  {
    term: 'Accuracy, compliance and attention to detail.',
    description:
      'Well-prepared applications begin with preparation. Our internal processes centre on document management, compliance, accuracy and deadline monitoring, so every matter is handled with care.',
  },
  {
    term: 'A client-first approach.',
    description:
      "Every migration journey is different. Whether the goal is yours, your family's, your studies or your business, we take the time to understand your objectives and support you throughout the process.",
  },
];

/** The Our Story body paragraphs (the sentences that sit above the method list). */
const STORY_BODY: { text: string }[] = [
  {
    text: 'We work by appointment, deliberately. Every matter receives considered attention. Before any pathway is recommended, we take the time to understand your circumstances in full, and every matter is assessed on its individual merits against current migration law, policy and professional standards.',
  },
  {
    text: "The name is a method, not a metaphor. A good doctor doesn't prescribe before examining, and we don't recommend a visa pathway before understanding your situation. Every engagement follows the same discipline:",
  },
];

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  admin: {
    group: 'Website Content',
    description: 'The copy on the About page (/about).',
    preview: () => `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/about/`,
  },
  versions: { drafts: true },
  access: { read: anyone, update: isEditorial },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Our Story',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'The practice' },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'A migration practice built like a consulting room',
            },
            {
              name: 'lead',
              type: 'textarea',
              admin: { description: 'The standfirst shown under the heading.' },
              defaultValue:
                "Visa & Migration Doctors is a boutique, appointment-only migration practice in Perth, Western Australia, led personally by Sunil Uprety, Registered Migration Agent (MARN 2318234). We assist individuals, couples, families, students, skilled workers and employers to navigate Australia's migration system with clarity.",
            },
            {
              name: 'body',
              type: 'array',
              labels: { singular: 'Paragraph', plural: 'Paragraphs' },
              admin: { description: 'The body paragraphs of the About page.' },
              defaultValue: STORY_BODY,
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
            termList(
              'method',
              { singular: 'Step', plural: 'The method (Diagnosis · Pathway · Outcome)' },
              METHOD,
            ),
            {
              name: 'ctaLabel',
              type: 'text',
              defaultValue: 'Meet Sunil Uprety, RMA',
            },
            {
              name: 'ctaHref',
              type: 'text',
              label: 'CTA link',
              defaultValue: '/about/sunil-uprety/',
            },
          ],
        },
        {
          label: 'Core value',
          fields: [
            termList(
              'coreValue',
              { singular: 'Value', plural: 'Care · Clarity · Consistency' },
              CORE_VALUE,
            ),
          ],
        },
        {
          label: 'What we believe',
          fields: [termList('beliefs', { singular: 'Belief', plural: 'Beliefs' }, BELIEFS)],
        },
        {
          label: 'Team',
          name: 'team',
          description:
            'The heading and intro for the team section. The people themselves are managed in Website Content → Team Members (add, reorder and publish each person there).',
          fields: [
            ...headingIntro({
              heading: 'The people behind your matter',
              intro:
                'When you engage Visa & Migration Doctors, you work directly with the people responsible for preparing and managing your matter.',
            }),
            // Legacy members array — RETAINED (hidden from editors) only so its DB
            // table isn't dropped. On this push-based setup, dropping it at the same
            // time the Team Members collection tables are created makes the schema
            // sync ambiguous (rename vs create) and requires an interactive answer.
            // The website reads team members from the Team Members collection now;
            // this field is unused and can be removed once DB migrations are adopted.
            {
              name: 'members',
              type: 'array',
              admin: { hidden: true },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text' },
                { name: 'credential', type: 'text' },
                { name: 'specialisations', type: 'text' },
                { name: 'bio', type: 'textarea' },
                { name: 'photo', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Why VMD',
          fields: [termList('whyVmd', { singular: 'Reason', plural: 'Reasons' }, WHY_VMD)],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
};
