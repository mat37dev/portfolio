import { test, expect } from '@playwright/test';

// Mesure de durée : le temps de l'intro dépend des images par seconde, il s'étire
// quand d'autres tests tournent en parallèle. À lancer seule :
//   INTRO_TIMING=1 npx playwright test intro-duration --project=desktop --workers=1
// Sans trace : l'enregistrement ralentit le rendu et fausse les durées.
test.use({ trace: 'off' });

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== 'desktop', 'intro desktop seulement');
  test.skip(!process.env.INTRO_TIMING, 'mesure de durée : INTRO_TIMING=1, sans autre test en parallèle');
  test.setTimeout(150000);
});

// Vitesse normale, sans easter egg : ouverture vive, fin resserrée, passage complet
// d'environ 49 s (l'ancien réglage en donnait 56).
test('durée en vitesse normale : ouverture, fin et passage complet', async ({ page }) => {
  await page.goto('/?intro=debug&seed=4&egg=none');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 120000 });
  const { total, tl } = await page.evaluate(() => ({ total: window.__intro.elapsed(), tl: window.__intro.timeline }));
  const at = (e) => (tl.find(([, x]) => x === e) || [])[0];
  const built = Math.max(...tl.filter(([, e]) => e.startsWith('task:') && e !== 'task:deploy:').map(([t]) => t));
  expect(at('task:type:badge')).toBeLessThan(3.3);
  expect(at('deployed') - built).toBeLessThan(4);
  expect(total).toBeLessThan(52);
  expect(total).toBeGreaterThan(35);
});

// Fin du hero : la section projets démarre sans creux où un seul curseur travaille,
// avec ou sans l'easter egg copine (avant : 15,8 s, 17,5 s en version a, 16,4 s en b).
const HERO_END = { none: 16.5, 'copine-a': 15, 'copine-b': 16 };
for (const [egg, max] of Object.entries(HERO_END)) {
  test(`fin du hero sans creux (egg=${egg})`, async ({ page }) => {
    await page.goto(`/?intro=debug&seed=4&egg=${egg}`);
    await page.waitForFunction(() => window.__intro && window.__intro.events.includes('task:title:projets-h2'), null, { timeout: 60000 });
    const tl = await page.evaluate(() => window.__intro.timeline);
    expect(tl.find(([, e]) => e === 'task:title:projets-h2')[0]).toBeLessThan(max);
  });
}
