import { test, expect } from '@playwright/test';

test('mouvement réduit : tout est visible immédiatement', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/');
  // Le H1 est masqué par la translation de ses lignes, pas par l'opacité.
  expect(await page.locator('[data-intro="h1"] .ln span').first().evaluate((e) => getComputedStyle(e).transform)).toBe('none');
  for (const sel of ['[data-intro="lead"]', '[data-intro="card-photo"]', '[data-intro="tag-1"]']) {
    expect(Number(await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity)), sel).toBe(1);
  }
  // Les blocs révélés au défilement (.rv) et les pilules de compétences, sans défiler.
  for (const sel of ['[data-intro="competences-h2"]', '[data-intro="featured"]', '[data-intro="tile"]']) {
    const op = await page.locator(sel).first().evaluate((e) => getComputedStyle(e.closest('.rv') || e).opacity);
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
