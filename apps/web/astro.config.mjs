import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

const dir = path.dirname(fileURLToPath(import.meta.url));

// Hybrid: pages are static by default; routes with `export const prerender = false`
// (the API endpoints, client area) run as Vercel serverless functions in Sydney.
export default defineConfig({
  site: 'https://migrationdoctors.com.au',
  output: 'hybrid',
  /* This repo keeps ONE .env at the monorepo root (README + .env.example). Vite
     would otherwise only read apps/web/.env, leaving the API routes without
     PAYLOAD_API_KEY / POSTMARK / TURNSTILE etc. Hosted envs (Vercel) still win. */
  vite: { envDir: path.resolve(dir, '../..') },
  // Legacy booking URL -> the central consultation page (301).
  redirects: {
    '/book': { status: 301, destination: '/book-consultation' },
  },
  adapter: vercel({ isr: { expiration: 60 * 60 }, webAnalytics: { enabled: false } }),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // Keep non-indexable and gated routes out of the sitemap so it never lists a
      // page that robots.txt disallows or that sets noindex (search, styleguide,
      // portal, thank-you, landing pages).
      filter: (page) =>
        !page.includes('/client/') &&
        !page.includes('/thank-you/') &&
        !page.includes('/lp/') &&
        !page.includes('/search') &&
        !page.includes('/styleguide') &&
        !page.includes('/visa-services'),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
