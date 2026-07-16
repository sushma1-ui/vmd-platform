/**
 * @vmd/tokens — public API. The vocabulary the whole platform speaks.
 * Consume these named exports (or the generated CSS custom properties via
 * `@vmd/tokens/tokens.css`). Never hardcode a hex or a px; Stylelint fails the
 * build if you do (ARCHITECTURE.md §4.3).
 */
export { palette, semanticExtension, colorTokens } from './color.ts';
export type { ColorTokenName, ColorIntent } from './color.ts';
export { fontFamilies, typeScale, measure } from './type.ts';
export type { TypeToken } from './type.ts';
export { space, sectionPadding, container } from './space.ts';
export type { SpaceToken } from './space.ts';
export { shadow } from './shadow.ts';
export type { ShadowToken } from './shadow.ts';
export { radius } from './radius.ts';
export type { RadiusToken } from './radius.ts';
export { duration, easing } from './motion.ts';
export type { DurationToken } from './motion.ts';
export { breakpoints, columns } from './breakpoints.ts';
export type { Breakpoint } from './breakpoints.ts';
export { contrastRatio, round2 } from './contrast.ts';
