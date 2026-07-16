/** Exactly four. If a fifth is needed, the layout is wrong (Blueprint §11.4). */
export const shadow = {
  none: 'none',
  subtle: '0 1px 2px 0 rgb(14 26 48 / 0.06)',
  raised: '0 4px 12px -2px rgb(14 26 48 / 0.10)',
  overlay: '0 12px 32px -8px rgb(14 26 48 / 0.18)',
} as const;
export type ShadowToken = keyof typeof shadow;
