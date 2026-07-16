/** Patterns compose primitives: TrustStrip, Disclaimer, AtAGlance (Module 1). */
export const PATTERNS = ['TrustStrip', 'Disclaimer', 'AtAGlance'] as const;
export type Pattern = (typeof PATTERNS)[number];
