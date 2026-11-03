import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(90000);
});

test('rotation, interrupteur et déploiement sont joués puis restaurés', async ({ page }) => {
  await page.goto('/?intro=0');
  const before = await page.locator('[data-intro="card-right"]').evaluate((e) => getComputedStyle(e).transform);
  await page.goto('/?intro=fast&intro=debug&seed=1');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  const events = await page.evaluate(() => window.__intro.events);
  expect(events).toContain('task:rotate:card-right');
  expect(events).toContain('task:toggle:snow-toggle');
  expect(events).toContain('task:paint:sky');
  expect(events).toContain('deployed');
  expect(await page.locator('[data-intro="card-right"]').evaluate((e) => getComputedStyle(e).transform)).toBe(before);
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'on');
  await expect(page.locator('[data-intro="hero"]')).not.toHaveAttribute('data-bi', /.*/);
});

test('la barre de déploiement passe par « Build… » puis « Déployé ✓ »', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=1');
  const bar = page.locator('.bi-deploy');
  await expect(bar).toBeVisible({ timeout: 60000 });
  await expect(bar).toContainText(/Build/);
  await expect(bar).toContainText(/Déployé/, { timeout: 5000 });
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 20000 });
});

test("neige désactivée : reste éteinte après l'intro", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/?intro=fast&seed=1');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'off');
});
