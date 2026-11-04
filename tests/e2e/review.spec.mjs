import { test, expect } from '@playwright/test';

// Tests ajoutés après la relecture de la branche (chantier A).

const transformOf = (loc) => loc.evaluate((e) => getComputedStyle(e).transform);
const matrix = (t) => (t === 'none' ? [1, 0, 0, 1, 0, 0] : t.match(/-?[\d.]+/g).map(Number));

test.describe('survols (desktop)', () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'desktop', 'souris seulement');
  });

  test('carte projet : se soulève de 8 px au survol', async ({ page }) => {
    await page.goto('/#projets');
    const card = page.locator('[data-intro="card"]').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-visible/);
    await card.hover();
    await expect.poll(async () => matrix(await transformOf(card))[5]).toBeLessThan(-6);
  });

  test('projet phare : se soulève au survol', async ({ page }) => {
    await page.goto('/#projets');
    const feat = page.locator('[data-intro="featured"]');
    await expect(feat).toHaveClass(/is-visible/);
    await feat.hover();
    await expect.poll(async () => matrix(await transformOf(feat))[5]).toBeLessThan(-2);
  });

  test('carte du hero : se redresse et se soulève au survol après son entrée', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[data-intro="card-left"]');
    await expect(card).toHaveClass(/is-live/, { timeout: 5000 });
    await card.hover();
    // rotation(-6°) → b ≈ -0.10 ; redressée → b ≈ 0 et translation vers le haut
    await expect.poll(async () => Math.abs(matrix(await transformOf(card))[1])).toBeLessThan(0.02);
    expect(matrix(await transformOf(card))[5]).toBeLessThan(-5);
  });
});

test('neige : la boucle s’arrête quand le hero est hors écran', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('[data-intro="snow"]');
  const blank = () =>
    canvas.evaluate((c) => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.every((v) => v === 0));
  await expect.poll(blank).toBe(false);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await expect.poll(blank, { timeout: 3000 }).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(blank, { timeout: 3000 }).toBe(false);
});

test('sans JavaScript : tout le contenu est visible', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/');
  for (const sel of ['[data-intro="lead"]', '[data-intro="card-photo"]', '[data-intro="featured"]', '[data-intro="xp-grid"]']) {
    expect(Number(await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity)), sel).toBe(1);
  }
  expect(await page.locator('[data-intro="h1"] .ln span').first().evaluate((e) => getComputedStyle(e).transform)).toBe('none');
  await ctx.close();
});

test('intro complète : html.bi-done affiche le hero au repos, sans animation', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.setTimeout(90000);
  await page.goto('/?intro=fast&seed=1');
  await expect(page.locator('html')).toHaveClass(/bi-live/);
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('html')).toHaveClass(/bi-done/);
  await expect(page.locator('html')).not.toHaveClass(/entrance/);
  for (const sel of ['[data-intro="lead"]', '[data-intro="card-photo"]', '[data-intro="tag-1"]']) {
    await expect.poll(() => page.locator(sel).evaluate((e) => getComputedStyle(e).opacity), { message: sel }).toBe('1');
  }
  expect(await page.locator('[data-intro="h1"] .ln span').first().evaluate((e) => getComputedStyle(e).transform)).toBe('none');
});

test('mode nuit : le texte des boutons bleus est sombre (contraste)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  const color = await page.locator('[data-intro="cta-contact"]').evaluate((e) => getComputedStyle(e).color);
  expect(color).toBe('rgb(14, 19, 26)');
});

test('mobile : cibles tactiles d’au moins 44 px', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile seulement');
  await page.goto('/');
  const sels = [
    'header [data-intro="theme-toggle"]',
    '[data-intro="snow-toggle"]',
    'header a.pill',
    '[data-intro="cta-projects"]',
    '[data-intro="filters"] button',
    'footer nav a',
  ];
  for (const sel of sels) {
    const boxes = await page.locator(sel).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    for (const h of boxes) expect(h, sel).toBeGreaterThanOrEqual(44);
  }
});

test('page 404 : stylée, sans ski, nav utilisable', async ({ page }) => {
  const res = await page.goto('/page-inexistante');
  expect(res.status()).toBe(404);
  const back = page.getByRole('link', { name: /Retour à l’accueil|Retour à l'accueil/ });
  await expect(back).toBeVisible();
  await expect(back).toHaveClass(/pill/);
  expect(await page.locator('main').innerText()).not.toMatch(/piste|remontée|hors-piste/i);
  await expect(page.locator('header a[data-section="projets"]')).toHaveAttribute('href', '/#projets');
});

test('compétences : le premier groupe n’a pas de bordure haute', async ({ page }) => {
  await page.goto('/#competences');
  const w = await page.locator('[data-intro="grp"]').first().evaluate((e) => getComputedStyle(e).borderTopWidth);
  expect(w).toBe('0px');
});
