# Intro « le site se construit » v2 — plan d'implémentation (chantier B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter le moteur d'intro à curseurs sur la nouvelle page d'accueil, avec une frappe plus rapide, des curseurs plus précis, de nouvelles tâches (rotation, interrupteur, ciel, déploiement), des erreurs corrigées tirées au sort, des easter eggs et deux déclencheurs cachés.

**Architecture:** Le moteur actuel (`src/app/beta/buildIntroEngine.js`, un seul fichier) est déplacé dans `src/app/intro/` et découpé : les parties **pures** (frappe, mouvement, tirages, dialogues, garde-fous) deviennent des modules sans DOM testés avec `node --test` ; le plan de construction, les tâches et l'overlay restent dans le moteur, qui lit le DOM par les attributs `data-intro` posés par le chantier A. Un générateur aléatoire **seedable** (`rng.js`) rend chaque passage reproductible en test (`?seed=`). Les paramètres d'URL `intro=0|fast|debug`, `seed`, `egg`, `mistakes` servent uniquement aux tests et à la mesure.

**Tech Stack:** JavaScript vanilla (générateurs, `requestAnimationFrame`, SVG), React 19 pour le montage, `node --test`, `@playwright/test` (installé par le plan A).

**Spec:** `docs/superpowers/specs/2026-11-03-refonte-portfolio-et-intro-curseurs-design.md` (sections 3, 5 et 7). Prérequis : plan A terminé (`docs/superpowers/plans/2026-11-03-refonte-visuelle-portfolio.md`), en particulier les attributs `data-intro` et le contrat `data-bi-theme` / `nosnow`.

## Global Constraints

- Le moteur **ne crée ni ne supprime aucun nœud** dans l'arbre React ; il pose `data-bi` (tokens `hide ph noimg nocolor sel settle paint nosnow`), modifie des nœuds texte et des styles inline, et **restaure tout** au `finish()`. Exceptions autorisées : classe `bi-pending` puis `bi-skipped` (skip) ou `bi-done` (intro complète) sur `<html>`, attribut `data-bi-theme` sur `<html>`. (`bi-done` ajouté après la relecture du chantier A : sans lui, la séquence d'entrée reste en pause et le hero resterait invisible après une intro complète ; le CSS de `globals.css` le gère déjà, voir `tests/e2e/review.spec.mjs`.)
- Le moteur ne lit ni n'écrit `localStorage` (sauf `sessionStorage.introSeen`), ne déclenche jamais les gestionnaires React des boutons neige/thème/CV.
- Pas d'intro si : `prefers-reduced-motion`, `innerWidth < 860`, `navigator.webdriver`, `?intro=0`, `sessionStorage.introSeen`.
- Valeurs cibles (spec §5.2–5.3) : frappe 8–20 ms/caractère, espace +0–15 ms, pauses 1 % de 60–140 ms, rafales 2–4 caractères au-delà de 80 caractères ; courbure 2–7 % de `min(dist, 600)` ; micro-correction 2–3 px en 150 ms ; pause avant clic 80–150 ms ; vitesse de drag 0,55–0,7 ; orbite rayon 36 / tangente 80 ; durée totale visée 35–50 s.
- Easter eggs : au plus un par passage ; poids copine 0,20, prod 0,10, console 0,10, thème 0,10, recruteur 0,10, aucun 0,40. Curseur copine : libellé exact `copine`, couleur `#ff5c8a`, échelle 0,85.
- Erreurs : la faute de frappe est toujours jouée ; deux autres sont tirées parmi six (`wrong-image`, `tilted-card`, `caps`, `wrong-color`, `misaligned`, `title-too-big`).
- Pas de ski dans les répliques. Messages de commit en français, sans `Co-Authored-By`.

## Review Focus

1. Un skip en pleine frappe (nœud texte partiellement rempli) doit rendre le texte complet d'origine → test de restauration (tâche 6) avec skip à 2 s et à 6 s.
2. Visiteur ayant la neige désactivée : la tâche `toggle` est sautée et la neige reste éteinte après l'intro → test tâche 5.
3. Redimensionnement de la fenêtre sous 860 px pendant l'intro : l'intro s'arrête et restaure → test tâche 6.
4. Onglet caché pendant l'intro (`visibilitychange`) : le tempo ne doit pas « rattraper » d'un coup au retour (dt plafonné à 50 ms, déjà en place) → test tâche 10.
5. Saisie de « ski » dans le champ e-mail du contact ne doit pas déclencher le skieur → test tâche 9.

---

### Task 1 : Déplacement, garde-fous, paramètres de test

**Files:**
- Create: `src/app/intro/engine.js` (contenu de `buildIntroEngine.js` déplacé, export `startBuildIntro(options)`), `src/app/intro/intro.css` (contenu de `buildIntro.css`), `src/app/intro/BuildIntro.js` (composant client), `src/app/intro/gating.js`, `src/app/intro/rng.js`, `src/app/intro/params.js`
- Modify: `src/app/page.js` (monter `<BuildIntro />` et le script `bi-pending`), `src/app/globals.css` (rien) 
- Delete: `src/app/beta/` (page, BuildIntro, engine, css)
- Test: `tests/unit/gating.test.js`, `tests/unit/rng.test.js`, `tests/e2e/intro-gating.spec.mjs`

