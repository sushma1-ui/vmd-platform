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
    group: 'Media',
    description:
      'Images used across the website. Upload here, then pick them when editing a page. Accepted formats: JPG, PNG, WebP, AVIF (not HEIC or SVG) — if a photo is HEIC from an iPhone, save/export it as JPG first. Max size 15 MB. Always add descriptive alt text.',
  },
  access: { read: anyone, create: isEditorial, update: isEditorial, delete: isEditorial },
  upload: {
    // Raster formats only. SVG is intentionally excluded — it can carry inline
    // scripts/foreignObject and would be a stored-XSS vector when served inline.
    mimeTypes: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
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
