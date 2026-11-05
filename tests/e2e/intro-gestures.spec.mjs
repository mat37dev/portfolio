import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(90000);
});

test('rotation, interrupteur et déploiement sont joués puis restaurés', async ({ page }) => {
  await page.goto('/?intro=0');
  // Référence prise une fois l'animation d'entrée terminée (classe is-live).
  await expect(page.locator('[data-intro="card-right"]')).toHaveClass(/is-live/, { timeout: 10000 });
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
  // La barre ne reste affichée qu'un peu plus d'une seconde : on relève chacun de
  // ses textes au moment où il apparaît plutôt que d'espérer tomber dessus.
  await page.addInitScript(() => {
    window.__deploy = [];
    new MutationObserver(() => {
      const bar = document.querySelector('.bi-deploy');
      const txt = bar && getComputedStyle(bar).display !== 'none' ? bar.textContent.trim() : null;
      if (txt && window.__deploy[window.__deploy.length - 1] !== txt) window.__deploy.push(txt);
    }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
  });
  await page.goto('/?intro=fast&intro=debug&seed=1');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  const seen = await page.evaluate(() => window.__deploy);
  const build = seen.findIndex((t) => /Build/.test(t));
  expect(build).toBeGreaterThan(-1);
  expect(seen.findIndex((t) => /Déployé/.test(t))).toBeGreaterThan(build);
});

test("neige désactivée : reste éteinte après l'intro", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/?intro=fast&seed=1');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'off');
});