**Interfaces:**
- Produces:
  - `gating.js` : `shouldAutoplay({ reducedMotion, width, webdriver, search, sessionSeen }) → boolean` (faux si l'un des cinq garde-fous s'applique ; `search` est `location.search`).
  - `params.js` : `readParams(search) → { mode: 'auto' | 'off' | 'fast' | 'debug', seed: number | null, egg: string | null, mistakes: string[] | null }` (`intro=fast` ⇒ tempo × 6 ; `intro=debug` ⇒ `window.__intro = { plan(), play(), skip(), events: string[] }`, tempo normal).
  - `rng.js` : `createRng(seed) → () => number` (mulberry32), `rand(rng, a, b)`, `pick(rng, array)`, `weighted(rng, [{ id, weight }]) → id`.
  - `BuildIntro.js` : lit `readParams`, appelle `shouldAutoplay`, monte `startBuildIntro({ autoplay, tempoScale, seed, egg, mistakes, debug })`, pose `sessionStorage.introSeen = '1'` sur l'événement `finish` (complet ou skip) ; le script bloquant `bi-pending` n'est injecté que si les conditions d'autoplay côté serveur ne sont pas exclues (il garde ses propres garde-fous : `matchMedia`, `innerWidth`, `webdriver`, `search`, `sessionStorage`).

- [ ] **Step 1 : Écrire les tests unitaires**

```js
// tests/unit/gating.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldAutoplay } from '../../src/app/intro/gating.js';
const ok = { reducedMotion: false, width: 1280, webdriver: false, search: '', sessionSeen: false };
test('autoplay par défaut', () => assert.equal(shouldAutoplay(ok), true));
test('chaque garde-fou coupe', () => {
  assert.equal(shouldAutoplay({ ...ok, reducedMotion: true }), false);
  assert.equal(shouldAutoplay({ ...ok, width: 859 }), false);
  assert.equal(shouldAutoplay({ ...ok, webdriver: true }), false);
  assert.equal(shouldAutoplay({ ...ok, search: '?intro=0' }), false);
  assert.equal(shouldAutoplay({ ...ok, sessionSeen: true }), false);
  assert.equal(shouldAutoplay({ ...ok, webdriver: true, search: '?intro=fast' }), true, 'fast force même sous webdriver');
});
```

```js
// tests/unit/rng.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng, weighted } from '../../src/app/intro/rng.js';
test('même seed, même suite', () => { const a = createRng(42), b = createRng(42); for (let i = 0; i < 5; i++) assert.equal(a(), b()); });
test('weighted respecte les poids', () => {
  const rng = createRng(7); const n = { a: 0, b: 0 };
  for (let i = 0; i < 20000; i++) n[weighted(rng, [{ id: 'a', weight: 0.3 }, { id: 'b', weight: 0.7 }])]++;
  assert.ok(Math.abs(n.a / 20000 - 0.3) < 0.015);
});
```

- [ ] **Step 2 : Écrire le test e2e**

```js
// tests/e2e/intro-gating.spec.mjs
import { test, expect } from '@playwright/test';
test('/beta n\'existe plus', async ({ page }) => { const r = await page.goto('/beta'); expect(r.status()).toBe(404); });
test('intro=0 : pas de HUD, page visible', async ({ page }) => {
  await page.goto('/?intro=0');
  await expect(page.locator('.bi-hud')).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
});
test('intro=fast : HUD présent, puis rejouer disponible', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/?intro=fast&seed=1');
  await expect(page.locator('.bi-hud')).toBeVisible();
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 30000 });
  expect(await page.evaluate(() => sessionStorage.getItem('introSeen'))).toBe('1');
});
test('mobile : jamais d\'intro', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/?intro=fast');
  await expect(page.locator('.bi-hud')).toHaveCount(0);
});
```

- [ ] **Step 3 : Lancer, vérifier l'échec** — Run: `npm run test:unit && npx playwright test intro-gating` — Expected: FAIL.

- [ ] **Step 4 : Déplacer et brancher.** `git mv` des fichiers de `src/app/beta/` vers `src/app/intro/`, suppression de `src/app/beta/page.js`, écriture de `gating.js`, `params.js`, `rng.js`, `BuildIntro.js` ; dans `engine.js`, remplacer `Math.random()` par le `rng` reçu en option et multiplier `tempo()` par `tempoScale`. Le plan de construction ne trouvera plus ses anciens sélecteurs : c'est normal jusqu'à la tâche 4 ; pour que `fast` termine dès maintenant, `buildPlan` doit tolérer un plan vide (fin immédiate).

- [ ] **Step 5 : Vérifier** — Run: `npm run test:unit && npx playwright test intro-gating` — Expected: tout passe.

- [ ] **Step 6 : Commit** — `git add -A && git commit -m "Déplacement du moteur d'intro sur l'accueil avec garde-fous et paramètres de test"`

---

### Task 2 : Frappe rapide par rafales

**Files:**
- Create: `src/app/intro/typing.js`
- Modify: `src/app/intro/engine.js` (`typeNodes` utilise `typingPlan`)
- Test: `tests/unit/typing.test.js`

**Interfaces:**
- Produces: `charDelay(ch, rng) → ms` (8–20, +0–15 si espace, +60–140 dans 1 % des cas) ; `burstSize(totalLength, rng) → 1 | 2 | 3 | 4` (1 si `totalLength ≤ 80`) ; `typingPlan(text, rng) → Array<{ upTo: number, delay: number }>` (positions cumulées et délai avant chaque rafale, `upTo` final = `text.length`).

