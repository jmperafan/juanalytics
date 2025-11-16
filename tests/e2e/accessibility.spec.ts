import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // H1 should be the name
    await expect(page.locator('h1')).toContainText(/Juan Manuel Perafan/i);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // All images should have alt text
    }
  });

  test('should have proper ARIA labels on buttons', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });

    const menuToggle = page.getByRole('button', { name: /toggle menu/i });
    await expect(menuToggle).toHaveAttribute('aria-label');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation links
    await page.keyboard.press('Tab'); // Logo/home link
    await page.keyboard.press('Tab'); // First nav link

    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should have lang attribute on html', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });
});
