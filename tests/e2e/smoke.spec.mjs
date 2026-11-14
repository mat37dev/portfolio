import { test, expect } from '@playwright/test';

test("la page d'accueil répond avec un h1", async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test("l'adresse courte /site mène à la page Création de site", async ({ page }) => {
  await page.goto('/site');
  await expect(page).toHaveURL(/\/creation-site-internet-nantes$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('mentions légales : lien du footer, éditeur, hébergeur et confidentialité', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact a[href="/mentions-legales"]')).toBeVisible();
  await page.locator('footer a[href="/mentions-legales"]').click();
  await expect(page).toHaveURL(/\/mentions-legales$/);
  await expect(page.locator('h1')).toHaveText('Mentions légales et confidentialité');
  for (const t of ['Éditeur du site', 'Hébergement', 'Données personnelles', 'Cookies et mesure d’audience'.replace('’', "'")]) {
    await expect(page.locator('main h2', { hasText: t })).toBeVisible();
  }
  await expect(page.locator('main')).toContainText('Vercel Inc.');
  await expect(page.locator('main')).toContainText('Formspree');
});

test('page Création de site : bouton d’appel et note de confidentialité', async ({ page }) => {
  await page.goto('/creation-site-internet-nantes');
  await expect(page.locator('.art-hero a[href="tel:+33784956130"]')).toBeVisible();
  await expect(page.locator('#contact a[href="tel:+33784956130"]')).toBeVisible();
  await expect(page.locator('#contact a[href="/mentions-legales"]')).toBeVisible();
});
