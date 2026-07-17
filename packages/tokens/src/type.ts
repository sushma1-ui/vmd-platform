/**
 * Typography tokens. Cormorant Garamond (display/wordmark), Hanken Grotesk
 * (UI/body/data). 17px base — legal-adjacent copy read under stress (Blueprint §11.2).
 * Sizes/line-heights in px; the scale is 1.25 mobile / 1.333 desktop.
 */
export const fontFamilies = {
  display: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  body: "'Hanken Grotesk', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
} as const;

type Step = {
  face: 'display' | 'body';
  weight: number;
  desktop: [number, number];
  mobile: [number, number];
};

export const typeScale = {
  'display-1': { face: 'display', weight: 600, desktop: [64, 68], mobile: [40, 46] },
  'display-2': { face: 'display', weight: 600, desktop: [48, 54], mobile: [32, 38] },
  h2: { face: 'display', weight: 600, desktop: [36, 44], mobile: [27, 34] },
  h3: { face: 'display', weight: 600, desktop: [27, 36], mobile: [22, 30] },
  h4: { face: 'body', weight: 500, desktop: [20, 28], mobile: [19, 26] },
  'body-lg': { face: 'body', weight: 400, desktop: [20, 32], mobile: [19, 30] },
  body: { face: 'body', weight: 400, desktop: [17, 29], mobile: [17, 28] },
  'body-sm': { face: 'body', weight: 400, desktop: [15, 24], mobile: [15, 24] },
  caption: { face: 'body', weight: 500, desktop: [13, 20], mobile: [13, 20] },
  data: { face: 'body', weight: 400, desktop: [17, 26], mobile: [17, 26] },
} as const satisfies Record<string, Step>;

export type TypeToken = keyof typeof typeScale;
export const measure = { prose: '68ch', min: '62ch', max: '72ch' } as const;