- [ ] **Step 1 : Écrire les tests**

```js
// tests/unit/typing.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { charDelay, burstSize, typingPlan } from '../../src/app/intro/typing.js';
test('délais dans la fourchette', () => { const rng = createRng(1); for (let i = 0; i < 2000; i++) { const d = charDelay('a', rng); assert.ok(d >= 8 && d <= 160, d); } });
test('rafales seulement au-delà de 80 caractères', () => { const rng = createRng(2); for (let i = 0; i < 100; i++) { assert.equal(burstSize(80, rng), 1); const b = burstSize(81, rng); assert.ok(b >= 2 && b <= 4); } });
test('un paragraphe de 300 caractères se tape à 60–90 c/s', () => {
  const rng = createRng(3); const text = 'x'.repeat(300);
  const plan = typingPlan(text, rng); const total = plan.reduce((a, s) => a + s.delay, 0) / 1000;
  assert.equal(plan.at(-1).upTo, 300);
  const cps = 300 / total; assert.ok(cps >= 60 && cps <= 90, cps);
});
test('un titre court se tape caractère par caractère', () => { const plan = typingPlan('Projets', createRng(4)); assert.equal(plan.length, 7); });
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npm run test:unit` — Expected: FAIL.

- [ ] **Step 3 : Écrire `typing.js`** et remplacer dans `typeNodes` la boucle caractère par caractère par l'itération sur `typingPlan` (`node.data = full.slice(0, step.upTo)` puis `yield* wait(step.delay / 1000)`) ; conserver la branche `typo` (faute de frappe scriptée) en la faisant passer par `charDelay`.

- [ ] **Step 4 : Vérifier** — Run: `npm run test:unit` — Expected: tout passe.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Frappe plus rapide, par rafales sur les paragraphes"`

---

### Task 3 : Précision et rythme des curseurs

**Files:**
- Create: `src/app/intro/motion.js`
- Modify: `src/app/intro/engine.js` (`moveTo`, `physics`, `home`, toutes les tâches avant `c.press = 1`)
- Test: `tests/unit/motion.test.js`

