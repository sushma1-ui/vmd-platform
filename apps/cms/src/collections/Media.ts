import type { CollectionConfig } from 'payload';
import { anyone, isEditorial } from '../access/index.ts';

/**
 * Media — Payload upload collection backed by Supabase Storage (S3-compatible).
 * Alt text is required for informative images (Blueprint §16). Responsive sizes
 * generated for the web app's <picture> srcset. Types/sizes restricted (§17.4).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media Library',
    description: 'Images and files used across the website. Always add descriptive alt text.',
  },
  access: { read: anyone, create: isEditorial, update: isEditorial, delete: isEditorial },
  upload: {
    mimeTypes: ['image/webp', 'image/avif', 'image/jpeg', 'image/png', 'image/svg+xml'],
    imageSizes: [
      { name: 'thumb', width: 400 },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image. Use alt="" only for purely decorative media.' },
    },
    { name: 'credit', type: 'text' },
  ],
};
