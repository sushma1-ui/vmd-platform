import type { Field } from 'payload';

/**
 * Shared field helpers for the "page = tabs of sections" editing model.
 *
 * These keep every editable section consistent across Globals so a non-technical
 * editor always sees the same shape: a "Show this section" switch, a heading, and
 * an intro line — in the same order, with the same descriptions, everywhere.
 */

/** A "Show this section" toggle — hide a whole section without a developer. */
export const showToggle = (defaultValue = true): Field => ({
  name: 'show',
  type: 'checkbox',
  defaultValue,
  admin: {
    description: 'Show this section on the live page. Uncheck to hide it entirely.',
  },
});

/** Heading + intro pair with per-use defaults and helpful placeholders. */
export const headingIntro = (
  opts: {
    heading?: string;
    intro?: string;
    headingLabel?: string;
    introLabel?: string;
  } = {},
): Field[] => [
  {
    name: 'heading',
    type: 'text',
    label: opts.headingLabel ?? 'Heading',
    defaultValue: opts.heading,
    admin: { placeholder: 'The heading shown above this section' },
  },
  {
    name: 'intro',
    type: 'textarea',
    label: opts.introLabel ?? 'Intro text',
    defaultValue: opts.intro,
    admin: { placeholder: 'A short sentence shown under the heading' },
  },
];

/** A labelled call-to-action button (label + destination). */
export const linkGroup = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  admin: { description: 'Button text and where it links to.' },
  fields: [
    { name: 'label', type: 'text', admin: { placeholder: 'e.g. Book a consultation' } },
    {
      name: 'href',
      type: 'text',
      label: 'Link',
      admin: { placeholder: 'e.g. /book-consultation/ or https://…' },
    },
  ],
});
