import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

// Hybrid: pages are static by default; routes with `export const prerender = false`
// (the API endpoints, client area) run as Vercel serverless functions in Sydney.
export default defineConfig({
  site: 'https://migrationdoctors.com.au',
  output: 'hybrid',
  adapter: vercel({ isr: { expiration: 60 * 60 }, webAnalytics: { enabled: false } }),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) =>
        !page.includes('/client/') && !page.includes('/thank-you/') && !page.includes('/lp/'),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
