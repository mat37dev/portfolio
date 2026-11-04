# Portfolio - Mathieu Crosnier

Portfolio personnel de Mathieu Crosnier, développeur fullstack (Nantes, France).
Site en production : [mathieucrosnier.fr](https://mathieucrosnier.fr)

## Stack technique

- [Next.js 15](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS 3](https://tailwindcss.com), design system par variables CSS (thème clair/sombre)
- [Lucide React](https://lucide.dev) pour les icônes
- [Vercel Analytics](https://vercel.com/analytics) pour les statistiques de fréquentation
- [Formspree](https://formspree.io) pour le traitement du formulaire de contact

## Démarrage local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement à chaud |
| `npm run build` | Build de production |
| `npm run start` | Démarre le build de production (après `npm run build`) |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm test` | Tests unitaires puis tests de mise en page |
| `npm run test:unit` | Tests unitaires des modules de données (`node --test`) |
| `npm run test:e2e` | Tests Playwright (fenêtres 1280×800 et 390×844, serveur `next dev` sur le port 3100) |

## Tests

- **Unitaires** (`tests/unit/`) : modules purs de `src/app/data/` et table des logos, avec `node --test`.
- **Mise en page** (`tests/e2e/`) : Playwright lance `next dev -p 3100` (ou réutilise un serveur déjà sur ce port) et vérifie les copies, les jetons jour/nuit, la nav, le hero (neige, scène), les projets (filtres), le parcours, les compétences, le contact (Formspree simulé) et le mouvement réduit. Premier lancement : `npx playwright install chromium`.

## Intro « le site se construit »

Sur desktop (≥ 860 px), trois curseurs construisent la page d'accueil sous les yeux du visiteur (`src/app/intro/`). Elle ne se joue pas si le visiteur préfère moins de mouvement, si la fenêtre est étroite, si le navigateur est piloté, ou si elle a déjà été vue dans la session ; un clic, une touche, la molette ou un redimensionnement la passent. Paramètres d'URL réservés aux tests et à la mesure :

| Paramètre | Effet |
|---|---|
| `?intro=0` | Pas d'intro |
| `?intro=fast` | Tempo × 6 (force le lancement, sauf mouvement réduit ou fenêtre étroite) |
| `?intro=debug` | Expose `window.__intro` (`plan()`, `play()`, `skip()`, `events`, `timeline`, `elapsed()`, `egg()`) |
| `?seed=42` | Rend le passage reproductible |
| `?egg=copine\|prod\|console\|theme\|recruiter\|none` | Force l'easter egg du passage |
| `?mistakes=caps,wrong-color` | Force les erreurs jouées (`wrong-image`, `tilted-card`, `caps`, `wrong-color`, `misaligned`, `title-too-big`) |

Durée d'un passage complet sans skip : environ 50 s sur desktop (tempo de base 3,4, accéléré au fil de l'avancement). Déclencheurs cachés : taper « ski » hors d'un champ de saisie, et une bannière dans la console.

## Structure du projet

```
src/app/
├── layout.js              # Layout racine, métadonnées SEO, polices, JSON-LD
├── page.js                 # Page d'accueil (assemble les sections)
├── globals.css              # Design tokens (couleurs, thème clair/sombre)
├── sitemap.js, robots.js    # SEO
├── opengraph-image.js       # Image de partage réseaux sociaux (générée)
└── components/
    ├── Header.js, Footer.js
    ├── HeroSection.js, TimelineSection.js, SkillSection.js
    ├── ProjectSection.js, ContactSection.js
    ├── ThemeToggle.js, SnowEffect.js, ScrollProgress.js, Reveal.js
    └── icons/BrandIcons.js  # Icônes de marque (GitHub, LinkedIn) en SVG
```

## Déploiement

Déployé automatiquement sur [Vercel](https://vercel.com) depuis la branche principale.
