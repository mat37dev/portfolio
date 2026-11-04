import { test, expect } from '@playwright/test';

// Tests ajoutés après la relecture du chantier B.

const snapshot = (page) =>
  page.evaluate(() =>
    [document.querySelector('header'), document.querySelector('main'), document.querySelector('footer')]
      .map((e) => e.outerHTML)
      .join('\n')
      .replace(/\s+/g, ' ')
      .replace(/ class="([^"]*)"/g, (m, c) => {
        const kept = c.split(' ').filter((x) => x && !/^is-/.test(x)).sort().join(' ');
        return kept ? ` class="${kept}"` : '';
      })
      .replace(/ style="--px:[^"]*"/g, ''),
  );

test('bi-pending posé mais intro non lancée : le hero finit visible', async ({ page }) => {
  await page.addInitScript(() => {
    const mark = () => document.documentElement.classList.add('bi-pending');
    if (document.documentElement) mark();
    else new MutationObserver((_, mo) => { if (document.documentElement) { mark(); mo.disconnect(); } }).observe(document, { childList: true });
  });
  await page.goto('/?intro=0');
  await expect.poll(() => page.locator('[data-intro="lead"]').evaluate((e) => getComputedStyle(e).opacity), { timeout: 8000 }).toBe('1');
  await expect.poll(() => page.locator('[data-intro="card-photo"]').evaluate((e) => getComputedStyle(e).opacity), { timeout: 8000 }).toBe('1');
});

test('mobile : pas de bouton « Rejouer l’intro »', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/');
  await expect(page.locator('.bi-replay')).toBeHidden();
});

test('mouvement réduit : pas de bouton « Rejouer l’intro »', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.bi-replay')).toBeHidden();
  await ctx.close();
});

test.describe('desktop', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
    test.setTimeout(120000);
  });

  test('overlay de l’intro masqué aux lecteurs d’écran', async ({ page }) => {
    await page.goto('/?intro=debug&seed=2');
    await expect(page.locator('.bi-hud')).toBeVisible();
    for (const sel of ['.bi-world', '.bi-grid', '.bi-rulers']) {
      await expect(page.locator(sel)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('skip pendant une frappe : texte complet restauré', async ({ page }) => {
    await page.goto('/?intro=0');
    const ref = await snapshot(page);
    await page.goto('/?intro=debug&seed=2');
    // Attendre qu'un texte soit en cours de frappe (nœud partiellement rempli).
    await page.waitForFunction(() => {
      const run = window.__intro?.plan().some((t) => t.state === 'run' && t.kind === 'type');
      const lead = document.querySelector('[data-intro="lead"]');
      return run && lead && !lead.hasAttribute('data-bi') && lead.textContent.length > 0 && lead.textContent.length < 120;
    }, null, { timeout: 60000, polling: 16 });
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveClass(/bi-skipped/);
    expect(await snapshot(page)).toBe(ref);
  });

  test('rejouer deux fois : DOM identique à chaque fois', async ({ page }) => {
    await page.goto('/?intro=0');
    const ref = await snapshot(page);
    await page.goto('/?intro=fast&intro=debug&seed=3');
    for (let i = 0; i < 2; i++) {
      await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 90000 });
      expect(await snapshot(page)).toBe(ref);
      await page.locator('.bi-replay').click();
      await expect(page.locator('.bi-hud')).toBeVisible();
    }
    await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 90000 });
    expect(await snapshot(page)).toBe(ref);
  });
});
