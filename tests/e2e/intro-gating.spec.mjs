import { test, expect } from '@playwright/test';

test("/beta n'existe plus", async ({ page }) => {
  const r = await page.goto('/beta');
  expect(r.status()).toBe(404);
});

test('intro=0 : pas de HUD, page visible', async ({ page }) => {
  await page.goto('/?intro=0');
  await expect(page.locator('.bi-hud')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
});

test('intro=fast : HUD présent, puis rejouer disponible', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  test.setTimeout(90000);
  await page.goto('/?intro=fast&seed=1');
  await expect(page.locator('.bi-hud')).toBeVisible();
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  expect(await page.evaluate(() => sessionStorage.getItem('introSeen'))).toBe('1');
});

test("écran très étroit (< 320 px) : pas d'intro", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 300, height: 640 } });
  const page = await ctx.newPage();
  await page.goto('/?intro=fast');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.bi-hud')).toHaveCount(0);
  await ctx.close();
});
