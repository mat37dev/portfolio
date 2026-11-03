import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(120000);
});

test('copine : curseur rose, petit, libellé exact', async ({ page }) => {
  await page.goto('/?intro=debug&seed=4&egg=copine');
  // La scène dure quelques secondes : on relève tout d'un coup dès que le curseur est là.
  const handle = await page.waitForFunction(
    () => {
      const cur = document.querySelector('.bi-cur[data-name="copine"]');
      if (!cur) return null;
      const tag = cur.querySelector('.bi-tag');
      return {
        shown: cur.classList.contains('bi-show'),
        label: tag.textContent,
        bg: getComputedStyle(tag).backgroundColor,
        scale: getComputedStyle(cur).getPropertyValue('--scale').trim(),
      };
    },
    null,
    { timeout: 60000 },
  );
  const props = await handle.jsonValue();
  expect(props).toEqual({ shown: true, label: 'copine', bg: 'rgb(255, 92, 138)', scale: '0.85' });
  await page.waitForFunction(() => [...document.querySelectorAll('.bi-msg')].some((m) => m.textContent === '😍' && m.closest('.bi-talk')), null, { timeout: 30000 });
  expect(await page.evaluate(() => window.__intro.events)).toContain('egg:copine');
});

test('thème par erreur : bascule puis retour, sans toucher localStorage', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=theme');
  await page.waitForFunction(() => document.documentElement.dataset.biTheme === 'dark', null, { timeout: 60000 });
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  expect(await page.evaluate(() => document.documentElement.dataset.biTheme)).toBeUndefined();
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
  expect(await page.evaluate(() => window.__intro.events)).toContain('egg:theme');
});

test('recruteur : aucun téléchargement déclenché', async ({ page }) => {
  let downloads = 0;
  page.on('download', () => downloads++);
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=recruiter');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  expect(await page.evaluate(() => window.__intro.events)).toContain('egg:recruiter');
  expect(downloads).toBe(0);
});

for (const id of ['prod', 'console']) {
  test(`egg ${id} joué`, async ({ page }) => {
    await page.goto(`/?intro=fast&intro=debug&seed=4&egg=${id}`);
    await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
    expect(await page.evaluate(() => window.__intro.events)).toContain(`egg:${id}`);
    await expect(page.locator('.bi-cur[data-name]')).toHaveCount(0);
  });
}

test('egg=none : aucun curseur supplémentaire', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=none');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  const events = await page.evaluate(() => window.__intro.events);
  expect(events.some((e) => e.startsWith('egg:') && e !== 'egg:none')).toBe(false);
});
