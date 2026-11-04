import { test, expect } from '@playwright/test';

test('compétences : 5 groupes, logos, niveaux, inversion en nuit', async ({ page }) => {
  await page.goto('/#competences');
  const sec = page.locator('[data-intro="competences"]');
  await expect(sec.locator('[data-intro="grp"]')).toHaveCount(5);
  await expect(sec.locator('[data-intro="tile"] svg')).toHaveCount(24);
  await expect(sec.locator('[data-intro="tile"] .lv', { hasText: 'quotidien' })).toHaveCount(6);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const f = await sec.locator('[data-intro="tile"]', { hasText: 'Next.js' }).locator('svg').evaluate((e) => getComputedStyle(e).filter);
  expect(f).toContain('invert(1)');
});
