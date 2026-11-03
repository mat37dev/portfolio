import { test, expect } from '@playwright/test';

test('nav : liens, Malt, compactage au scroll', async ({ page }, info) => {
  await page.goto('/');
  const header = page.locator('header[data-intro="nav"]');
  await expect(header.getByRole('link', { name: 'Me contacter' })).toHaveAttribute('href', '#contact');
  if (info.project.name === 'desktop') {
    await expect(header.getByRole('link', { name: 'Compétences' })).toBeVisible();
  } else {
    await expect(header.getByRole('link', { name: 'Compétences' })).toBeHidden();
  }
  await expect(page.locator('footer a[href="https://www.malt.fr/profile/mathieucrosnier"]')).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveClass(/is-scrolled/);
});

test('thème : bascule et persistance sans flash', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /thème sombre/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  const darkAtStart = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(darkAtStart).toBe(true);
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()),
  ).toBe('#6f97ff');
});

test('JSON-LD : Malt dans sameAs', async ({ page }) => {
  await page.goto('/');
  const ld = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(ld).sameAs).toContain('https://www.malt.fr/profile/mathieucrosnier');
});