**Interfaces:**
- Produces: `bendFor(dist, rng) → px` (signe aléatoire, `[0.02, 0.07] × min(dist, 600)`) ; `settleOffset(rng) → { dx, dy }` (norme 2–3 px) ; `preClickPause(rng) → s` (0,08–0,15) ; `dragSpeed(rng) → number` (0,55–0,7) ; `IDLE = { radius: 36, tangent: 80, drift: 6 }` ; `approachEase(t)` (easeOut cubique renforcé sur les 15 derniers pour cent : dérivée à t=1 < 0,2).
- Dans `engine.js` : nouvelle primitive `function* settle(c, target)` (micro-correction 150 ms vers `target()` depuis la position d'arrivée décalée de `settleOffset`) et `function* click(c)` (= `preClickPause` puis `c.press = 1`) utilisée par toutes les tâches à la place de `c.press = 1` direct.

- [ ] **Step 1 : Écrire les tests**

```js
// tests/unit/motion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { bendFor, settleOffset, preClickPause, dragSpeed, approachEase, IDLE } from '../../src/app/intro/motion.js';
test('courbure 2–7 % plafonnée à 600 px', () => { const rng = createRng(1); for (let i = 0; i < 500; i++) { const b = Math.abs(bendFor(1000, rng)); assert.ok(b >= 12 && b <= 42, b); } });
test('micro-correction 2–3 px', () => { const rng = createRng(2); for (let i = 0; i < 200; i++) { const { dx, dy } = settleOffset(rng); const n = Math.hypot(dx, dy); assert.ok(n >= 2 && n <= 3, n); } });
test('pause avant clic et vitesse de drag', () => { const rng = createRng(3); for (let i = 0; i < 200; i++) { const p = preClickPause(rng); assert.ok(p >= 0.08 && p <= 0.15); const s = dragSpeed(rng); assert.ok(s >= 0.55 && s <= 0.7); } });
test('easing : arrivée freinée', () => { assert.equal(approachEase(0), 0); assert.equal(approachEase(1), 1); assert.ok(approachEase(1) - approachEase(0.95) < 0.02); assert.ok(approachEase(0.5) > 0.5); });
test('orbite réduite', () => { assert.equal(IDLE.radius, 36); assert.equal(IDLE.tangent, 80); });
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npm run test:unit` — Expected: FAIL.

- [ ] **Step 3 : Écrire `motion.js` et intégrer** : `moveTo` prend `bendFor` par défaut, utilise `approachEase` hors drag, et enchaîne `settle` quand `o.settle !== false` ; `physics` utilise `IDLE` (`R = IDLE.radius`, `tang = IDLE.tangent × swirl`, dérive `IDLE.drift`) et `home(c)` renvoie le centre de la prochaine tâche du curseur décalé de 40 px vers le haut (ou le curseur reste où il est s'il n'a plus de tâche) ; les tâches `image`, `dup`, `box`, `guide` utilisent `dragSpeed(rng)`.

- [ ] **Step 4 : Vérifier** — Run: `npm run test:unit && npx playwright test intro-gating` — Expected: tout passe (l'intro `fast` termine toujours).

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Curseurs plus précis : courbure réduite, micro-correction, pause avant clic"`

---

### Task 4 : Plan de construction sur la nouvelle page

**Files:**
- Create: `src/app/intro/plan.js`
- Modify: `src/app/intro/engine.js` (remplacer `buildPlan` interne par l'import)
- Test: `tests/e2e/intro-plan.spec.mjs`

**Interfaces:**
- Consumes: attributs `data-intro` du plan A (`nav`, `hero`, `sky`, `topo`, `ridge-1..4`, `snow`, `badge`, `h1`, `lead`, `cta-contact`, `cta-cv`, `cta-projects`, `checks`, `stage`, `card-left`, `card-photo`, `card-right`, `tag-1..3`, `snow-toggle`, `projets-*`, `filters`, `featured`, `featured-link`, `featured-image`, `grid`, `card`, `parcours-*`, `cell`, `edu`, `competences-*`, `grp`, `tile`, `contact-*`, `contact-form`, `footer`).
- Produces: `buildPlan(root, helpers, options) → Task[]` où `helpers = { T, box, type, title, image, dupGroup, isVisible, textNodesOf, q, qa }` sont les fabriques existantes du moteur et `options = { snowEnabled: boolean, mistakes: string[] }`. Kinds de tâches : existants (`guide box type title dup dupoops edit image color comment resolve fix paint line`) + nouveaux (`rotate`, `toggle`, `deploy`). Ordre : nav → hero (ciel `paint` sur `sky` par Design ; `line` sur `ridge-1`, `ridge-2`, `ridge-3` ; `box`+`type` badge/h1/lead ; boutons ; coches ; cartes : `box` + `image` + `rotate` ; étiquettes ; `toggle` neige si `snowEnabled`) → projets (titres, filtres en `dupGroup`, phare : `box`, `type`, `image`, `color` sur le bouton ; grille en `dupGroup` avec `image` par carte) → parcours (`dupGroup` cellules avec `edit` du h3, formations) → compétences (`dupGroup` par groupe, pilules en `dupGroup`) → contact (`paint` doux non, simple `box`/`type`) → pied de page. Les dépendances implicites parent→enfant restent (boucle existante).
- Mode `debug` : `window.__intro.plan()` renvoie `tasks.map((t) => ({ kind: t.kind, intro: t.el?.dataset?.intro ?? null }))`.

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/intro-plan.spec.mjs
import { test, expect } from '@playwright/test';
test('le plan couvre toutes les sections et les nouveaux gestes', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/?intro=debug&seed=1');
  await page.waitForFunction(() => window.__intro?.plan().length > 0);
  const plan = await page.evaluate(() => window.__intro.plan());
  const kinds = new Set(plan.map((t) => t.kind));
  for (const k of ['box', 'type', 'title', 'dup', 'image', 'paint', 'line', 'rotate', 'toggle', 'color', 'comment', 'deploy']) expect(kinds, k).toContain(k);
  const intros = new Set(plan.map((t) => t.intro));
  for (const s of ['nav', 'sky', 'ridge-1', 'ridge-2', 'ridge-3', 'h1', 'lead', 'card-photo', 'card-left', 'snow-toggle', 'featured', 'card', 'cell', 'edu', 'tile', 'contact-form', 'footer']) expect(intros, s).toContain(s);
  expect(plan.length).toBeGreaterThan(60);
});
test('neige désactivée : pas de tâche toggle', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/?intro=debug&seed=1');
  await page.waitForFunction(() => window.__intro?.plan().length > 0);
  expect((await page.evaluate(() => window.__intro.plan())).some((t) => t.kind === 'toggle')).toBe(false);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test intro-plan` — Expected: FAIL.

- [ ] **Step 3 : Écrire `plan.js`** avec les sélecteurs `[data-intro="…"]` et l'ordre ci-dessus ; `applyInitialState` masque aussi `sky` (token `paint`), les crêtes (`hide`), pose `nosnow` sur le hero quand une tâche `toggle` existe. Les kinds `rotate`, `toggle`, `deploy` sont enregistrés dans `jobs` avec un corps minimal (délai de 0,3 s, marquage done) — remplis en tâche 5.

- [ ] **Step 4 : Vérifier** — Run: `npx playwright test intro-plan intro-gating` — Expected: tout passe.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Plan de construction de l'intro sur la nouvelle page"`

---

### Task 5 : Nouveaux gestes — rotation, interrupteur, ciel, déploiement

**Files:**
- Modify: `src/app/intro/engine.js` (`jobs.rotate`, `jobs.toggle`, `jobs.paint` adapté au ciel, `jobs.line` sur polygones, `finalJob` avec `deploy`), `src/app/intro/intro.css` (`[data-bi~="hide"]` sur SVG via `visibility`, poignée de rotation, barre de déploiement `.bi-deploy`), `src/app/intro/cursor.js` (extraction de `SHAPES` et `Cursor`, nouvelle forme `rotate`)
- Test: `tests/e2e/intro-gestures.spec.mjs`

**Interfaces:**
- `jobs.rotate(c, t)` : `t.el` = carte, `t.angle` = angle final (−6 / +6) ; le curseur prend la forme `rotate`, va sur la poignée (point au-dessus du centre haut de la carte, overlay : petit cercle relié par un trait), drag en arc, la carte reçoit `style.setProperty('--r', angle + 'deg')` progressivement (via `saveStyle`), un badge « −6° » suit ; restauré par `restoreDom`.
- `jobs.toggle(c, t)` : va sur `[data-intro="snow-toggle"]`, `click`, enfonce visuellement le bouton (`data-bi~="pressed"` 150 ms, CSS `transform: scale(.92)`), retire `nosnow` du hero ; ne déclenche jamais `onClick`.
- `jobs.paint` sur `sky` : dévoilement circulaire existant appliqué à `[data-intro="sky"]` ; Design dit une réplique du pool `paint`.
- `jobs.line` : pour chaque `ridge-n`, points lus depuis l'attribut `points` du polygone convertis en coordonnées page (comme aujourd'hui pour la crête), tracé au stylo, puis retrait de `hide`.
- `finalJob` : après le clic « Mettre en ligne », `hud` affiche `.bi-deploy` (« Build… » avec barre indéterminée 1,2 s, puis « Déployé ✓ » 0,8 s) avant la sortie des curseurs ; `events.push('deployed')` en mode debug.
- Mode `debug` : `window.__intro.events` reçoit `task:<kind>:<intro>` à chaque tâche terminée.

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/intro-gestures.spec.mjs
import { test, expect } from '@playwright/test';
test.skip(({ browserName }, info) => info.project.name !== 'desktop');
test('rotation, interrupteur et déploiement sont joués puis restaurés', async ({ page }) => {
  await page.goto('/?intro=0');
  const before = await page.locator('[data-intro="card-right"]').evaluate((e) => getComputedStyle(e).transform);
  await page.goto('/?intro=fast&intro=debug&seed=1');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  const events = await page.evaluate(() => window.__intro.events);
  expect(events).toContain('task:rotate:card-right');
  expect(events).toContain('task:toggle:snow-toggle');
  expect(events).toContain('task:paint:sky');
  expect(events).toContain('deployed');
  expect(await page.locator('[data-intro="card-right"]').evaluate((e) => getComputedStyle(e).transform)).toBe(before);
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'on');
  await expect(page.locator('[data-intro="hero"]')).not.toHaveAttribute('data-bi', /.*/);
});
test('neige désactivée : reste éteinte après l\'intro', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('snow', 'off'));
  await page.goto('/?intro=fast&seed=1');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  await expect(page.locator('html')).toHaveAttribute('data-snow', 'off');
});
```

Note : `readParams` doit accepter `intro=fast&intro=debug` (les deux drapeaux cumulés : `mode: 'fast'`, `debug: true`).

- [ ] **Step 2 : Lancer, vérifier l'échec** — Run: `npx playwright test intro-gestures` — Expected: FAIL.

- [ ] **Step 3 : Implémenter** les quatre gestes, la forme de curseur `rotate` (flèche courbe, 28×28, contour blanc), le CSS de la poignée et de la barre de déploiement, le journal `events`.

- [ ] **Step 4 : Vérifier** — Run: `npx playwright test intro-gestures intro-plan` — Expected: tout passe.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Nouveaux gestes de l'intro : rotation, interrupteur neige, ciel et déploiement"`

