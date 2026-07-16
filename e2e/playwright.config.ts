import { defineConfig, devices } from '@playwright/test';
// The 12 critical journeys (Blueprint §8) are automated here in the QA module.
// axe-core runs per route (a11y is a build gate, ARCHITECTURE.md §4.3).
export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321' },
  projects: [{ name: 'mobile', use: { ...devices['Pixel 5'] } }],
});
