import { test, expect } from '@playwright/test';

test('le plan couvre toutes les sections et les nouveaux gestes', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/?intro=debug&seed=1');
  await page.waitForFunction(() => window.__intro?.plan().length > 0);
  const plan = await page.evaluate(() => window.__intro.plan());
  const kinds = new Set(plan.map((t) => t.kind));
  for (const k of ['box', 'type', 'title', 'dup', 'image', 'paint', 'line', 'rotate', 'toggle', 'color', 'comment', 'deploy']) {
    expect(kinds, k).toContain(k);
  }
  const intros = new Set(plan.map((t) => t.intro));
  for (const s of ['nav', 'sky', 'ridge-1', 'ridge-2', 'ridge-3', 'h1', 'lead', 'card-photo', 'card-left', 'snow-toggle', 'featured', 'card', 'cell', 'edu', 'tile', 'contact-form', 'footer']) {
    expect(intros, s).toContain(s);
  }
  expect(plan.length).toBeGreaterThan(60);
});

test('neige désactivée : pas de tâche toggle', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/?intro=debug&seed=1');
  await page.waitForFunction(() => window.__intro?.plan().length > 0);
  expect((await page.evaluate(() => window.__intro.plan())).some((t) => t.kind === 'toggle')).toBe(false);
});