---

### Task 6 : Restauration du DOM et interruptions

**Files:**
- Modify: `src/app/intro/engine.js` (`finish` pose `html.bi-skipped` si skip ; écoute `resize` → skip si `innerWidth < 860` ; `visibilitychange` ne change rien de plus)
- Test: `tests/e2e/intro-restore.spec.mjs`

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/intro-restore.spec.mjs
import { test, expect } from '@playwright/test';
test.skip((_, info) => info.project.name !== 'desktop');
const snapshot = (page) => page.evaluate(() => [document.querySelector('header').outerHTML, document.querySelector('main').outerHTML, document.querySelector('footer').outerHTML].join('\n').replace(/\s+/g, ' ').replace(/ class="([^"]*)"/g, (m, c) => ' class="' + c.split(' ').filter((x) => !/^is-|^rv$|^in$|^d\d$/.test(x)).sort().join(' ') + '"'));
test('intro complète : DOM identique', async ({ page }) => {
  await page.goto('/?intro=0'); const ref = await snapshot(page);
  await page.goto('/?intro=fast&seed=2'); await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  expect(await snapshot(page)).toBe(ref);
});
for (const ms of [2000, 6000]) test(`skip à ${ms} ms : DOM identique et bi-skipped`, async ({ page }) => {
  await page.goto('/?intro=0'); const ref = await snapshot(page);
  await page.goto('/?seed=2'); await page.waitForTimeout(ms); await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveClass(/bi-skipped/);
  expect(await snapshot(page)).toBe(ref);
  await expect(page.locator('h1')).toHaveText('Développeur fullstack,de Salesforce au mobile.');
});
test('passage sous 860 px : arrêt et restauration', async ({ page }) => {
  await page.goto('/?intro=0'); const ref = await snapshot(page);
  await page.goto('/?seed=2'); await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 800, height: 800 });
  await expect(page.locator('.bi-hud')).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 800 });
  expect(await snapshot(page)).toBe(ref);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** — Expected: FAIL (`bi-skipped` absent, et probablement des écarts de restauration à corriger).

