import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

const dir = path.dirname(fileURLToPath(import.meta.url));

// On-demand ISR: /api/revalidate re-requests a path with this token to make Vercel
// regenerate it after a CMS edit. Vercel requires the token to be >= 32 chars; if
// REVALIDATE_SECRET is unset or too short we simply omit it (content still refreshes
// on the 1-hour timer) rather than fail the build.
const revalidateToken = process.env.REVALIDATE_SECRET;
const isr =
  revalidateToken && revalidateToken.length >= 32
    ? { expiration: 60 * 60, bypassToken: revalidateToken }
    : { expiration: 60 * 60 };

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
  // Client Portal friendly URL -> the portal (middleware routes to login if needed).
  redirects: {
    '/book': { status: 301, destination: '/book-consultation' },
    '/client-portal': { status: 302, destination: '/client/' },
    '/results/grant-ledger': { status: 301, destination: '/results/success-stories' },
  },
  adapter: vercel({ isr, webAnalytics: { enabled: false } }),
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
