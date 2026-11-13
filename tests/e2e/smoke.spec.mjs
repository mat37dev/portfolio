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