- [ ] **Step 3 : Corriger** : `finish(wasSkipped)` ajoute `bi-skipped` si skip, sinon `bi-done` ; `restoreDom` retire aussi `data-bi-theme` et les propriétés `--r`, `--bi-*` posées ; `onResize` déclenche `finish(true)` seulement si la largeur passe sous 860 (sinon conserver l'arrêt actuel sur redimensionnement) — adapter le test si le comportement choisi est « tout redimensionnement arrête », ce qui est acceptable.

- [ ] **Step 4 : Vérifier** — Run: `npx playwright test intro-restore` — Expected: 4 passed.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Restauration du DOM vérifiée après intro complète, skip et redimensionnement"`

---

### Task 7 : Erreurs corrigées et dialogues

**Files:**
- Create: `src/app/intro/mistakes.js`, `src/app/intro/dialogue.js`
- Modify: `src/app/intro/plan.js` (applique les erreurs tirées), `src/app/intro/engine.js` (tâches `wrong-image`, `caps`, `wrong-color`, `title-too-big`, `tilted-card` ; `say()` passe par `dialogue.js`)
- Test: `tests/unit/mistakes.test.js`, `tests/e2e/intro-mistakes.spec.mjs`

**Interfaces:**
- `mistakes.js` : `MISTAKES = ['wrong-image', 'tilted-card', 'caps', 'wrong-color', 'misaligned', 'title-too-big']`, `pickMistakes(rng, forced?: string[]) → string[]` (2 distincts, ou `forced` filtré sur les ids valides).
- `dialogue.js` : `LINES = { open: [...], guides: [...], typing: [...], typo: [...], paint: [...], oops: [...], fix: [...], wrongImage: [...], tilted: [...], caps: [...], color: [...], titleBig: [...], done: [...] }` (≥ 3 variantes chacune, sans mots du ski), `line(rng, key) → string`.
- Mise en œuvre dans le plan : `wrong-image` → la tâche `image` d'une carte de la grille reçoit `wrongFile` (couverture d'une autre carte) et une tâche `fix-image` suit ; `tilted-card` → `rotate` de `card-right` avec `angle: 18` puis `rotate` correctif à 6 par Design après un commentaire de Mathieu ; `caps` → `title` de `parcours-h2` avec `caps: true` (frappe en majuscules, sélection, re-frappe) ; `wrong-color` → `color` du `cta-contact` avec `pick: 2` (vert) puis `color` correctif `pick: 3` ; `misaligned` → `dupoops` existant sur la 3ᵉ cellule ; `title-too-big` → `comment` « trop gros le titre ? » sur `h1` puis `type` avec `grow` inversé (⌘ − par paliers) et `resolve`.
- Mode debug : `events` reçoit `mistake:<id>` quand l'erreur est jouée.

- [ ] **Step 1 : Écrire les tests**

```js
// tests/unit/mistakes.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { MISTAKES, pickMistakes } from '../../src/app/intro/mistakes.js';
import { LINES, line } from '../../src/app/intro/dialogue.js';
test('deux erreurs distinctes et valides', () => { const rng = createRng(5); for (let i = 0; i < 200; i++) { const m = pickMistakes(rng); assert.equal(m.length, 2); assert.notEqual(m[0], m[1]); m.forEach((x) => assert.ok(MISTAKES.includes(x))); } });
test('forçage filtré', () => assert.deepEqual(pickMistakes(createRng(1), ['caps', 'inconnu']), ['caps']));
test('pools de répliques : 3 variantes minimum, sans ski', () => { for (const [k, v] of Object.entries(LINES)) { assert.ok(v.length >= 3, k); v.forEach((s) => assert.ok(!/ski|piste|neige|remont/i.test(s), s)); } assert.ok(LINES.open.includes(line(createRng(1), 'open'))); });
```

```js
// tests/e2e/intro-mistakes.spec.mjs
import { test, expect } from '@playwright/test';
test.skip((_, info) => info.project.name !== 'desktop');
for (const id of ['wrong-image', 'tilted-card', 'caps', 'wrong-color', 'misaligned', 'title-too-big']) test(`erreur ${id} jouée et restaurée`, async ({ page }) => {
  await page.goto('/?intro=0'); const h1 = await page.locator('h1').innerText();
  await page.goto(`/?intro=fast&intro=debug&seed=3&mistakes=${id}`);
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  expect(await page.evaluate(() => window.__intro.events)).toContain(`mistake:${id}`);
  expect(await page.locator('h1').innerText()).toBe(h1);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec.**

- [ ] **Step 3 : Implémenter** `mistakes.js`, `dialogue.js`, les six variantes dans `plan.js`/`engine.js`, et brancher `?mistakes=` via `readParams`.

- [ ] **Step 4 : Vérifier** — Run: `npm run test:unit && npx playwright test intro-mistakes intro-restore` — Expected: tout passe.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Erreurs corrigées tirées au sort et pools de répliques"`

---

### Task 8 : Easter eggs

**Files:**
- Create: `src/app/intro/eggs.js`
- Modify: `src/app/intro/engine.js` (quatrième curseur temporaire, tâches `egg-copine`, `egg-prod`, `egg-console`, `egg-theme`, `egg-recruiter`), `src/app/intro/cursor.js` (formes `robot`, `tie`), `src/app/intro/intro.css` (toast rouge/vert, chip `console.log`, curseur `--scale`)
- Test: `tests/unit/eggs.test.js`, `tests/e2e/intro-eggs.spec.mjs`

