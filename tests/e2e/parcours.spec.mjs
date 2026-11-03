import { test, expect } from '@playwright/test';

test('parcours : 4 cellules, 3 formations, sans Bac', async ({ page }) => {
  await page.goto('/#parcours');
  const sec = page.locator('[data-intro="parcours"]');
  await expect(sec.locator('[data-intro="cell"]')).toHaveCount(4);
  await expect(sec.locator('[data-intro="cell"]').first()).toContainText('Cloudity');
  await expect(sec.locator('[data-intro="cell"] [data-current]')).toHaveCount(1);
  await expect(sec.locator('[data-intro="edu"]')).toHaveCount(3);
  await expect(sec).not.toContainText(/Bac général/);
});
