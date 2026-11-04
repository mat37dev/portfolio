import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
});

test("onglet caché : le temps de l'intro ne saute pas au retour", async ({ page }) => {
  await page.goto('/?intro=debug&seed=5');
  await page.waitForTimeout(1500);
  const t0 = await page.evaluate(() => window.__intro.elapsed());
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(200);
  const t1 = await page.evaluate(() => window.__intro.elapsed());
  // Sans pause, l'intro sauterait de ~2 s ; marge pour une machine chargée.
  expect(t1 - t0).toBeLessThan(1);
  // L'intro reprend ensuite normalement.
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => window.__intro.elapsed())).toBeGreaterThan(t1 + 0.5);
});
