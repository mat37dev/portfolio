# Portfolio — Mathieu Crosnier

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
