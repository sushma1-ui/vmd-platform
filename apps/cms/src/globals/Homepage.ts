import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';
import { seoField, showToggle, headingIntro, linkGroup } from '../fields/index.ts';

/**
 * Homepage — the entire home page, section by section, as tabs.
 *
 * Editing philosophy: a non-technical editor who sees a paragraph on the site
 * should know exactly which tab to open. Each tab is ONE visible section of the
 * homepage, in top-to-bottom page order, and every field defaults to the copy
 * currently on the live site — so opening this global for the first time shows
 * the real words, and the page renders identically until someone changes them.
 *
 * Draft/Publish is on (versions.drafts): edits are saved as drafts and only go
 * live when Published, and editors can Preview before publishing.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    group: 'Website Content',
    description: 'Every section of the home page, top to bottom. Open a tab to edit that section.',
    preview: () => `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/`,
    livePreview: {
      url: () => `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/`,
    },
  },
  versions: { drafts: true },
  access: { read: anyone, update: isEditorial },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // 1 · HERO ------------------------------------------------------------
        {
          label: 'Hero',
          name: 'hero',
          description: 'The first thing visitors see — headline, intro and the two main buttons.',
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
              admin: {
                placeholder:
                  'Registered Migration Agent, Perth (leave blank to use the site default)',
              },
            },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Know exactly where you stand — before you spend a dollar.',
            },
            {
              name: 'lead',
              type: 'textarea',
              defaultValue:
                'Honest, expert guidance on Australian migration from a Registered Migration Agent — for people already in Australia and around the world.',
              admin: { description: 'The paragraph under the headline.' },
            },
            linkGroup('primaryCta', 'Primary button'),
            linkGroup('secondaryCta', 'Secondary button'),
          ],
        },

        // 2 · WHICH OF THESE IS YOU (situations) ------------------------------
        {
          label: 'Your Situation (inactive)',
          name: 'situations',
          description:
            'NOT CURRENTLY SHOWN on the homepage. The hero assessment now captures these same situations as its first step, so this section was retired. Kept here only to preserve saved content.',
          fields: [
            showToggle(),
            ...headingIntro({
              heading: 'Which of these is you?',
              intro:
                "People don't think in subclass numbers. Start where you are — we'll translate.",
            }),
            {
              name: 'items',
              type: 'array',
              labels: { singular: 'Situation card', plural: 'Situation cards' },
              admin: { description: 'Each card links a visitor to their situation hub.' },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: { placeholder: "I'm a skilled professional" },
                },
                { name: 'description', type: 'textarea', required: true },
                {
                  name: 'href',
                  type: 'text',
                  label: 'Link',
                  admin: { placeholder: '/your-situation/…/' },
                },
              ],
            },
          ],
        },

        // 3 · WHY CHOOSE US (the diagnosis promise) ---------------------------
        {
          label: 'Why Choose Us',
          name: 'whyChoose',
          description:
            'The "diagnosis promise" — the honesty commitments that set the practice apart.',
          fields: [
            showToggle(),
            ...headingIntro({
              heading: 'The diagnosis promise',
              intro: 'The commitments that set us apart are the ones we are glad to be held to.',
            }),
            {
              name: 'promises',
              type: 'array',
              labels: { singular: 'Promise', plural: 'Promises' },
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
          ],
        },

        // 4 · SUCCESS STORIES -------------------------------------------------
        {
          label: 'Client Testimonials',
          name: 'successStories',
          description:
            'The navy "client testimonials" band. The testimonials themselves live in the Client Results collection. Keep to what clients say about working with us — not case outcomes or success rates.',
          fields: [
            showToggle(),
            { name: 'eyebrow', type: 'text', defaultValue: 'In their words' },
            ...headingIntro({
              heading: 'Client testimonials',
              intro:
                "What it's like to work with us, in our clients' own words — every testimonial shared with their permission.",
            }),
            linkGroup('link', 'Link to all testimonials'),
          ],
        },

        // 5 · FEATURED SERVICES ----------------------------------------------
        {
          label: 'Featured Services',
          name: 'featuredServices',
          description:
            'Heading and links for the featured-services grid. The cards come from Service Pages flagged "Featured".',
          fields: [
            showToggle(),
            ...headingIntro({
              heading: 'Featured services',
              intro:
                'Find yourself in one scan. Every service is a real problem we help you solve.',
            }),
            linkGroup('seeAll', '“See all services” link'),
            linkGroup('secondaryLink', 'Secondary link (e.g. ART appeals)'),
          ],
        },

        // 6 · HOW WE WORK -----------------------------------------------------
        {
          label: 'How We Work',
          name: 'howWeWork',
          description:
            'The client-journey timeline. Each step shows as a numbered stop on a connected path — the step number is added automatically, so just name the stage.',
          fields: [
            showToggle(),
            ...headingIntro({ heading: 'How we work' }),
            {
              name: 'steps',
              type: 'array',
              labels: { singular: 'Step', plural: 'Steps' },
              admin: { description: 'Drag to reorder. The number (1, 2, 3…) is added for you.' },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'Diagnosis' },
                },
                { name: 'description', type: 'textarea', required: true },
              ],
            },
          ],
        },

        // 7 · MEET THE AGENT (trust & credentials) ----------------------------
        {
          label: 'Trust & Credentials',
          name: 'practitioner',
          description:
            'The "meet the agent" section. The RMA name + MARN line comes from Global Settings and is single-sourced — it is not edited here.',
          fields: [
            showToggle(),
            { name: 'eyebrow', type: 'text', defaultValue: 'The practitioner' },
            {
              name: 'heading',
              type: 'text',
              defaultValue: "You'll speak to Sunil Uprety.",
            },
            {
              name: 'body',
              type: 'array',
              labels: { singular: 'Paragraph', plural: 'Paragraphs' },
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
            linkGroup('button', 'Button'),
          ],
        },

        // 8 · GOOGLE REVIEWS (live) ------------------------------------------
        {
          label: 'Google Reviews',
          name: 'googleReviews',
          description:
            'Live Google Business Profile reviews. You control whether the section shows, its heading, its intro and how many reviews appear — the reviews themselves are always pulled live from Google and cannot be edited here.',
          fields: [
            showToggle(),
            ...headingIntro({
              heading: 'Google Reviews',
              intro:
                'Placed here, after the evidence and the person, reviews read as corroboration — not advertising.',
            }),
            {
              name: 'count',
              type: 'number',
              label: 'Number of reviews to show',
              defaultValue: 3,
              min: 1,
              max: 5,
              admin: { description: 'Google exposes up to 5 of the latest reviews.' },
            },
          ],
        },

        // 9 · FEATURED BLOGS --------------------------------------------------
        {
          label: 'Featured Blogs',
          name: 'featuredBlogs',
          description:
            'Heading and link for the "from our blog" strip. The articles come from the Blog collection.',
          fields: [
            showToggle(),
            ...headingIntro({
              heading: 'From our blog',
              intro:
                'Migration law changes constantly. Every piece is authored by a Registered Migration Agent.',
            }),
            linkGroup('link', '“Read the blog” link'),
          ],
        },

        // 10 · FAQs (optional — off by default) -------------------------------
        {
          label: 'FAQs',
          name: 'faqs',
          description:
            'An optional frequently-asked-questions section. Turn it on and add questions to show it on the homepage.',
          fields: [
            showToggle(false),
            ...headingIntro({ heading: 'Frequently asked questions' }),
            {
              name: 'items',
              type: 'array',
              labels: { singular: 'Question', plural: 'Questions' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },

        // 11 · FINAL CTA ------------------------------------------------------
        {
          label: 'Final CTA',
          name: 'finalCta',
          description: 'The closing call-to-action band at the bottom of the page.',
          fields: [
            showToggle(),
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Ready to get clear on your options?',
            },
            {
              name: 'lead',
              type: 'textarea',
              defaultValue:
                'Book a consultation for a straight, honest read on your case — with a Registered Migration Agent, and a fixed fee quoted before you commit.',
            },
            {
              name: 'buttonLabel',
              type: 'text',
              defaultValue: 'Book a consultation',
            },
            {
              name: 'promise',
              type: 'text',
              admin: {
                description:
                  'Not shown on the homepage anymore (the closing band links to the free assessment instead).',
              },
            },
          ],
        },

        // 12 · SEO ------------------------------------------------------------
        {
          label: 'SEO',
          description: 'How the homepage appears in Google and when shared on social.',
          fields: [seoField],
        },
      ],
    },
  ],
};
