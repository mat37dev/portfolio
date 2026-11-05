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

// Angle de la carte photo et état de son image quand le curseur copine apparaît.
const atCopineEntry = (page) =>
  page
    .waitForFunction(
      () => {
        if (!document.querySelector('.bi-cur[data-name="copine"]')) return null;
        const card = document.querySelector('[data-intro="card-photo"]');
        return {
          angle: parseFloat(card.style.getPropertyValue('--r')) || 0,
          noimg: (card.querySelector('img').getAttribute('data-bi') || '').includes('noimg'),
        };
      },
      null,
      { timeout: 60000 },
    )
    .then((h) => h.jsonValue());

test('copine version a : elle apporte la photo, la pose de travers, l’équipe la redresse', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=copine-a');
  expect(await atCopineEntry(page)).toEqual({ angle: 0, noimg: true });
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  const ev = await page.evaluate(() => window.__intro.events);
  expect(ev).toContain('egg:copine');
  const pose = ev.indexOf('copine:a:pose');
  const fix = ev.indexOf('task:rotate:card-photo');
  expect(pose).toBeGreaterThan(-1);
  expect(fix).toBeGreaterThan(pose);
  await expect(page.locator('.bi-cur[data-name="copine"]')).toHaveCount(0);
});

test('copine version b : la photo arrive de travers, copine la remet droite', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=copine-b');
  const entry = await atCopineEntry(page);
  expect(entry.noimg).toBe(false);
  expect(Math.abs(entry.angle)).toBeGreaterThan(5);
  await page.waitForFunction(
    () => window.__intro.events.includes('copine:b:droite'),
    null,
    { timeout: 60000 },
  );
  expect(await page.evaluate(() => parseFloat(document.querySelector('[data-intro="card-photo"]').style.getPropertyValue('--r')) || 0)).toBe(0);
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  expect(await page.evaluate(() => window.__intro.events)).toContain('egg:copine');
});

for (const v of ['a', 'b']) {
  test(`copine version ${v} : la carte photo est entièrement à l'écran pendant la scène`, async ({ page }) => {
    await page.goto(`/?intro=debug&seed=4&egg=copine-${v}`);
    const card = () => {
      const c = document.querySelector('[data-intro="card-photo"]').getBoundingClientRect();
      return { top: c.top, bottom: c.bottom, vh: innerHeight };
    };
    const entry = await (
      await page.waitForFunction((f) => (document.querySelector('.bi-cur[data-name="copine"]') ? eval(f)() : null), card.toString(), { timeout: 60000, polling: 'raf' })
    ).jsonValue();
    const peak = await (
      await page.waitForFunction(
        (f) => ([...document.querySelectorAll('.bi-cur[data-name="copine"] .bi-msg')].some((m) => m.textContent === '😍' && m.closest('.bi-talk')) ? eval(f)() : null),
        card.toString(),
        { timeout: 60000, polling: 'raf' },
      )
    ).jsonValue();
    for (const r of [entry, peak]) {
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.bottom).toBeLessThanOrEqual(r.vh);
    }
  });
}

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
