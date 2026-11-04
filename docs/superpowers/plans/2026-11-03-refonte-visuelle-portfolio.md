# Refonte visuelle du portfolio — plan d'implémentation (chantier A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le style actuel du site par la direction validée (serif d'affichage, nav en pilule, hero montagne/neige, mode nuit), une page qui défile, sans changer le contenu ni la stack.

**Architecture:** Les textes et listes sortent des composants vers `src/app/data/*` (modules purs, testables avec `node --test`). Chaque section redevient un composant serveur quand c'est possible, avec de petits composants clients pour ce qui bouge (nav, filtres, scène du hero, fond du hero, bascule neige/thème). Les jetons de couleur vivent dans `globals.css` (`:root` / `:root.dark`) et sont exposés à Tailwind via `tailwind.config.mjs`. Chaque élément que le moteur d'intro devra « construire » porte un attribut `data-intro="<nom>"` dès maintenant, pour que le chantier B ne retouche pas les composants.

**Tech Stack:** Next.js 15 (app router), React 19, Tailwind 3.4, `next/font/google` (DM Serif Display, Inter, JetBrains Mono), `simple-icons` (logos), `@playwright/test` (tests de mise en page), `node --test` (tests unitaires, Node 22).

**Spec:** `docs/superpowers/specs/2026-11-03-refonte-portfolio-et-intro-curseurs-design.md` (sections 1–4 et 7). Rendu de référence : `docs/superpowers/mockups/portfolio-v2.html`.

## Global Constraints

