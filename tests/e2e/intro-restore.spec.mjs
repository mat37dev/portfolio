import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(90000);
});

// Empreinte du DOM utile : header, main, footer, sans les classes d'animation
// (is-visible, is-live, entrance…) qui dépendent du défilement et du temps.
const snapshot = (page) =>
  page.evaluate(() =>
    [document.querySelector('header'), document.querySelector('main'), document.querySelector('footer')]
      .map((e) => e.outerHTML)
      .join('\n')
      .replace(/\s+/g, ' ')
      .replace(/ class="([^"]*)"/g, (m, c) => {
        const kept = c.split(' ').filter((x) => x && !/^is-/.test(x)).sort().join(' ');
        return kept ? ` class="${kept}"` : '';
      })
      .replace(/ style="--px:[^"]*"/g, ''),
  );

test('intro complète : DOM identique', async ({ page }) => {
  await page.goto('/?intro=0');
  const ref = await snapshot(page);
  await page.goto('/?intro=fast&seed=2');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  expect(await snapshot(page)).toBe(ref);
  await expect(page.locator('html')).toHaveClass(/bi-done/);
  await expect(page.locator('html')).not.toHaveClass(/bi-live/);
});

for (const ms of [2000, 6000]) {
  test(`skip à ${ms} ms : DOM identique et bi-skipped`, async ({ page }) => {
    await page.goto('/?intro=0');
    const ref = await snapshot(page);
    await page.goto('/?intro=debug&seed=2');
    await page.waitForTimeout(ms);
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveClass(/bi-skipped/);
    expect(await snapshot(page)).toBe(ref);
    await expect(page.locator('h1')).toHaveText('Développeur fullstack,de Salesforce au mobile.');
    await expect(page.locator('html')).toHaveClass(/entrance/);
  });
}

test('passage sous 860 px : arrêt et restauration', async ({ page }) => {
  await page.goto('/?intro=0');
  const ref = await snapshot(page);
  await page.goto('/?intro=debug&seed=2');
  await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 800, height: 800 });
  await expect(page.locator('.bi-hud')).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 800 });
  expect(await snapshot(page)).toBe(ref);
});
