import type { GlobalConfig } from 'payload';
import { anyone, isAdmin } from '../access/index.ts';

/**
 * Disclaimers — editable compliance strings. Defaults mirror @vmd/config DISCLAIMERS;
 * kept here so wording can be updated without a deploy, but is legible everywhere.
 */
export const Disclaimers: GlobalConfig = {
  slug: 'disclaimers',
  access: { read: anyone, update: isAdmin },
  fields: [
    { name: 'outcomes', type: 'textarea' },
    { name: 'generalInformation', type: 'textarea' },
  ],
};
