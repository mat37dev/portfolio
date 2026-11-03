import { test, expect } from '@playwright/test';

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(90000);
});

for (const id of ['wrong-image', 'tilted-card', 'caps', 'wrong-color', 'misaligned', 'title-too-big']) {
  test(`erreur ${id} jouée et restaurée`, async ({ page }) => {
    await page.goto('/?intro=0');
    const h1 = await page.locator('h1').innerText();
    const h2 = await page.locator('[data-intro="parcours-h2"]').innerText();
    await page.goto(`/?intro=fast&intro=debug&seed=3&mistakes=${id}`);
    await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
    expect(await page.evaluate(() => window.__intro.events)).toContain(`mistake:${id}`);
    expect(await page.locator('h1').innerText()).toBe(h1);
    expect(await page.locator('[data-intro="parcours-h2"]').innerText()).toBe(h2);
    await expect(page.locator('[data-intro="cta-contact"]')).not.toHaveAttribute('data-bi', /.*/);
  });
}
