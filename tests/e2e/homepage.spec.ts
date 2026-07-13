import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/juanalytics/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Juan Manuel Perafan/i })).toBeVisible();
    await expect(page.locator('.hero-eyebrow')).toContainText(/Analytics Engineer/i);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.nav-links');
    await expect(nav.getByRole('link', { name: /conferences/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /videos/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /podcasts/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /blog/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /about/i })).toBeVisible();
  });

  test('should navigate to About page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-links').getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { name: /About Me/i })).toBeVisible();
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Juan Manuel Perafan/i })).toBeVisible();
  });
});
