/**
 * Motion budget — deliberately small (Blueprint §11.4). prefers-reduced-motion
 * disables ALL of it; the site must be fully usable with motion off.
 */
export const duration = { fast: '150ms', base: '250ms', slow: '400ms' } as const;
export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  entrance: 'cubic-bezier(0, 0, 0, 1)',
} as const;
export type DurationToken = keyof typeof duration;
