import { test, expect } from '@playwright/test';

test('photo de profil servie et utilisée', async ({ page }) => {
  const res = await page.request.get('/profile.jpg');
  expect(res.ok()).toBe(true);
  await page.goto('/');
  const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => e.currentSrc || e.src));
  expect(srcs.some((s) => s.includes('profile.jpg'))).toBe(true);
  expect(srcs.some((s) => s.includes('avatar.png'))).toBe(false);
});

test('nav : aucun lien actif une fois revenu en haut', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 1800));
  await expect(page.locator('header a.is-active')).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('header a.is-active')).toHaveCount(0);
});
