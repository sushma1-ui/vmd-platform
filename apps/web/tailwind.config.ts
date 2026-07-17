import type { Config } from 'tailwindcss';
import { vmdPreset } from '@vmd/tokens/tailwind-preset';

// Tailwind sees ONLY brand tokens (via the preset). No arbitrary hex is expressible.
export default {
  presets: [vmdPreset as unknown as Config],
  content: ['./src/**/*.{astro,html,ts,tsx,md,mdx}', '../../packages/ui/src/**/*.{astro,ts,tsx}'],
} satisfies Config;
