import { test, expect } from '@playwright/test';

test('bannière console au chargement', async ({ page }) => {
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  await page.goto('/?intro=0');
  await expect.poll(() => logs.some((l) => l.includes('Curieux ?'))).toBe(true);
});

test('taper « ski » lance le skieur, pas dans un champ', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/?intro=0');
  await page.locator('[data-intro="contact-form"] input').focus();
  await page.keyboard.type('ski');
  await expect(page.locator('.bi-skier')).toHaveCount(0);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.type('ski');
  await expect(page.locator('.bi-skier')).toBeVisible();
  await expect(page.locator('.bi-skier')).toBeHidden({ timeout: 6000 });
});

test('« ski » tapé trop lentement ne déclenche rien', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/?intro=0');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.type('s');
  await page.waitForTimeout(1700);
  await page.keyboard.type('ki');
  await page.waitForTimeout(300);
  await expect(page.locator('.bi-skier')).toHaveCount(0);
});
