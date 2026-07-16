/**
 * Primitives — Button, Input, Card, Chip, Rule. Framework-light; they consume
 * tokens only. Implemented as Astro components in Module 1 (Design System).
 * This barrel documents the intended public surface so consumers can rely on it.
 */
export const PRIMITIVES = ['Button', 'Input', 'Card', 'Chip', 'Rule'] as const;
export type Primitive = (typeof PRIMITIVES)[number];
