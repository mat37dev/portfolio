import { test, expect } from '@playwright/test';

// Intro mobile : toute la page en ~30 s, trois curseurs ; `?scope=hero` garde
// la mini-intro du hero seul (10–12 s).

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile seulement');
  test.setTimeout(90000);
});

const snapshot = async (page) =>
  (await page.locator('[data-intro="theme-toggle"] svg').waitFor()) ||
  page.evaluate(() =>
    [document.querySelector('header'), document.querySelector('main'), document.querySelector('footer')]
      .map((e) => e.outerHTML)
      .join('\n')
      .replace(/\s+/g, ' ')
      .replace(/ class="([^"]*)"/g, (m, c) => {
        const kept = c.split(' ').filter((x) => x && !/^is-/.test(x)).sort().join(' ');
        return kept ? ` class="${kept}"` : '';
      }),
  );

const HERO = ['sky', 'badge', 'h1', 'lead', 'cta-contact', 'cta-cv', 'cta-projects', 'card-photo', 'tag-1', 'tag-2', 'snow-toggle', null, undefined];

test('mobile : toute la page, trois curseurs, sans règles ni erreurs', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=1&egg=none');
  await expect(page.locator('.bi-hud')).toBeVisible();
  const names = await page.waitForFunction(() => {
    const n = [...document.querySelectorAll('.bi-cur.bi-show')].map((e) => e.dataset.name);
    return n.length >= 3 ? n : null;
  });
  expect((await names.jsonValue()).sort()).toEqual(['Design', 'Mathieu Crosnier', 'Stagiaire']);
  await expect(page.locator('.bi-rulers')).toHaveCount(0);
  await expect(page.locator('.bi-grid')).toHaveCount(0);
  const plan = await page.evaluate(() => window.__intro.plan());
  const intros = plan.map((t) => t.intro);
  for (const s of ['h1', 'card-photo', 'projets-h2', 'parcours-h2', 'competences-h2', 'contact-form', 'footer']) expect(intros).toContain(s);
  expect(plan.filter((t) => ['dupoops', 'fix', 'fix-image', 'shrink', 'comment'].includes(t.kind))).toEqual([]);
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  // Travail partagé : personne ne fait plus de la moitié des tâches.
  const done = (await page.evaluate(() => window.__intro.plan())).filter((t) => t.by);
  const count = {};
  for (const t of done) count[t.by] = (count[t.by] || 0) + 1;
  for (const [who, n] of Object.entries(count)) expect(n / done.length, who).toBeLessThan(0.5);
});

test('scope=hero : hero seulement', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=1&egg=none&scope=hero');
  await expect(page.locator('.bi-hud')).toBeVisible();
  const names = await page.waitForFunction(() => {
    const n = [...document.querySelectorAll('.bi-cur.bi-show')].map((e) => e.dataset.name);
    return n.length >= 3 ? n : null;
  });
  expect((await names.jsonValue()).sort()).toEqual(['Design', 'Mathieu Crosnier', 'Stagiaire']);
  await expect(page.locator('.bi-rulers')).toHaveCount(0);
  await expect(page.locator('.bi-grid')).toHaveCount(0);
  const plan = await page.evaluate(() => window.__intro.plan());
  for (const t of plan) expect(HERO, `${t.kind}:${t.intro}`).toContain(t.intro);
  for (const s of ['h1', 'lead', 'card-photo']) expect(plan.map((t) => t.intro)).toContain(s);
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
});

test('durée en vitesse normale : ~30 s la page, 10 à 12 s le hero seul', async ({ page }) => {
  test.setTimeout(150000);
  await page.goto('/?intro=debug&seed=1&egg=none');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 90000 });
  const total = await page.evaluate(() => window.__intro.timeline.at(-1)[0]);
  expect(total).toBeGreaterThan(20);
  expect(total).toBeLessThan(38);
  await page.goto('/?intro=debug&seed=1&egg=none&scope=hero');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  const hero = await page.evaluate(() => window.__intro.timeline.at(-1)[0]);
  expect(hero).toBeGreaterThan(7);
  expect(hero).toBeLessThan(14);
});

test('intro mobile complète puis touché pour passer : DOM identique', async ({ page }) => {
  await page.goto('/?intro=0');
  const ref = await snapshot(page);
  await page.goto('/?intro=fast&seed=2&egg=none');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  expect(await snapshot(page)).toBe(ref);
  await page.goto('/?intro=debug&seed=2');
  await page.waitForTimeout(1500);
  await page.touchscreen.tap(200, 400);
  await expect(page.locator('html')).toHaveClass(/bi-skipped/);
  expect(await snapshot(page)).toBe(ref);
});

test('easter eggs : seulement copine sur mobile', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=copine,theme,prod');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  const events = await page.evaluate(() => window.__intro.events);
  expect(events).toContain('egg:copine');
  expect(events.filter((e) => e.startsWith('egg:') && e !== 'egg:copine')).toEqual([]);
});
