/** 8px grid. 4px permitted at sub-component level only (Blueprint §11.3). */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 16,
  4: 24,
  5: 32,
  6: 48,
  7: 64,
  8: 96,
  9: 128,
  10: 160,
} as const;

export const sectionPadding = { desktop: 96, tablet: 64, mobile: 48, band: 160 } as const;
export const container = { max: 1280, prose: 720, gutter: 24 } as const;
export type SpaceToken = keyof typeof space;
