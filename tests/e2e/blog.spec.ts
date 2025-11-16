import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should display blog listing page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog.*juanalytics/i);
    await expect(page.getByRole('heading', { name: /^Blog$/i })).toBeVisible();
  });

  test('should show blog posts', async ({ page }) => {
    await page.goto('/blog');
    const posts = page.locator('.blog-card');
    await expect(posts.first()).toBeVisible();
  });

  test('should navigate to blog post', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page.locator('.blog-card').first();
    await firstPost.click();

    // Should be on a blog post page
    await expect(page.locator('.blog-post-content')).toBeVisible();
  });

  test('should display reading time', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText(/min read/i)).toBeVisible();
  });

  test('should have back to blog link on post page', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('.blog-card').first().click();
    await expect(page.getByRole('link', { name: /back to blog/i })).toBeVisible();
  });
});
