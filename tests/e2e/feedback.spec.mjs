import { test, expect } from '@playwright/test';

// Retours après test (nav, console, Lighthouse).

const parse = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number);
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => { const [x, y] = [lum(parse(a)), lum(parse(b))].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test('nav : les liens réagissent au survol', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/?intro=0');
  const link = page.locator('header a[data-section="parcours"]');
  const halo = () => link.evaluate((e) => getComputedStyle(e, '::before').opacity);
  expect(await halo()).toBe('0');
  await link.hover();
  await expect.poll(halo).toBe('1');
});

test('pas de script Vercel Analytics hors de Vercel', async ({ page }) => {
  const hits = [];
  page.on('request', (r) => { if (/_vercel\/insights|va\.vercel-scripts/.test(r.url())) hits.push(r.url()); });
  await page.goto('/?intro=0');
  await page.waitForLoadState('networkidle');
  expect(hits).toEqual([]);
});

test('console : taper ski lance le skieur', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  await page.goto('/?intro=0');
  await expect.poll(() => logs.some((l) => l.includes('Curieux ?'))).toBe(true);
  await page.evaluate(() => window.ski);
  await expect(page.locator('.bi-skier')).toBeVisible();
});

test('boutons bleus : contraste AA en jour', async ({ page }) => {
  await page.goto('/?intro=0');
  for (const sel of ['header a.pill-acc', '[data-intro="cta-contact"]']) {
    const [fg, bg] = await page.locator(sel).evaluate((e) => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]);
    expect(contrast(fg, bg), sel).toBeGreaterThanOrEqual(4.5);
  }
});

test('compétences : titres de groupe en h3 (pas de saut de niveau)', async ({ page }) => {
  await page.goto('/?intro=0');
  const sec = page.locator('[data-intro="competences"]');
  await expect(sec.locator('h4')).toHaveCount(0);
  await expect(sec.locator('[data-intro="grp"] > h3')).toHaveCount(5);
});

test('neige : pas de recalcul de style à chaque image', async ({ page }) => {
  await page.addInitScript(() => {
    const orig = window.getComputedStyle;
    window.__gcs = 0;
    window.getComputedStyle = function (...a) { window.__gcs++; return orig.apply(this, a); };
  });
  await page.goto('/?intro=0');
  await page.waitForTimeout(800);
  const a = await page.evaluate(() => window.__gcs);
  await page.waitForTimeout(1000);
  const b = await page.evaluate(() => window.__gcs);
  expect(b - a).toBeLessThan(10);
});
