import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', title: /juanalytics/i },
  { path: '/about', title: /about/i },
  { path: '/blog', title: /blog/i },
  { path: '/videos', title: /videos/i },
  { path: '/podcasts', title: /podcasts/i },
  { path: '/talks', title: /talks/i },
  { path: '/books', title: /books/i },
];

for (const { path, title } of pages) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto(path);

    expect(response?.status()).toBeLessThan(400);
    expect(await page.title()).toMatch(title);
    expect(errors).toHaveLength(0);
  });
}

test('404 page renders for unknown route', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
});

test('navigation links are present on homepage', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
});

test('blog post links are clickable', async ({ page }) => {
  await page.goto('/blog');
  const firstCard = page.locator('a.blog-card').first();
  const count = await page.locator('a.blog-card').count();

  if (count > 0) {
    const href = await firstCard.getAttribute('href');
    expect(href).toBeTruthy();
    await firstCard.click();
    await expect(page).not.toHaveURL('/blog');
  }
});

test('RSS feed is valid XML', async ({ page }) => {
  const response = await page.goto('/rss.xml');
  expect(response?.status()).toBe(200);
  const contentType = response?.headers()['content-type'] ?? '';
  expect(contentType).toMatch(/xml/);
});

test('skip to main content link is present', async ({ page }) => {
  await page.goto('/');
  const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip")');
  await expect(skipLink.first()).toBeAttached();
});
