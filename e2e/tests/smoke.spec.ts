import { test, expect } from '@playwright/test';

test('homepage loads with the hero promise and dual CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('where you stand');
  await expect(page.getByRole('link', { name: /Visa Health Check/i }).first()).toBeVisible();
});

test('Visa Health Check starts and advances', async ({ page }) => {
  await page.goto('/health-check/');
  await page.getByRole('button', { name: /skilled professional/i }).click();
  await expect(page.getByText(/Step 2 of 6/)).toBeVisible();
});

test('Refusals flagship shows the Deadline Checker', async ({ page }) => {
  await page.goto('/visa-services/refusals-and-appeals/');
  await expect(page.getByText(/Deadline checker/i)).toBeVisible();
});