**Interfaces:**
- `eggs.js` : `EGGS = [{ id: 'copine', weight: 0.2 }, { id: 'prod', weight: 0.1 }, { id: 'console', weight: 0.1 }, { id: 'theme', weight: 0.1 }, { id: 'recruiter', weight: 0.1 }, { id: 'none', weight: 0.4 }]`, `pickEgg(rng, forced?: string) → id`.
- Curseurs temporaires : `new Cursor(layer, name, color, [], short, { scale })` ; copine = `('copine', '#ff5c8a', 'c', { scale: 0.85 })`, élément `.bi-cur[data-name="copine"]` ; robot = `('Resilience Alpha', GREEN, 'R')` forme `robot` ; recruteur = `('Recruteur', '#3b4453', 'R')` forme `tie`. Ils entrent par un bord, jouent leur scène, sortent, et sont retirés de l'overlay (`el.remove()` est autorisé : l'overlay est hors React).
- Scènes (spec §5.7) : copine après la pose de `card-photo` (tire de 30 px, redresse `--r: 0deg`, bulle « 😍 » 3 s, Mathieu « … » puis « bon. » et remet `--px/--py/--r`) ; prod pendant la grille (toast sur la carte `data-category="DevOps"`, compteur, « rétabli en 1,8 s ✓ ») ; console après `lead` (chip `console.log('coucou')` dans l'overlay sous le paragraphe, Mathieu le sélectionne, keycap « Suppr », réplique) ; thème après le hero (`html[data-bi-theme]` = opposé du thème courant, « oups », 1,5 s, retrait) ; recruteur avant la fin (va sur `cta-cv`, `data-bi~="pressed"`, icône animée dans l'overlay, « merci 👍 », sort ; **aucun** `click()` réel).
- Mode debug : `events` reçoit `egg:<id>`.

- [ ] **Step 1 : Écrire les tests**

```js
// tests/unit/eggs.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../../src/app/intro/rng.js';
import { pickEgg } from '../../src/app/intro/eggs.js';
test('distribution des easter eggs', () => {
  const rng = createRng(9); const n = {}; const N = 20000;
  for (let i = 0; i < N; i++) { const id = pickEgg(rng); n[id] = (n[id] || 0) + 1; }
  const exp = { copine: 0.2, prod: 0.1, console: 0.1, theme: 0.1, recruiter: 0.1, none: 0.4 };
  for (const [id, p] of Object.entries(exp)) assert.ok(Math.abs(n[id] / N - p) < 0.015, id);
});
test('forçage', () => assert.equal(pickEgg(createRng(1), 'copine'), 'copine'));
```

```js
// tests/e2e/intro-eggs.spec.mjs
import { test, expect } from '@playwright/test';
test.skip((_, info) => info.project.name !== 'desktop');
test('copine : curseur rose, petit, libellé exact', async ({ page }) => {
  await page.goto('/?intro=debug&seed=4&egg=copine');
  const cur = page.locator('.bi-cur[data-name="copine"]');
  await expect(cur).toBeVisible({ timeout: 30000 });
  await expect(cur.locator('.bi-tag')).toHaveText('copine');
  expect(await cur.locator('.bi-tag').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(255, 92, 138)');
  expect(await cur.evaluate((e) => getComputedStyle(e).getPropertyValue('--scale').trim())).toBe('0.85');
  await expect(page.locator('.bi-msg', { hasText: '😍' })).toBeVisible({ timeout: 20000 });
});
test('thème par erreur : bascule puis retour, sans toucher localStorage', async ({ page }) => {
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=theme');
  await page.waitForFunction(() => document.documentElement.dataset.biTheme === 'dark', null, { timeout: 30000 });
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  expect(await page.evaluate(() => document.documentElement.dataset.biTheme)).toBeUndefined();
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
});
test('recruteur : aucun téléchargement déclenché', async ({ page }) => {
  let downloads = 0; page.on('download', () => downloads++);
  await page.goto('/?intro=fast&intro=debug&seed=4&egg=recruiter');
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  expect(await page.evaluate(() => window.__intro.events)).toContain('egg:recruiter');
  expect(downloads).toBe(0);
});
for (const id of ['prod', 'console']) test(`egg ${id} joué`, async ({ page }) => {
  await page.goto(`/?intro=fast&intro=debug&seed=4&egg=${id}`);
  await expect(page.locator('.bi-replay')).toBeVisible({ timeout: 40000 });
  expect(await page.evaluate(() => window.__intro.events)).toContain(`egg:${id}`);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec.**

- [ ] **Step 3 : Implémenter** `eggs.js`, l'option `scale` du curseur (`--scale` sur `.bi-cur`, appliqué au `svg` et à l'étiquette), les cinq scènes, `?egg=` dans `readParams`.

- [ ] **Step 4 : Vérifier** — Run: `npm run test:unit && npx playwright test intro-eggs intro-restore` — Expected: tout passe (la restauration doit tenir avec chaque egg : ajouter `egg=copine` et `egg=theme` à un cas de `intro-restore`).

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Easter eggs de l'intro : copine, panne en prod, console.log, thème, recruteur"`

---

### Task 9 : Déclencheurs cachés

