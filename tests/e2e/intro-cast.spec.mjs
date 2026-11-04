import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(120000);
});

test('quatre curseurs se partagent le travail jusqu’à la fin', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=1&egg=none');
  const names = await page.waitForFunction(() => {
    const n = [...document.querySelectorAll('.bi-cur.bi-show')].map((e) => e.dataset.name);
    return n.length >= 4 ? n : null;
  });
  expect((await names.jsonValue()).sort()).toEqual(['Design', 'Mathieu Crosnier', 'QA', 'Stagiaire']);

  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 90000 });
  const plan = await page.evaluate(() => window.__intro.plan());
  const done = plan.filter((t) => t.by);
  expect(plan.some((t) => t.kind === 'dupmany')).toBe(true);

  // Aucun curseur ne fait plus de 40 % des tâches.
  const count = {};
  for (const t of done) count[t.by] = (count[t.by] || 0) + 1;
  for (const [who, n] of Object.entries(count)) expect(n / done.length, who).toBeLessThan(0.4);

  // Le dernier tiers du travail n'est pas fait par un seul curseur.
  const tail = done.sort((a, b) => a.at - b.at).slice(-Math.ceil(done.length / 3));
  expect(new Set(tail.map((t) => t.by)).size).toBeGreaterThanOrEqual(3);
});
