import { test, expect } from '@playwright/test';

const read = (page, name) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('jetons jour', async ({ page }) => {
  await page.goto('/');
  expect(await read(page, '--acc')).toBe('#2f7cf6');
  expect(await read(page, '--ink')).toBe('#161618');
  expect(await read(page, '--bg')).toBe('#ffffff');
});

test('jetons nuit via .dark et via data-bi-theme', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  expect(await read(page, '--acc')).toBe('#6f97ff');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.biTheme = 'dark';
  });
  expect(await read(page, '--acc')).toBe('#6f97ff');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.biTheme = 'light';
  });
  expect(await read(page, '--acc')).toBe('#2f7cf6');
});

test('polices chargées', async ({ page }) => {
  await page.goto('/');
  const fam = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--font-serif'));
  expect(fam).toMatch(/DM[ _]Serif[ _]Display/);
});
