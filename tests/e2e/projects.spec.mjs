import { test, expect } from '@playwright/test';

test('projets : phare, six cartes, liens', async ({ page }) => {
  await page.goto('/#projets');
  const sec = page.locator('[data-intro="projets"]');
  await expect(sec.locator('[data-intro="featured"] h3')).toHaveText('SkiMate');
  await expect(sec.locator('[data-intro="card"]')).toHaveCount(6);
  await expect(sec.locator('a[data-intro="card"][href="https://github.com/mat37dev/notre-cuisine"]')).toHaveAttribute('target', '_blank');
  await expect(sec.locator('[data-intro="card"][data-nolink]')).toHaveCount(1);
});

test("filtres : Jeux vidéo puis Tous rend les sept projets dans l'ordre", async ({ page }) => {
  await page.goto('/#projets');
  const grid = page.locator('[data-intro="grid"]');
  const before = await grid.locator('[data-intro="card"] h3').allInnerTexts();
  expect(before.length).toBe(6);
  await page.getByRole('button', { name: 'Jeux vidéo' }).click();
  await expect(grid.locator('[data-intro="card"]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Web' }).click();
  await expect(grid.locator('[data-intro="card"]:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Tous' }).click();
  await expect(grid.locator('[data-intro="card"]:visible')).toHaveCount(6);
  expect(await grid.locator('[data-intro="card"] h3').allInnerTexts()).toEqual(before);
});
