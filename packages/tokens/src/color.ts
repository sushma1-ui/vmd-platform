/**
 * Colour tokens. Brand values are LOCKED (Website Blueprint §11.1). Semantic
 * roles map onto them so that a developer reaches for --color-action, not a hex.
 *
 * The contrast facts (Blueprint §0.4 / §11.1):
 *   navy  #16294C  14.43:1 on white  ✅ AAA
 *   ink   #0E1A30  17.37:1 on white  ✅ AAA
 *   gold  #C79A52   2.57:1 on white  ❌ FAIL — never carries text on light
 *   azure #2589BA   3.91:1 on white  ⚠️ large-text / UI only — never body text on white
 */
export const palette = {
  navy: '#16294C',
  ink: '#0E1A30',
  gold: '#C79A52',
  azure: '#2589BA',
  bone: '#FAF8F5',
  white: '#FFFFFF',
} as const;

/**
 * Semantic colours extend the brand (the brand doesn't define states).
 * These are DERIVED, not brand-locked, and every `text` role is asserted
 * >= 4.5:1 on white at build time (build.ts).
 */
export const semanticExtension = {
  success: '#146C43',
  caution: '#8A5A00',
  critical: '#B42318',
  // A muted ink for secondary text — asserted AA on white and bone.
  inkMuted: '#3B4A63',
} as const;

/**
 * The role map. This is the API developers consume. `intent` drives the
 * build-time contrast assertions: a token whose intent is `text-on-light`
 * must clear 4.5:1 on white; gold and azure are deliberately NOT text intents.
 */
export const colorTokens = {
  'color-action': { value: palette.navy, intent: 'text-on-light' },
  'color-action-contrast': { value: palette.white, intent: 'text-on-dark' },
  'color-emphasis': { value: palette.gold, intent: 'non-text' },
  'color-emphasis-on-navy': { value: palette.gold, intent: 'text-on-dark' },
  'color-interactive': { value: palette.azure, intent: 'ui-only' },
  'color-text': { value: palette.ink, intent: 'text-on-light' },
  'color-text-muted': { value: semanticExtension.inkMuted, intent: 'text-on-light' },
  'color-text-inverse': { value: palette.white, intent: 'text-on-dark' },
  'color-ground-deep': { value: palette.ink, intent: 'ground' },
  'color-ground-light': { value: palette.white, intent: 'ground' },
  'color-ground-warm': { value: palette.bone, intent: 'ground' },
  'color-success': { value: semanticExtension.success, intent: 'text-on-light' },
  'color-caution': { value: semanticExtension.caution, intent: 'text-on-light' },
  'color-critical': { value: semanticExtension.critical, intent: 'text-on-light' },
} as const;

export type ColorTokenName = keyof typeof colorTokens;
export type ColorIntent = (typeof colorTokens)[ColorTokenName]['intent'];
