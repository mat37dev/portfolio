import { test, expect } from '@playwright/test';

test('mouvement réduit : tout est visible immédiatement', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/');
  for (const sel of ['[data-intro="h1"]', '[data-intro="lead"]', '[data-intro="card-photo"]', '[data-intro="competences-h2"]']) {
    const op = await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity);
    expect(Number(op), sel).toBe(1);
  }
  await ctx.close();
});

test('révélation au défilement', async ({ page }) => {
  await page.goto('/');
  const h2 = page.locator('[data-intro="parcours-h2"]');
  expect(Number(await h2.evaluate((e) => getComputedStyle(e.closest('.rv')).opacity))).toBeLessThan(1);
  await h2.scrollIntoViewIfNeeded();
  await expect.poll(() => h2.evaluate((e) => getComputedStyle(e.closest('.rv')).opacity)).toBe('1');
});
