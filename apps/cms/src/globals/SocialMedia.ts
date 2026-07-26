import type { GlobalConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';

/** Only accept an empty value or a real http(s) URL — never inject arbitrary text
 *  into an href. Keeps validation strict (security-first) while staying friendly. */
const httpUrl = (val: unknown): true | string => {
  if (!val || typeof val !== 'string' || val.trim() === '') return true;
  try {
    const u = new URL(val.trim());
    return u.protocol === 'http:' || u.protocol === 'https:'
      ? true
      : 'Enter a full URL starting with https://';
  } catch {
    return 'Enter a full URL starting with https://';
  }
};

const profile = (name: string, label: string, placeholder: string) => ({
  name,
  type: 'text' as const,
  label,
  validate: httpUrl,
  admin: { placeholder },
});

/**
 * Social Media — the official profile links, single-sourced for the header and
 * footer icons. Leave a field blank to hide that icon. Falls back to the
 * @vmd/config defaults on the website if the global is empty.
 */
export const SocialMedia: GlobalConfig = {
  slug: 'social-media',
  label: 'Social Media',
  admin: {
    group: 'Site Settings',
    description: 'Links to your social profiles. Blank fields simply hide that icon on the site.',
  },
  access: { read: anyone, update: isEditorial },
  fields: [
    profile('facebook', 'Facebook', 'https://www.facebook.com/…'),
    profile('instagram', 'Instagram', 'https://www.instagram.com/…'),
    profile('linkedin', 'LinkedIn', 'https://www.linkedin.com/company/…'),
    profile('tiktok', 'TikTok', 'https://www.tiktok.com/@…'),
    profile('youtube', 'YouTube', 'https://www.youtube.com/@…'),
  ],
};
