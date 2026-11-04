import { test, expect } from '@playwright/test';

test('hero : copies, CV, scène', async ({ page }, info) => {
  await page.goto('/');
  const hero = page.locator('[data-intro="hero"]');
  await expect(hero.locator('[data-intro="badge"]')).toHaveText(/Freelance disponible · Nantes/);
  await expect(hero.locator('h1')).toHaveText('Développeur fullstack,de Salesforce au mobile.');
  await expect(hero.locator('[data-intro="cta-cv"]')).toHaveAttribute('download', '');
  await expect(hero.locator('[data-intro="cta-cv"]')).toHaveAttribute('href', '/cv.pdf');
  await expect(hero.locator('[data-intro="checks"]')).toContainText('Freelance sur Malt');
  const desktop = info.project.name === 'desktop';
  await expect(hero.locator('[data-intro="card-left"]')).toBeVisible({ visible: desktop });
  await expect(hero.locator('[data-intro="card-photo"]')).toBeVisible();
  await expect(hero.locator('[data-intro="topo"]')).toBeVisible({ visible: desktop });
});

test('neige : préférence off respectée au chargement', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'off');
  await expect(page.locator('[data-intro="snow-toggle"]')).toHaveAttribute('aria-pressed', 'false');
  const blank = await page.evaluate(() => {
    const c = document.querySelector('[data-intro="snow"]');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    return d.every((v) => v === 0);
  });
  expect(blank).toBe(true);
  await page.locator('[data-intro="snow-toggle"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'on');
});

test('hero : pas de ski dans les textes', async ({ page }) => {
  await page.goto('/');
  const txt = await page.locator('[data-intro="hero"]').innerText();
  expect(txt).not.toMatch(/piste|remontée|altitude|forfait/i);
});