**Files:**
- Create: `src/app/intro/secrets.js` (écoute clavier « ski » hors champs de saisie ; bannière console)
- Modify: `src/app/intro/BuildIntro.js` (monte `secrets` au chargement, indépendamment de l'autoplay), `src/app/intro/engine.js` (export `runSkier()` : curseur-skieur qui suit `ridge-3` de gauche à droite en 3 s avec trace pointillée dans l'overlay, puis disparaît), `src/app/intro/intro.css`
- Test: `tests/e2e/intro-secrets.spec.mjs`

**Interfaces:**
- `installSecrets({ onSki }) → () => void` (désinstallation) ; la séquence `s`,`k`,`i` doit être tapée en moins de 1,5 s, hors `input`/`textarea`/`[contenteditable]`.
- `logBanner()` : `console.log` d'une bannière ASCII montagne (lignes de `/\`) suivie de « Curieux ? Le code de cette intro est maison. mathieu.crosnier15@outlook.fr ».

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/intro-secrets.spec.mjs
import { test, expect } from '@playwright/test';
test('bannière console au chargement', async ({ page }) => {
  const logs = []; page.on('console', (m) => logs.push(m.text()));
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
```

- [ ] **Step 2 : Lancer, vérifier l'échec.**

- [ ] **Step 3 : Implémenter** `secrets.js`, `runSkier()` (forme de curseur `skier`, trace pointillée via l'overlay existant ; si l'overlay n'est pas monté — intro finie — le monter le temps de la descente puis le démonter), bannière.

- [ ] **Step 4 : Vérifier** — Run: `npx playwright test intro-secrets` — Expected: 2 passed.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Déclencheurs cachés : skieur au clavier et bannière console"`

---

### Task 10 : Fin, onglet caché, nettoyage et mesure

**Files:**
- Modify: `src/app/intro/engine.js` (plafond `dt ≤ 0.05` conservé, `visibilitychange` : pause de la boucle quand `document.hidden`), `README.md` (section « Intro : paramètres `?intro=…`, `?seed=`, `?egg=`, `?mistakes=` »), `src/app/intro/intro.css` (couleur du curseur Design → `oklch(45% 0.12 240)`)
- Test: `tests/e2e/intro-visibility.spec.mjs`

- [ ] **Step 1 : Écrire le test**

```js
// tests/e2e/intro-visibility.spec.mjs
import { test, expect } from '@playwright/test';
test.skip((_, info) => info.project.name !== 'desktop');
test('onglet caché : le temps de l\'intro ne saute pas au retour', async ({ page }) => {
  await page.goto('/?intro=debug&seed=5');
  await page.waitForTimeout(1500);
  const t0 = await page.evaluate(() => window.__intro.elapsed());
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(200);
  const t1 = await page.evaluate(() => window.__intro.elapsed());
  expect(t1 - t0).toBeLessThan(0.6);
});
```

- [ ] **Step 2 : Lancer, vérifier l'échec** (exposer `window.__intro.elapsed()` en debug).

- [ ] **Step 3 : Implémenter**, mettre à jour le README, changer la couleur de Design.

- [ ] **Step 4 : Vérifier l'ensemble** — Run: `npm run test && npm run build && npm run lint` — Expected: tout passe. Run: `npx lighthouse http://127.0.0.1:3100/?intro=0 --preset=desktop --only-categories=performance --quiet --chrome-flags="--headless"` — Expected: ≥ 90. Mesurer aussi la durée d'un passage normal (`?intro=debug&seed=1`, lire `elapsed()` à l'apparition de `.bi-replay`) — Expected: 35–50 s ; sinon ajuster `tempo()` (facteur global) et consigner la valeur retenue dans le README.

- [ ] **Step 5 : Commit** — `git add -A && git commit -m "Intro : pause quand l'onglet est caché, documentation des paramètres, durée calibrée"`

---

## Self-review

- **Couverture du spec** : §5.1 plan et répartition (tâche 4), §5.2 frappe (2), §5.3 précision (3), §5.4 erreurs (7), §5.5 dialogues (7), §5.6 fin et déploiement (5), §5.7 easter eggs (8) et déclencheurs cachés (9), §5.8 cadre (1, 6, 10), §3 contrat neige/thème (5, 8), performance (10), durée 35–50 s (10), couleur de Design (10), `/beta` supprimée (1).
- **Noms cohérents** : `startBuildIntro(options)`, `shouldAutoplay`, `readParams`, `createRng`/`weighted`, `charDelay`/`burstSize`/`typingPlan`, `bendFor`/`settleOffset`/`preClickPause`/`dragSpeed`/`approachEase`/`IDLE`, `buildPlan(root, helpers, options)`, kinds `rotate toggle deploy`, `pickMistakes`/`MISTAKES`, `LINES`/`line`, `pickEgg`/`EGGS`, `installSecrets`/`runSkier`/`logBanner`, `window.__intro = { plan, play, skip, events, elapsed }`, paramètres `intro seed egg mistakes`, classes `.bi-cur[data-name]`, `.bi-skier`, `.bi-deploy`, `html.bi-skipped`.
- **Review Focus** : 1 → tâche 6 (skips à 2 s et 6 s), 2 → tâche 5, 3 → tâche 6, 4 → tâche 10, 5 → tâche 9.
- **Proportion** : le plan décide des interfaces et des tests ; les corps des tâches de l'intro (scènes) sont décrits en une phrase chacun, à écrire dans le style des `jobs` existants.
