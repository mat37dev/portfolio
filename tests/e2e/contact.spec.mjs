import { test, expect } from '@playwright/test';

test('contact : succès puis erreur réseau', async ({ page }) => {
  await page.route('https://formspree.io/**', (r) => r.fulfill({ status: 200, body: '{"ok":true}' }));
  await page.goto('/#contact');
  await page.locator('[data-intro="contact-form"] input[type="email"]').fill('test@example.com');
  await page.locator('[data-intro="contact-form"] button').click();
  await expect(page.locator('[data-intro="contact-form"] button')).toHaveText(/Merci, à très vite/);
  await page.unroute('https://formspree.io/**');
  await page.route('https://formspree.io/**', (r) => r.abort());
  await page.reload();
  await page.locator('[data-intro="contact-form"] input[type="email"]').fill('test@example.com');
  await page.locator('[data-intro="contact-form"] button').click();
  await expect(page.locator('[data-intro="contact"]')).toContainText('Une erreur est survenue');
  await expect(page.locator('[data-intro="contact-form"] button')).toBeEnabled();
  await expect(page.locator('[data-intro="contact"] a[href^="mailto:"]')).toBeVisible();
});