- Pas de changement de stack applicatif ; dépendances ajoutées : `simple-icons` (runtime), `@playwright/test` (dev). Pas de GSAP/Three/WebGL.
- `prefers-reduced-motion: reduce` : aucune animation d'entrée, pas de neige, pas de parallaxe.
- Point de rupture unique : **860 px**. En dessous : colonnes simples, hero sans cartes latérales ni lignes de niveau, liens de nav masqués.
- Jetons jour/nuit copiés tels quels du spec §4.2 (accent `#2f7cf6` jour / `#6f97ff` nuit, encre `#161618` / `#f2f5f8`, fond `#ffffff` / `#0e131a`, lignes `#e7ebf0` / `#243040`, etc.).
- Copies fixées par le spec §4.3 (badge « Freelance disponible · Nantes », H1 « Développeur fullstack, / de Salesforce au mobile. », coches, titres de section, contact). Aucun mot du champ lexical du ski dans les textes.
- Liens : GitHub `https://github.com/mat37dev`, LinkedIn `https://www.linkedin.com/in/mathieu-crosnier-b78a16238/`, Malt `https://www.malt.fr/profile/mathieucrosnier`, e-mail `mathieu.crosnier15@outlook.fr`, CV `/cv.pdf`.
- Les composants ne touchent ni ne lisent les attributs `data-bi*` (réservés au moteur d'intro) ; ils posent seulement `data-intro="…"`.
- Le thème suit `html.dark` **ou** `html[data-bi-theme="dark"]` ; la neige se cache quand `html[data-snow="off"]` **ou** `[data-intro="hero"][data-bi~="nosnow"]`.
- Métadonnées, JSON-LD, sitemap, robots, en-têtes de sécurité : conservés ; le JSON-LD gagne l'URL Malt dans `sameAs`.
- Messages de commit en français, sans ligne `Co-Authored-By` (préférence du dépôt).

## Review Focus

1. Un visiteur avec `prefers-reduced-motion` doit voir la page entière immédiatement (aucune opacité 0 résiduelle) → test dans la tâche 9.
2. Thème sombre enregistré (`localStorage.theme = "dark"`) : la page doit se charger sans flash clair et avec les crêtes de nuit → test dans la tâche 4.
3. Neige désactivée (`localStorage.snow = "off"`) : le canvas ne dessine rien et le bouton est à l'état « off » dès le chargement → test dans la tâche 5.
4. Filtre « Jeux vidéo » puis « Tous » : les sept projets réapparaissent dans l'ordre d'origine → test dans la tâche 6.
5. Formspree hors ligne / erreur réseau : le bouton redevient actif et un message d'erreur s'affiche, l'adresse e-mail reste en clair comme solution de repli → test dans la tâche 9.

---

### Task 1 : Outillage de test

**Files:**
- Create: `playwright.config.mjs`, `tests/e2e/smoke.spec.mjs`, `tests/unit/.gitkeep`
- Modify: `package.json` (scripts `test`, `test:unit`, `test:e2e`), `.gitignore` (`/test-results/`, `/playwright-report/`)

**Interfaces:**
- Produces: `npm run test:unit` → `node --test tests/unit/`; `npm run test:e2e` → `playwright test` (webServer `next dev -p 3100`, `baseURL` `http://127.0.0.1:3100`, projet `desktop` viewport 1280×800 et projet `mobile` viewport 390×844, `reducedMotion: 'no-preference'`).

- [ ] **Step 1 : Installer Playwright**

Run: `npm i -D @playwright/test && npx playwright install chromium`

- [ ] **Step 2 : Écrire `playwright.config.mjs`** avec les deux projets ci-dessus, `webServer: { command: 'npm run dev -- -p 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: true, timeout: 120000 }`, `use: { baseURL, trace: 'retain-on-failure' }`.

- [ ] **Step 3 : Écrire le test de fumée**

```js
// tests/e2e/smoke.spec.mjs
import { test, expect } from '@playwright/test';
test('la page d\'accueil répond avec un h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

- [ ] **Step 4 : Ajouter les scripts** dans `package.json` : `"test": "npm run test:unit && npm run test:e2e"`, `"test:unit": "node --test tests/unit/"`, `"test:e2e": "playwright test"`.

- [ ] **Step 5 : Vérifier**

Run: `npm run test:e2e`
Expected: 2 passed (desktop + mobile).

- [ ] **Step 6 : Commit**

```bash
git add playwright.config.mjs tests package.json package-lock.json .gitignore
git commit -m "Ajout de l'outillage de test (Playwright, node --test)"
```

---

### Task 2 : Polices et jetons jour/nuit

**Files:**
- Modify: `src/app/layout.js` (polices), `src/app/globals.css` (jetons), `tailwind.config.mjs` (couleurs, polices)
- Test: `tests/e2e/tokens.spec.mjs`

**Interfaces:**
- Produces: variables CSS `--bg --bg2 --card --ink --txt --mute --line --line2 --acc --acc-soft --glow --shadow --shadow2 --sky1 --sky2 --sky3 --sun1 --sun2 --r1a --r1b --r2a --r2b --r3a --r3b --r4 --topo --topo2 --alt --flake --flakeglow --navbg --inv` (valeurs du spec §4.2), définies sur `:root`, redéfinies sous `:root.dark, :root[data-bi-theme="dark"]`, et `:root[data-bi-theme="light"]` qui re-force les valeurs jour. Variables de police `--font-serif`, `--font-sans`, `--font-mono`. Classes Tailwind : `font-serif`, `font-sans`, `font-mono`, couleurs `bg`, `bg2`, `card`, `ink`, `txt`, `mute`, `line`, `line2`, `acc`, `acc-soft`. Courbe `--ease: cubic-bezier(.2,.8,.2,1)`.

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/tokens.spec.mjs
import { test, expect } from '@playwright/test';
const read = (page, name) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
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
  await page.evaluate(() => { document.documentElement.classList.remove('dark'); document.documentElement.dataset.biTheme = 'dark'; });
  expect(await read(page, '--acc')).toBe('#6f97ff');
  await page.evaluate(() => { document.documentElement.classList.add('dark'); document.documentElement.dataset.biTheme = 'light'; });
  expect(await read(page, '--acc')).toBe('#2f7cf6');
});
test('polices chargées', async ({ page }) => {
  await page.goto('/');
  const fam = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--font-serif'));
  expect(fam).toContain('DM_Serif_Display');
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test tokens` — Expected: FAIL (variables vides).

- [ ] **Step 3 : Remplacer les polices dans `layout.js`** : `DM_Serif_Display({ weight: '400', variable: '--font-serif', subsets: ['latin'], display: 'swap' })`, `Inter({ weight: ['400','500','600','700'], variable: '--font-sans', … })`, `JetBrains_Mono({ weight: ['400','500'], variable: '--font-mono', … })` ; les trois variables sur `<body>`. Supprimer Manrope et IBM Plex.

- [ ] **Step 4 : Réécrire les jetons de `globals.css`** (remplacer tout le bloc `:root` / `:root.dark` actuel et les styles `.snowflake`/`flakeFall`, qui disparaissent) avec les valeurs du spec §4.2, `body { background: var(--bg); color: var(--txt); font-family: var(--font-sans); }`, `section[id] { scroll-margin-top: 90px }`, `html { scroll-behavior: smooth }`, et `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }`.

- [ ] **Step 5 : Mettre à jour `tailwind.config.mjs`** : `colors` = les 10 couleurs de l'interface ci-dessus (`bg: 'var(--bg)'`, …), `fontFamily.serif/sans/mono` = les trois variables, `transitionTimingFunction.ease2: 'var(--ease)'`. Retirer les anciennes couleurs (`snow`, `anthracite`, `wood`, `chip*`…) — les composants qui les utilisent sont réécrits dans les tâches suivantes ; le build peut échouer entre les deux, c'est attendu.

- [ ] **Step 6 : Vérifier** — Run: `npx playwright test tokens` — Expected: 3 passed par projet.

- [ ] **Step 7 : Commit** — `git commit -am "Nouvelles polices et jetons jour/nuit"`

---

### Task 3 : Données

**Files:**
- Create: `src/app/data/profile.js`, `src/app/data/projects.js`, `src/app/data/experience.js`, `src/app/data/skills.js`
- Test: `tests/unit/data.test.js`

**Interfaces:**
- Produces:
  - `profile.js` : `export const PROFILE = { name, role: 'Développeur fullstack', city: 'Nantes', badge: 'Freelance disponible · Nantes', h1: ['Développeur fullstack,', 'de Salesforce au mobile.'], lead: { before, strong1: 'Cloudity', middle, strong2: 'React, Next.js, Symfony', after }, checks: ['Master SIN · EPSI', 'Alternant chez Cloudity', 'Freelance sur Malt'], stageTags: ['Alternant chez Cloudity', '7 projets en ligne', 'React · Next.js · Symfony'], photoCaption: 'Mathieu · Nantes', email, cv: '/cv.pdf', links: { github, linkedin, malt }, contact: { title: 'Un projet, une mission, une question ?', text, checks: ['Réponse sous 24 h', 'Nantes ou à distance', 'Missions freelance via Malt'], formspree: 'https://formspree.io/f/xjkgqzdr' } }`.
  - `projects.js` : `export const FILTERS = ['Tous','Web','Mobile','Jeux vidéo','DevOps']`, `export const PROJECTS = [{ id, title, category, year, description, stack: string[], href?: string, image: StaticImport, imageAlt, featured?: true, role?: string }]` — 7 entrées reprises de l'actuel `ProjectSection.js` (SkiMate `featured`, `role: 'Conception et développement'`, `href: 'https://github.com/mat37dev'` ; Find And Build `category: 'Jeux vidéo'`, `href` itch.io ; Site de covoiturage sans `href`). `export const featuredProject()` et `otherProjects()`.
  - `experience.js` : `EXPERIENCES = [{ role, company, period, current?: true, description, tags }]` (4 entrées, libellés du spec §4.3-4 : « Développeur Salesforce » · « Cloudity » · « 12/2025 — auj. »…), `EDUCATION = [{ period, title, subtitle, current? }]` (3 entrées, sans le Bac).
  - `skills.js` : `SKILL_GROUPS = [{ name, skills: [{ name, icon: 'react' | 'salesforce' | null, level?: 'quotidien' | 'natif' | 'professionnel' }] }]` — 5 groupes du spec §4.3-5 ; `icon` est le slug simple-icons (`react`, `nextdotjs`, `javascript`, `tailwindcss`, `html5`, `bootstrap`, `php`, `symfony`, `nodedotjs`, `python`, `openjdk`, `dotnet`, `expo`, `postgresql`, `mysql`, `mongodb`, `git`, `docker`, `ansible`, `grafana`), `'salesforce'` pour Apex/Flow/SOQL (pictogramme maison), `null` pour les langues. `inverted: true` sur `nextdotjs`, `symfony`, `expo`.

- [ ] **Step 1 : Écrire les tests**

```js
// tests/unit/data.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS, FILTERS, featuredProject, otherProjects } from '../../src/app/data/projects.js';
import { EXPERIENCES, EDUCATION } from '../../src/app/data/experience.js';
import { SKILL_GROUPS } from '../../src/app/data/skills.js';
import { PROFILE } from '../../src/app/data/profile.js';
test('sept projets, un seul phare, SkiMate', () => {
  assert.equal(PROJECTS.length, 7);
  assert.equal(featuredProject().title, 'SkiMate');
  assert.equal(otherProjects().length, 6);
});
test('les liens projets sont ceux du site', () => {
  const by = (t) => PROJECTS.find((p) => p.title === t);
  assert.equal(by('Resilience Alpha').href, 'https://github.com/mat37dev/resilience-alpha');
  assert.equal(by('Find And Build').href, 'https://iphinis.itch.io/find-build');
  assert.equal(by('Site de covoiturage').href, undefined);
  assert.deepEqual(FILTERS, ['Tous', 'Web', 'Mobile', 'Jeux vidéo', 'DevOps']);
  for (const p of PROJECTS) assert.ok(FILTERS.includes(p.category), p.title);
});
test('parcours : 4 expériences, 3 formations, sans le Bac', () => {
  assert.equal(EXPERIENCES.length, 4);
  assert.equal(EXPERIENCES[0].current, true);
  assert.equal(EDUCATION.length, 3);
  assert.ok(!EDUCATION.some((e) => /bac/i.test(e.title)));
});
test('compétences : 5 groupes, 6 outils du quotidien', () => {
  assert.equal(SKILL_GROUPS.length, 5);
  const daily = SKILL_GROUPS.flatMap((g) => g.skills).filter((s) => s.level === 'quotidien').map((s) => s.name);
  assert.deepEqual(daily.sort(), ['Apex', 'Flow', 'Git', 'Next.js', 'PHP', 'React']);
});
test('profil : copies et liens fixés', () => {
  assert.equal(PROFILE.badge, 'Freelance disponible · Nantes');
  assert.deepEqual(PROFILE.h1, ['Développeur fullstack,', 'de Salesforce au mobile.']);
  assert.equal(PROFILE.links.malt, 'https://www.malt.fr/profile/mathieucrosnier');
  assert.equal(PROFILE.cv, '/cv.pdf');
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npm run test:unit` — Expected: FAIL (modules introuvables).

- [ ] **Step 3 : Écrire les quatre modules.** Les images de projets restent importées depuis `/public/projectImages/*` comme aujourd'hui (imports statiques dans `projects.js`). Note : `node --test` importera des `.jpg` via ces imports statiques et échouera — contourner en mettant les imports d'images dans `src/app/data/projectImages.js` et en gardant `projects.js` pur : `image` devient une clé (`'skimate'`), résolue par `projectImages.js` côté composant (`PROJECT_IMAGES[key]`).

- [ ] **Step 4 : Vérifier** — Run: `npm run test:unit` — Expected: 5 passed.

- [ ] **Step 5 : Commit** — `git add src/app/data tests/unit && git commit -m "Extraction des données du portfolio en modules purs"`

---

### Task 4 : Nav en pilule, bascule thème, pied de page, assemblage du layout

**Files:**
- Modify: `src/app/components/Header.js` (réécriture), `src/app/components/Footer.js` (réécriture), `src/app/components/ThemeToggle.js` (style), `src/app/layout.js` (retrait de `SnowEffect`, JSON-LD `sameAs` + Malt, conteneur sans `max-w` global), `src/app/components/ScrollProgress.js` (dégradé `from-acc to-acc`), `src/app/components/ScrollToTop.js` (couleurs `bg-acc`)
- Delete: `src/app/components/SnowEffect.js` (remplacé en tâche 5), `src/app/components/Logo.js` reste (icônes OG)
- Test: `tests/e2e/nav.spec.mjs`

**Interfaces:**
- Consumes: `PROFILE` (tâche 3).
- Produces: `<header data-intro="nav">` fixe, contenant `.nav-bar` (pilule) : lien `#top` avec `<Image src="/profile.jpg" width=34 height=34>` (photo ajoutée en tâche 10 ; d'ici là `public/avatar.png`), nom + rôle ; `<nav>` avec les quatre liens `#projets #parcours #competences #contact` (`data-section` = id) ; `<ThemeToggle>` ; lien « Me contacter » `href="#contact"` classe `.pill.pill-acc`. Classe `is-scrolled` sur le `<header>` quand `scrollY > 40`. Lien actif : classe `is-active` posée par un `IntersectionObserver` (`rootMargin: '-40% 0px -55% 0px'`). `<footer data-intro="footer">` : nom en serif, liens GitHub / LinkedIn / Malt (`target="_blank" rel="noopener noreferrer"`), « © 2026 ».

- [ ] **Step 1 : Écrire les tests**

```js
// tests/e2e/nav.spec.mjs
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
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim())).toBe('#6f97ff');
});
test('JSON-LD : Malt dans sameAs', async ({ page }) => {
  await page.goto('/');
  const ld = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(ld).sameAs).toContain('https://www.malt.fr/profile/mathieucrosnier');
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test nav` — Expected: FAIL.

- [ ] **Step 3 : Réécrire `Header.js`** (client) selon la maquette `.nav/.bar/.brand/.pill` : styles Tailwind avec les jetons (`bg-[var(--navbg)] backdrop-blur-xl border border-line rounded-full shadow-[0_10px_30px_var(--shadow2)]`), liens masqués sous 860 px (`max-[859px]:hidden`), `is-scrolled` et `is-active` gérés dans un `useEffect` (scroll passif + IntersectionObserver sur les quatre sections), focus visibles (`focus-visible:ring-2 ring-acc`).

- [ ] **Step 4 : Restyler `ThemeToggle.js`** : bouton rond 36 px, `border border-line bg-card`, mêmes `aria-label` qu'aujourd'hui (le test s'appuie sur « Passer au thème sombre »).

- [ ] **Step 5 : Réécrire `Footer.js`** et mettre à jour `layout.js` : retirer `<SnowEffect />` et le `max-w-[1360px]` global (chaque section gère son `.wrap` max-w 1120 px), ajouter `PROFILE.links.malt` au `sameAs`, remplacer `themeColor` par `#ffffff`.

- [ ] **Step 6 : Vérifier** — Run: `npx playwright test nav` — Expected: 3 passed par projet. Run: `npm run build` — Expected: succès (les sections encore non réécrites doivent compiler : remplacer provisoirement leurs classes supprimées par des classes neutres si le build casse, elles sont réécrites dans les tâches 5 à 9).

- [ ] **Step 7 : Commit** — `git commit -am "Nav en pilule, bascule thème et pied de page"`

---

### Task 5 : Hero — fond montagne, neige, scène à trois cartes

**Files:**
- Create: `src/app/components/hero/HeroBackground.js` (client : ciel, étoiles, halo, lignes de niveau, crêtes SVG, canvas neige), `src/app/components/hero/HeroStage.js` (client : trois cartes + parallaxe + étiquettes), `src/app/components/hero/SnowToggle.js` (client : bouton fixe bas-gauche, `localStorage.snow`, attribut `data-snow` sur `<html>`), `src/app/components/hero/ridge.js` (constantes : points des polygones et chemins des lignes de niveau, copiés de la maquette)
- Modify: `src/app/components/HeroSection.js` (réécriture, composant serveur)
- Test: `tests/e2e/hero.spec.mjs`

**Interfaces:**
- Consumes: `PROFILE`, `PROJECT_IMAGES` (tâche 3).
- Produces: `<section id="top" data-intro="hero">` contenant : `.hero-bg` (`data-intro="hero-bg"`) avec `.sky` (`data-intro="sky"`), `svg.topo` (`data-intro="topo"`, masqué sous 860 px via CSS), `svg.ridge` avec 4 `<polygon data-intro="ridge-1|2|3|4">`, `<canvas data-intro="snow">` ; puis `.badge` (`data-intro="badge"`), `<h1 data-intro="h1">` avec deux `<span class="ln"><span>…</span></span>`, `<p data-intro="lead">`, `.cta` avec `<a data-intro="cta-contact">`, `<a data-intro="cta-cv" href="/cv.pdf" download>`, `<a data-intro="cta-projects">`, `.checks` (`data-intro="checks"`), `.stage` (`data-intro="stage"`) avec `<a data-intro="card-left">`, `<figure data-intro="card-photo">`, `<a data-intro="card-right">`, trois `.tag` (`data-intro="tag-1|2|3"`). `SnowToggle` : `<button data-intro="snow-toggle" aria-pressed>` ; `document.documentElement.dataset.snow = 'on' | 'off'`, persisté dans `localStorage.snow`, lu avant le premier rendu du canvas. Le canvas ne dessine pas si `html[data-snow="off"]`, si le hero porte `data-bi~="nosnow"`, si `prefers-reduced-motion`, ou si `document.hidden`. Densité : `Math.round(width / 11)` flocons, rayon 0,9–3,1 px, chute 0,25–0,8 px/image, dérive `sin`, couleur `--flake`, halo `--flakeglow` flou 6 px.

- [ ] **Step 1 : Écrire les tests**

```js
// tests/e2e/hero.spec.mjs
import { test, expect } from '@playwright/test';
test('hero : copies, CV, scène', async ({ page }, info) => {
  await page.goto('/');
  const hero = page.locator('[data-intro="hero"]');
  await expect(hero.locator('[data-intro="badge"]')).toHaveText(/Freelance disponible · Nantes/);
  await expect(hero.locator('h1')).toHaveText('Développeur fullstack,de Salesforce au mobile.');
  await expect(hero.locator('[data-intro="cta-cv"]')).toHaveAttribute('download', '');
  await expect(hero.locator('[data-intro="cta-cv"]')).toHaveAttribute('href', '/cv.pdf');
  await expect(hero.locator('[data-intro="checks"]')).toContainText('Freelance sur Malt');
  const desktop = info.project.name === 'desktop';
  await expect(hero.locator('[data-intro="card-left"]')).toBeVisible({ visible: desktop });
  await expect(hero.locator('[data-intro="card-photo"]')).toBeVisible();
  await expect(hero.locator('[data-intro="topo"]')).toBeVisible({ visible: desktop });
});
test('neige : préférence off respectée au chargement', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'off');
  await expect(page.locator('[data-intro="snow-toggle"]')).toHaveAttribute('aria-pressed', 'false');
  const blank = await page.evaluate(() => { const c = document.querySelector('[data-intro="snow"]'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; return d.every((v) => v === 0); });
  expect(blank).toBe(true);
  await page.locator('[data-intro="snow-toggle"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'on');
});
test('hero : pas de ski dans les textes', async ({ page }) => {
  await page.goto('/');
  const txt = await page.locator('[data-intro="hero"]').innerText();
  expect(txt).not.toMatch(/piste|remontée|altitude|forfait/i);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test hero` — Expected: FAIL.

- [ ] **Step 3 : Écrire `ridge.js`** : `RIDGE_POLYGONS` (4 tableaux de points, viewBox `0 0 1440 400`) et `TOPO_PATHS` (10 chemins, viewBox `0 0 1440 900`) copiés de `portfolio-v2.html`.

- [ ] **Step 4 : Écrire `HeroBackground.js`** : rendu des couches avec les dégradés SVG référencés aux variables (`stop-color="var(--r1a)"`…), étoiles en `radial-gradient` (visibles seulement en nuit via `.dark .stars{opacity:.7}`), canvas neige : `useEffect` qui lit `html[data-snow]`, écoute l'événement `snow:change` (émis par `SnowToggle`), un `MutationObserver` sur l'attribut `data-bi` du hero, `visibilitychange`, et `resize` ; boucle `requestAnimationFrame` arrêtée quand rien ne doit être dessiné.

- [ ] **Step 5 : Écrire `SnowToggle.js`** : même bouton qu'aujourd'hui (icône `Snowflake`, `fixed bottom-6 left-6`, couleurs jetons), lit `localStorage.snow` dans un `useEffect`, écrit `html[data-snow]` et émet `window.dispatchEvent(new CustomEvent('snow:change', { detail: { on } }))`. Monté par `HeroSection`.

- [ ] **Step 6 : Écrire `HeroStage.js`** : trois cartes (`--r: -6deg | 0 | 6deg`, `data-depth` 1.4 / 0.6 / 1.4), parallaxe sur `mousemove` (window, passif, `--px/--py` = `x*-16*depth`, `y*-12*depth`), désactivée sous `prefers-reduced-motion` ; cartes latérales `max-[859px]:hidden` ; photo via `next/image` (`/profile.jpg`, `priority`).

- [ ] **Step 7 : Réécrire `HeroSection.js`** avec la structure de l'interface, classes Tailwind + un petit bloc CSS dans `globals.css` pour `.hero`, `.ln`, `.stage .c` (transform combinant `rotate(var(--r))` et `translate3d(var(--px),var(--py),0)`), tailles du spec (H1 `clamp(44px,6.4vw,78px)`, hero `min-height: 100vh` desktop, `padding-top: 150px`).

- [ ] **Step 8 : Vérifier** — Run: `npx playwright test hero` — Expected: 3 passed par projet.

- [ ] **Step 9 : Commit** — `git add -A src/app/components/hero src/app/components/HeroSection.js src/app/globals.css tests/e2e/hero.spec.mjs && git commit -m "Nouveau hero : fond montagne, neige et scène à trois cartes"`

---

### Task 6 : Projets — projet phare, grille, filtres

**Files:**
- Create: `src/app/components/projects/FeaturedProject.js`, `src/app/components/projects/ProjectCard.js`, `src/app/components/projects/ProjectFilters.js` (client)
- Modify: `src/app/components/ProjectSection.js` (réécriture : serveur, données depuis `projects.js`, l'état de filtre vit dans `ProjectFilters` qui pose `data-filter` sur la grille ; les cartes se masquent par CSS `[data-filter="Web"] .card:not([data-category="Web"]) { display: none }`)
- Test: `tests/e2e/projects.spec.mjs`

**Interfaces:**
- Consumes: `PROJECTS`, `FILTERS`, `featuredProject()`, `otherProjects()`, `PROJECT_IMAGES`.
- Produces: `<section id="projets" data-intro="projets">` : `.eyebrow` (`data-intro="projets-eyebrow"`), `<h2 data-intro="projets-h2">` « Sept projets, du mobile au DevOps. », `<p data-intro="projets-sub">`, `<div data-intro="filters">` avec 5 `<button aria-pressed>`, `<article data-intro="featured">` (numéro « 01 », chips, `<h3>`, texte, meta, `<a data-intro="featured-link" class="pill pill-dark">Voir le projet →</a>`, `<figure data-intro="featured-image">`), `<div data-intro="grid" data-filter="Tous">` avec 6 `<a|div class="card" data-intro="card" data-category="…">` ; une carte sans `href` est un `<div>` avec `data-nolink` (libellé au survol « Projet d'école · sans lien public »).

- [ ] **Step 1 : Écrire les tests**

```js
// tests/e2e/projects.spec.mjs
import { test, expect } from '@playwright/test';
test('projets : phare, six cartes, liens', async ({ page }) => {
  await page.goto('/#projets');
  const sec = page.locator('[data-intro="projets"]');
  await expect(sec.locator('[data-intro="featured"] h3')).toHaveText('SkiMate');
  await expect(sec.locator('[data-intro="card"]')).toHaveCount(6);
  await expect(sec.locator('a[data-intro="card"][href="https://github.com/mat37dev/notre-cuisine"]')).toHaveAttribute('target', '_blank');
  await expect(sec.locator('[data-intro="card"][data-nolink]')).toHaveCount(1);
});
test('filtres : Jeux vidéo puis Tous rend les sept projets dans l\'ordre', async ({ page }) => {
  await page.goto('/#projets');
  const grid = page.locator('[data-intro="grid"]');
  const before = await grid.locator('[data-intro="card"] h3, [data-intro="card"] b').allInnerTexts();
  await page.getByRole('button', { name: 'Jeux vidéo' }).click();
  await expect(grid.locator('[data-intro="card"]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Web' }).click();
  await expect(grid.locator('[data-intro="card"]:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Tous' }).click();
  await expect(grid.locator('[data-intro="card"]:visible')).toHaveCount(6);
  expect(await grid.locator('[data-intro="card"] h3, [data-intro="card"] b').allInnerTexts()).toEqual(before);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test projects` — Expected: FAIL.

- [ ] **Step 3 : Écrire `ProjectCard.js`** (`.im` avec image `next/image` 170 px de haut, libellé « Voir le projet → » en `::after` au survol, titre `<h3>` serif + année mono, description, tags) ; `FeaturedProject.js` selon la maquette `.feat/.pola` ; `ProjectFilters.js` (`useState`, `aria-pressed`, écrit `data-filter` sur la grille via `document.getElementById('projets-grid')` — ou en remontant l'état : laisser le choix, mais la grille doit rester rendue côté serveur avec les 6 cartes).

- [ ] **Step 4 : Réécrire `ProjectSection.js`** avec la structure de l'interface et le CSS de masquage par filtre dans `globals.css`.

- [ ] **Step 5 : Vérifier** — Run: `npx playwright test projects` — Expected: 2 passed par projet.

- [ ] **Step 6 : Commit** — `git add -A src/app/components/projects src/app/components/ProjectSection.js src/app/globals.css tests/e2e/projects.spec.mjs && git commit -m "Section projets : projet phare, grille et filtres"`

---

### Task 7 : Parcours — cellules bordées et formations

**Files:**
- Modify: `src/app/components/TimelineSection.js` (réécriture, serveur)
- Test: `tests/e2e/parcours.spec.mjs`

**Interfaces:**
- Consumes: `EXPERIENCES`, `EDUCATION`.
- Produces: `<section id="parcours" data-intro="parcours" class="…bg-bg2">` : eyebrow, `<h2 data-intro="parcours-h2">` « Quatre ans entre alternances et stages. », `<p data-intro="parcours-sub">`, `<div data-intro="xp-grid">` avec 4 `<article class="cell" data-intro="cell">` (`<h3>` serif « Développeur Salesforce <span>· Cloudity</span> », période mono `data-current` si en cours, `<p>`, tags), `<div data-intro="edu-grid">` avec 3 `<article data-intro="edu">`.

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/parcours.spec.mjs
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
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test parcours` — Expected: FAIL.

- [ ] **Step 3 : Réécrire `TimelineSection.js`** selon la maquette `.tbl/.cell/.edu` (grille 2 colonnes bordée, `::before` trait bleu au survol, 1 colonne sous 860 px).

- [ ] **Step 4 : Vérifier** — Run: `npx playwright test parcours` — Expected: 1 passed par projet.

- [ ] **Step 5 : Commit** — `git commit -am "Section parcours en cellules bordées"`

---

### Task 8 : Compétences — pilules à logo

**Files:**
- Create: `src/app/components/icons/TechIcon.js` (serveur : rend un `<svg>` à partir de `simple-icons` par slug, ou le nuage Salesforce maison, `className="inv"` si `inverted`)
- Modify: `src/app/components/SkillSection.js` (réécriture, serveur), `package.json` (`simple-icons`)
- Test: `tests/e2e/skills.spec.mjs`, `tests/unit/techicon.test.js`

**Interfaces:**
- Consumes: `SKILL_GROUPS`.
- Produces: `TechIcon({ slug, inverted, size = 18 })` ; export pur `iconFor(slug) → { path: string, hex: string } | null` dans `src/app/components/icons/techIconData.js` (table construite depuis `simple-icons` + entrée `salesforce` maison, `hex: '00A1E0'`). `<section id="competences" data-intro="competences">` : eyebrow, `<h2 data-intro="competences-h2">` « Une stack web et mobile, plus Salesforce. », 5 `<div class="grp" data-intro="grp">` avec `<h4>` et `.tiles` de `<span class="tile" data-intro="tile">` (svg + nom + `<i class="lv">` si `level`).

- [ ] **Step 1 : Écrire les tests**

```js
// tests/unit/techicon.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iconFor } from '../../src/app/components/icons/techIconData.js';
test('iconFor résout les slugs utilisés et Salesforce', () => {
  for (const s of ['react','nextdotjs','javascript','tailwindcss','html5','bootstrap','php','symfony','nodedotjs','python','openjdk','dotnet','expo','postgresql','mysql','mongodb','git','docker','ansible','grafana','salesforce']) {
    const i = iconFor(s); assert.ok(i && i.path.length > 20 && /^[0-9A-F]{6}$/i.test(i.hex), s);
  }
  assert.equal(iconFor('inconnu'), null);
});
```

```js
// tests/e2e/skills.spec.mjs
import { test, expect } from '@playwright/test';
test('compétences : 5 groupes, logos, niveaux, inversion en nuit', async ({ page }) => {
  await page.goto('/#competences');
  const sec = page.locator('[data-intro="competences"]');
  await expect(sec.locator('[data-intro="grp"]')).toHaveCount(5);
  await expect(sec.locator('[data-intro="tile"] svg')).toHaveCount(20);
  await expect(sec.locator('[data-intro="tile"] .lv', { hasText: 'quotidien' })).toHaveCount(6);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const f = await sec.locator('[data-intro="tile"]', { hasText: 'Next.js' }).locator('svg').evaluate((e) => getComputedStyle(e).filter);
  expect(f).toContain('invert(1)');
});
```

- [ ] **Step 2 : Installer** — Run: `npm i simple-icons` ; lancer les tests, vérifier l'échec.

- [ ] **Step 3 : Écrire `techIconData.js`** (import nommé des 20 icônes, `si*` → `{ path, hex }`) et `TechIcon.js` (`<svg viewBox="0 0 24 24" width height fill={'#'+hex}><path d={path}/></svg>`). CSS : `.inv { filter: invert(var(--inv)) }` avec `--inv: 0` jour / `1` nuit (déjà dans les jetons).

- [ ] **Step 4 : Réécrire `SkillSection.js`** selon la maquette `.grp/.tiles/.tile/.lv` (groupes en lignes, 1 colonne sous 860 px).

- [ ] **Step 5 : Vérifier** — Run: `npm run test:unit && npx playwright test skills` — Expected: tous passés.

- [ ] **Step 6 : Commit** — `git add -A && git commit -m "Section compétences en pilules à logo"`

---

### Task 9 : Contact, animations d'entrée, révélation au défilement, mouvement réduit

**Files:**
- Create: `src/app/components/Reveal.js` (réécriture : pose `is-visible` au lieu de styles inline, `threshold 0.15`, `rootMargin '0px 0px -10% 0px'`, décalage optionnel `delay`), `src/app/components/EntranceSequence.js` (client : pose `html.entrance` au montage sauf si `prefers-reduced-motion`, ou si `html.bi-pending` est présent — le moteur d'intro posera `bi-skipped` pour la déclencher après un skip)
- Modify: `src/app/components/ContactSection.js` (réécriture), `src/app/page.js` (assemblage : Hero, Projets, Parcours, Compétences, Contact), `src/app/globals.css` (keyframes `rise`, `pop`, `in`, classes `.in.d1-4`, `.rv/.rv.is-visible`, survols des cartes et cellules, lueur radiale `--mx/--my`, `@media (prefers-reduced-motion: reduce)` qui neutralise tout)
- Test: `tests/e2e/contact.spec.mjs`, `tests/e2e/motion.spec.mjs`

**Interfaces:**
- Consumes: `PROFILE.contact`.
- Produces: `<section id="contact" data-intro="contact">` : eyebrow, `<h2 data-intro="contact-h2">`, `<p>`, `<form data-intro="contact-form">` avec `<input type="email" name="email" required>` et `<button class="pill pill-acc">Être recontacté →</button>`, envoi `fetch(PROFILE.contact.formspree, { method: 'POST', body: FormData, headers: { Accept: 'application/json' } })`, états `idle | sending | success | error` (succès : le bouton affiche « Merci, à très vite ✓ » et se désactive ; erreur : message « Une erreur est survenue, écrivez-moi directement par e-mail. » et bouton réactivé), `.checks`, ligne « ou directement : <a href="mailto:…">`. Animations : `.in` + `.d1…d4` sur badge/lead/cta/checks ; cartes du hero avec `animation: pop` et délais 0,4 / 0,55 / 0,7 s ; étiquettes 1,0 / 1,15 / 1,3 s ; `html:not(.entrance) .in, html:not(.entrance) .stage .c { animation-play-state: paused }` ; `.rv` sur chaque bloc de section.

- [ ] **Step 1 : Écrire les tests**

```js
// tests/e2e/contact.spec.mjs
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
```

```js
// tests/e2e/motion.spec.mjs
import { test, expect } from '@playwright/test';
test('mouvement réduit : tout est visible immédiatement', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/');
  for (const sel of ['[data-intro="h1"]', '[data-intro="lead"]', '[data-intro="card-photo"]', '[data-intro="competences-h2"]']) {
    const op = await page.locator(sel).evaluate((e) => getComputedStyle(e).opacity);
    expect(Number(op)).toBe(1);
  }
  await ctx.close();
});
test('révélation au défilement', async ({ page }) => {
  await page.goto('/');
  const h2 = page.locator('[data-intro="parcours-h2"]');
  expect(Number(await h2.evaluate((e) => getComputedStyle(e.closest('.rv')).opacity))).toBeLessThan(1);
  await h2.scrollIntoViewIfNeeded();
  await expect.poll(() => h2.evaluate((e) => getComputedStyle(e.closest('.rv')).opacity)).toBe('1');
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test contact motion` — Expected: FAIL.

- [ ] **Step 3 : Réécrire `ContactSection.js`** (client, selon la maquette `.contact/.form/.checks`), `Reveal.js`, `EntranceSequence.js`, les keyframes et règles de survol dans `globals.css` (valeurs du spec §4.6), et `page.js` (`<EntranceSequence />` + les cinq sections, dans l'ordre Hero → Projets → Parcours → Compétences → Contact).

- [ ] **Step 4 : Vérifier** — Run: `npm run test:e2e` — Expected: tout passe sur les deux projets.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Section contact, séquence d'entrée et révélation au défilement"`

---

### Task 10 : Photo, nettoyage, performance

**Files:**
- Create: `public/profile.jpg` (depuis `docs/superpowers/mockups/photo.jpg`, recadrée 3:4 sur le visage, 800×1066, qualité 82 — via `sharp` en script ponctuel `node scripts/prepare-photo.mjs` si `sharp` est résolvable, sinon copie telle quelle)
- Delete: `public/avatar.png`, `src/app/components/SnowEffect.js` (si pas encore fait), classes et jetons orphelins dans `globals.css`
- Modify: `src/app/opengraph-image.js` (vérifier qu'il n'utilise que `Logo`, sinon adapter), `README.md` (section « Tests »)
- Test: `tests/e2e/assets.spec.mjs`

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/assets.spec.mjs
import { test, expect } from '@playwright/test';
test('photo de profil servie et utilisée', async ({ page }) => {
  const res = await page.request.get('/profile.jpg');
  expect(res.ok()).toBe(true);
  await page.goto('/');
  const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => e.currentSrc || e.src));
  expect(srcs.some((s) => s.includes('profile.jpg'))).toBe(true);
  expect(srcs.some((s) => s.includes('avatar.png'))).toBe(false);
});
```

- [ ] **Step 2 : Préparer la photo, remplacer les références `avatar.png`** (Header, HeroStage) par `/profile.jpg`, supprimer `avatar.png` et le code mort.

- [ ] **Step 3 : Vérifier** — Run: `npm run test && npm run build && npm run lint` — Expected: tout passe, build sans avertissement sur des classes inconnues.

- [ ] **Step 4 : Mesurer** — Run: `npx next start -p 3100` puis `npx lighthouse http://127.0.0.1:3100/?intro=0 --preset=desktop --only-categories=performance --quiet --chrome-flags="--headless"` — Expected: Performance ≥ 90. Si en dessous : vérifier `priority` sur la photo, poids des couvertures, et que le canvas ne tourne pas hors écran.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Photo de profil, nettoyage des anciens styles et vérification des performances"`

---

## Self-review

- **Couverture du spec** : §4.1–4.2 (tâche 2), §4.3 nav/pied (4), hero (5), projets (6), parcours (7), compétences (8), contact (9), §4.4 fond (5), §4.5 nuit (2, 4), §4.6 mouvement (5, 6, 9), §4.7 responsive (projet `mobile` de chaque test), §4.8 composants et photo (4, 10), §3 contrat `data-bi-theme` / `nosnow` (2, 5), JSON-LD Malt (4). La route `/beta` n'est pas touchée ici : elle continue de rendre les composants (réécrits), son moteur ne trouvera plus ses anciens sélecteurs — c'est le chantier B qui la supprime.
- **Cohérence des noms** : `data-intro` listés par tâche et réutilisés tels quels par le plan B ; `PROFILE`, `PROJECTS`, `featuredProject()`, `otherProjects()`, `PROJECT_IMAGES`, `EXPERIENCES`, `EDUCATION`, `SKILL_GROUPS`, `iconFor()`, événement `snow:change`, attribut `html[data-snow]`, classes `is-scrolled`, `is-active`, `is-visible`, `entrance`, `bi-skipped`.
- **Review Focus** : chaque ligne a son test (9 motion, 4 nav thème, 5 neige off, 6 filtres, 9 contact erreur).
