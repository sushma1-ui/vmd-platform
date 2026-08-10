import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';

/** Navigation — the 6 primary items + CTAs (Blueprint §5.3). Managed, not hardcoded. */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menus & Navigation',
  admin: {
    group: 'Settings',
    description: 'The main menu items shown in the site header.',
  },
  access: { read: anyone, update: isEditorial },
  fields: [
    {
      name: 'primary',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
};
