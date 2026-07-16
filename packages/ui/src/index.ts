/**
 * @vmd/ui — public API. Import components from here only (LAW 2).
 * Primitives consume @vmd/tokens; patterns additionally compose identity from
 * @vmd/config. Base styles are shipped at '@vmd/ui/styles/base.css'.
 */
export { default as Button } from './primitives/Button.astro';
export { default as Input } from './primitives/Input.astro';
export { default as Card } from './primitives/Card.astro';
export { default as Chip } from './primitives/Chip.astro';
export { default as Rule } from './primitives/Rule.astro';
export { default as Disclaimer } from './patterns/Disclaimer.astro';
export { default as TrustStrip } from './patterns/TrustStrip.astro';
export { default as AtAGlance } from './patterns/AtAGlance.astro';
