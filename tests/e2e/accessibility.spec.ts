import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');

    // Count in the page's light DOM only. Playwright's `h1` locator also
    // pierces shadow roots, which would pick up the Astro dev toolbar's
    // own headings when this runs against `npm run dev`.
    const h1Count = await page.evaluate(() => document.querySelectorAll('h1').length);
    expect(h1Count).toBe(1);

    await expect(page.locator('main h1')).toContainText(/Juan Manuel Perafan/i);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Every image needs an alt attribute; "" is valid for decorative images.
      expect(alt).not.toBeNull();
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

    // First Tab lands on the skip link, second on the logo/home link.
    await page.keyboard.press('Tab');
    await expect(page.locator('a.skip-to-content')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('a.logo-container')).toBeFocused();
  });

  test('should have lang attribute on html', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });
});
