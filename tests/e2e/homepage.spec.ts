import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
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

  test('should collapse navigation behind a menu toggle on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /toggle menu/i });
    const navLinks = page.locator('#nav-links');
    const collapsedHeight = () => navLinks.evaluate((el) => (el as HTMLElement).offsetHeight);

    // Menu starts collapsed: toggle visible, link drawer clipped to nothing.
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(await collapsedHeight()).toBeLessThan(10);

    await toggle.click();

    // Menu open: drawer expands and reports its state to assistive tech.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(collapsedHeight).toBeGreaterThan(100);
    await expect(navLinks.getByRole('link', { name: /about/i })).toBeVisible();
  });
});
