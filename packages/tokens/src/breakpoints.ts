/** xs is the reference device — design there first (Blueprint §11.7 / §12). */
export const breakpoints = { xs: 390, sm: 768, md: 1024, lg: 1280, xl: 1536 } as const;
export const columns = { xs: 4, sm: 8, md: 12, lg: 12, xl: 12 } as const;
export type Breakpoint = keyof typeof breakpoints;
