/**
 * Tailwind preset — maps ONLY token values into Tailwind's theme. There are no
 * arbitrary brand colours available, so a developer physically cannot produce an
 * off-brand utility class. Consumed by apps/web/tailwind.config.ts.
 */
import { palette, colorTokens } from './color.ts';
import { space } from './space.ts';
import { radius } from './radius.ts';
import { shadow } from './shadow.ts';
import { fontFamilies } from './type.ts';
import { breakpoints } from './breakpoints.ts';

const colors = Object.fromEntries(
  Object.entries(colorTokens).map(([name]) => [name, `var(--${name})`]),
);

const spacing = Object.fromEntries(Object.entries(space).map(([k, v]) => [k, `${v}px`]));
const screens = Object.fromEntries(
  Object.entries(breakpoints).map(([k, v]) => [k, `${v}px`]),
);

export const vmdPreset = {
  theme: {
    // Deliberately REPLACE (not extend) Tailwind's default palette: only brand
    // tokens exist. `palette` raw values are exposed for the rare inline SVG need.
    colors: { ...colors, transparent: 'transparent', current: 'currentColor', _raw: palette },
    spacing,
    borderRadius: {
      none: '0px',
      control: radius.control,
      card: radius.card,
      chip: radius.chip,
    },
    boxShadow: shadow,
    screens,
    fontFamily: {
      display: fontFamilies.display.split(',').map((s) => s.trim()),
      body: fontFamilies.body.split(',').map((s) => s.trim()),
    },
    extend: {},
  },
} as const;

export default vmdPreset;
