# Refonte du portfolio et intro « le site se construit » — document de conception

Date : 3 novembre 2026 · Auteur : Mathieu Crosnier (avec Claude) · Statut : validé en brainstorming, à planifier.

Maquette de référence validée (ouvrir dans un navigateur, elle est autonome) : `docs/superpowers/mockups/portfolio-v2.html` (photo : `docs/superpowers/mockups/photo.jpg`). La maquette fait foi pour le rendu visuel ; ce document fait foi pour tout le reste.

---

## 1. Intention

Le site mathieucrosnier.fr a déjà une intro expérimentale sur `/beta` : trois curseurs (« Mathieu Crosnier », « Design », « Stagiaire ») construisent la page sous les yeux du visiteur (moteur : `src/app/beta/buildIntroEngine.js`, inspiré de swarm-cursors, réécrit). L'animation est bonne, mais le style actuel du site (cartes arrondies, badges pastel, hero « texte à gauche, photo ronde à droite ») est trop daté pour la porter.

Le projet a deux chantiers, dans cet ordre :

- **A. Refondre le style du portfolio** pour qu'il soit moderne, lisible, et à la hauteur de l'animation. Le monde du ski (passion de Mathieu) reste présent, mais dans le système visuel (fond montagne, neige, palette glacier), pas dans les textes.
- **B. Améliorer le moteur d'intro** : frappe plus rapide, curseurs plus précis et un peu plus lents dans le geste, animations plus riches, erreurs corrigées, easter eggs.

Le visiteur type est un recruteur ou un client Malt. Principe directeur, validé : **impressionner sans jamais cacher l'essentiel**. L'animation est un bonus, pas un péage : le contenu reste lisible pendant la construction, le visiteur peut passer l'intro à tout moment, et il relit ensuite à son rythme.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**
- Une seule page qui défile, toutes les sections visibles (pas d'onglets qui cachent du contenu).
- Un style « landing moderne » inspiré de abecedate.app, décliné en bleu glacier.
- Fond montagne/neige dans le hero, mode nuit, animations soignées mais sobres.
- Intro curseurs plus vivante et plus précise, avec des erreurs corrigées et des easter eggs aléatoires.
- L'intro devient l'accueil ; `/beta` disparaît.

**Non-objectifs**
- Pas de nouvelles pages (projets détaillés, blog). Les liens projets pointent vers GitHub / itch.io comme aujourd'hui.
- Pas de refonte du contenu (textes du CV, liste des projets) au-delà des libellés décidés ici.
- Pas de WebGL, pas de bibliothèque d'animation lourde (GSAP, Three). CSS, canvas 2D et `requestAnimationFrame` suffisent.

**Anti-objectifs** (ce qui ferait échouer le projet même s'il « marche »)
- Un style qui surjoue le ski dans les mots (« pistes », « remontées », « altitude » dans les titres). Le ski est visuel, pas verbal.
- Un hero ou des sections où le visiteur ne comprend pas qui est Mathieu et ce qu'il fait en moins de 5 secondes.
- Une intro qu'on ne peut pas passer, ou qui bloque la lecture sur mobile.
- Des textes qui laissent croire que Mathieu cherche une alternance : il est **déjà alternant chez Cloudity** et **freelance sur Malt**.

## 3. Contraintes

- Stack existante : Next.js 15 (app router), React, Tailwind, `next/font/google`, déploiement Vercel, analytics Vercel. Pas de changement de stack.
- Le moteur d'intro ne doit **ni créer ni supprimer de nœuds dans l'arbre React** : il pose des attributs `data-bi`, modifie temporairement des nœuds texte et quelques styles inline, et **restaure tout à l'identique** à la fin ou au skip. L'overlay (curseurs, règles, bulles) vit dans des nœuds ajoutés à `<body>` hors React. Cette règle existe déjà et reste.
- `prefers-reduced-motion: reduce` : pas d'intro, pas de neige, pas d'animations d'entrée ; le site s'affiche directement.
- SEO : les métadonnées, le JSON-LD, le sitemap et `robots` existants restent. Le contenu doit être dans le HTML rendu côté serveur (l'intro masque, elle ne retire pas).
- Accessibilité : contrastes AA, focus visibles, cibles tactiles ≥ 44 px sur mobile, images avec `alt`.
- Performance : Lighthouse Performance ≥ 90 sur desktop, **mesuré intro désactivée** (l'intro masque le H1 et la photo jusqu'à ce qu'ils soient « construits », donc le LCP serait faux par construction). L'intro ne se lance pas quand `navigator.webdriver` est vrai ni quand l'URL porte `?intro=0` ; c'est ce chemin qu'on mesure. La neige en canvas tourne à faible densité ; tout s'arrête quand l'onglet est caché.
- **Contrat moteur ↔ composants** : le moteur ne touche ni à l'état React ni à `localStorage`. Les composants qui ont un état persistant (neige, thème) exposent un **équivalent visuel pilotable par attribut** : le canvas de neige se cache quand le hero porte `data-bi~="nosnow"`, et le thème visuel suit `data-bi-theme="dark|light"` posé sur `<html>` en plus de la classe `.dark` (le CSS traite les deux). Le moteur anime le bouton réel (enfoncement) mais n'appelle pas son gestionnaire de clic ; au `finish()`, les attributs sont retirés et l'état réel reprend le dessus.

---

## 4. Chantier A — Refonte visuelle

### 4.1 Direction

Vocabulaire repris de abecedate.app, adapté : serif d'affichage pour les titres, sans pour le texte, mono pour les petits libellés ; nav flottante en pilule ; halo derrière le hero ; boutons à lueur ; cellules bordées pour les listes structurées ; pastilles « ✓ » sous les appels à l'action. Le corail d'Abécédate devient un **bleu glacier**. La grille de fond d'Abécédate est remplacée par le **fond montagne** (voir 4.4).

### 4.2 Jetons

Typographie (via `next/font/google`) :
- Titres : **DM Serif Display** 400, letter-spacing −0.02em. H1 ≈ clamp(44px, 6.4vw, 78px), H2 de section ≈ clamp(34px, 4vw, 48px), titres de carte 21–36px.
- Texte : **Inter** 400/500/600/700, 16px, line-height 1.6.
- Libellés : **JetBrains Mono** 400/500, 10–11px, letter-spacing 0.08–0.12em, majuscules.

Couleurs, thème jour :
- fond `#ffffff`, fond alterné `#fbfcfe`, carte `#ffffff`
- encre `#161618`, texte `#4b5563`, atténué `#6b7280`
- lignes `#e7ebf0`, lignes au survol `#cfd6df`
- accent `#2f7cf6`, accent doux `#e6f0ff`, lueur `rgba(47,124,246,.35)`
- ciel du hero : dégradé `#e4eefa → #f3f7fd → #ffffff` (0 % / 40 % / 78 %)
- crêtes (trois couches, dégradés verticaux) : `#c9dbef→#f4f8fd`, `#b3c9e4→#f7fafd`, `#9bb6d8→#ffffff`, puis une couche blanche
- lignes de niveau `#c9d7e8` (épaisses `#b3c4da`)

Couleurs, thème nuit :
- fond `#0e131a`, fond alterné `#111822`, carte `#151c26`
- encre `#f2f5f8`, texte `#b6c0cb`, atténué `#8793a1`
- lignes `#243040`, survol `#334257`
- accent `#6f97ff`, accent doux `#1a2740`
- ciel `#0b1a2e → #0d1521 → #0e131a`, étoiles discrètes (opacité 0,7), halo lunaire `rgba(170,200,255,.22)`
- crêtes `#1b2a3f→#0f1826`, `#152233→#0f1621`, `#111b29→#0e131a`
- lignes de niveau `#1f2c3e` / `#2a3a50`

Les logos noirs (Next.js, Symfony, Expo) sont inversés en thème nuit.

Rayons : pilules 999px, cartes 18–24px, chips 999px. Ombres : `0 24px 60px rgba(22,40,70,.14)` sur les cartes du hero, `0 14px 40px rgba(22,22,24,.08)` ailleurs ; en nuit, noires et plus opaques.

### 4.3 Structure de la page (dans l'ordre)

1. **Nav flottante** (fixe, pilule, fond blanc translucide + flou) : photo ronde + « Mathieu Crosnier » en serif + « DÉVELOPPEUR FULLSTACK » en mono bleu ; liens Projets / Parcours / Compétences / Contact avec soulignement bleu de la section active ; **bouton thème** (rond, bordé, icône lune/soleil, c'est le `ThemeToggle` existant) ; bouton « Me contacter » bleu à lueur. Elle se compacte légèrement après 40 px de défilement. Sous 860 px : liens masqués ; restent la photo + le nom, le bouton thème et « Me contacter » (pas de menu hamburger ; les sections se suivent). Les icônes GitHub / LinkedIn du header actuel partent au pied de page.
2. **Hero** (centré, pleine hauteur sur desktop) :
   - pastille mono « ● Freelance disponible · Nantes » (point bleu qui pulse) ;
   - H1 : « Développeur fullstack, / de Salesforce au mobile. » (proposition validée ; peut redevenir le nom si Mathieu change d'avis) ;
   - paragraphe : « Je suis Mathieu, 23 ans, étudiant en Master SIN à l'EPSI Nantes et alternant chez **Cloudity**. Je conçois des applications web et mobiles avec **React, Next.js, Symfony** et la plateforme Salesforce. » ;
   - boutons : « Me contacter → » (bleu), « Télécharger mon CV » (blanc bordé, icône téléchargement, lien `/cv.pdf` en `download`), lien texte « Voir mes projets ↓ » ;
   - coches mono bleues : « ✓ Master SIN · EPSI », « ✓ Alternant chez Cloudity », « ✓ Freelance sur Malt » ;
   - **scène à trois cartes** : couverture SkiMate à gauche (−6°), **photo de profil** au centre (carte blanche, légende mono « Mathieu · Nantes »), couverture Notre cuisine à droite (+6°). Parallaxe douce à la souris (profondeur différente par carte), survol : la carte se redresse et se soulève. Trois étiquettes flottantes : « Alternant chez Cloudity », « 7 projets en ligne », « React · Next.js · Symfony ». Sous 860 px : seule la photo reste (230 px), plus petite pour laisser voir les crêtes.
3. **Projets** : eyebrow « PROJETS », H2 « Sept projets, du mobile au DevOps. », sous-titre, filtres à droite (Tous / Web / Mobile / Jeux vidéo / DevOps — « Tous » par défaut, rien n'est caché au chargement). Grande carte **projet phare** SkiMate (numéro « 01 » bleu serif, chips « Mobile » et « Projet phare », titre, description, ligne meta mono, bouton noir « Voir le projet → », stack en mono ; à droite une carte polaroid de la couverture, inclinée de 2°). Puis grille 3 colonnes des six autres projets : image, titre serif + année mono, description, tags mono. Liens réels : Resilience Alpha, Notre cuisine, CRM Kōdoka, Geek4Fun → GitHub ; Find And Build → itch.io ; Site de covoiturage → pas de lien (la carte indique « Projet d'école · sans lien public » au survol). **SkiMate n'a pas de lien public aujourd'hui** : le bouton renvoie au profil GitHub tant que Mathieu n'en fournit pas un.
4. **Parcours** (fond alterné) : eyebrow, H2 « Quatre ans entre alternances et stages. », sous-titre. **Grille 2×2 de cellules bordées** (expériences) : titre serif « Développeur Salesforce · Cloudity », période mono à droite (en bleu si en cours), description, tags mono. Les quatre expériences actuelles (Cloudity, Esima, Kōdoka, Kamisys). Au survol : fond léger et trait bleu vertical à gauche. Puis **trois cartes de formation** (Master SIN en cours, CDA RNCP 6, BTS SIO SLAM). Le Bac n'apparaît plus.
5. **Compétences** : eyebrow, H2 « Une stack web et mobile, plus Salesforce. ». Groupes en lignes (Frontend, Backend, Salesforce, Mobile & données, Outils & langues), nom du groupe en serif à gauche, **pilules à logo** à droite (logo 18px + nom ; mini-étiquette mono bleue « quotidien » sur les outils du quotidien : React, Next.js, PHP, Apex, Flow, Git ; « natif » / « professionnel » sur les langues). Logos : paquet `simple-icons` (ou SVG inline), Salesforce via un pictogramme nuage maison (le logo officiel n'est pas dans simple-icons).
6. **Contact** : centré, halo bleu en bas, eyebrow, H2 « Un projet, une mission, une question ? », paragraphe, champ e-mail en pilule + bouton « Être recontacté → », coches « ✓ Réponse sous 24 h », « ✓ Nantes ou à distance », « ✓ Missions freelance via Malt », ligne « ou directement : mathieu.crosnier15@outlook.fr ». Le formulaire actuel (nom / e-mail / message, envoi existant) est **remplacé par ce champ unique** ; il envoie par le même mécanisme que le formulaire actuel.
7. **Pied de page** : « Mathieu Crosnier » en serif, liens GitHub · LinkedIn · Malt · © 2026. URL Malt : `https://www.malt.fr/profile/mathieucrosnier` ; elle est aussi ajoutée au `sameAs` du JSON-LD.

### 4.4 Fond montagne (hero)

Mode validé : **« Mixte » avec neige**.
- Ciel : dégradé vertical (jetons 4.2), halo blanc/bleuté centré en haut.
- **Crêtes** : SVG en bas du hero (hauteur ≈ 52 vh, min 360 px), trois couches de polygones aux dégradés dégressifs plus une couche de fond, points de la maquette. Les cartes du hero sont posées dessus (z-index au-dessus).
- **Lignes de niveau** : SVG plein écran, opacité 0,6, traits fins ; **désactivées sous 860 px** (rendu bizarre sur mobile).
- **Neige** : canvas sur toute la hauteur du hero, ≈ 1 flocon pour 11 px de largeur, rayon 0,9–3,1 px, chute 0,25–0,8 px/image, légère dérive sinusoïdale, flocons blancs avec halo bleuté (`rgba(120,165,225,1)`, flou 6 px) pour rester visibles sur fond clair. Remplace l'actuel `SnowEffect` global (les flocons ne descendent plus sur tout le site, seulement dans le hero). Le bouton « désactiver la neige » existant reste, repositionné pour ne pas gêner.
- Les sections suivantes sont sur fond uni (blanc ou alterné) ; **pas** de grille Abécédate.

### 4.5 Mode nuit

Bascule par le bouton existant (`ThemeToggle`, classe `.dark` sur `<html>`, script anti-flash conservé). Jetons de 4.2. Le hero de nuit montre les étoiles et un halo lunaire ; les crêtes passent en bleu nuit.

### 4.6 Mouvement (hors intro curseurs)

Une seule séquence d'entrée orchestrée, jouée **au chargement sans intro** et **après un skip** de l'intro ; **pas** après une intro complète (le hero vient d'être construit sous les yeux du visiteur, on ne le fait pas disparaître pour le refaire apparaître). Pour cela le moteur pose une classe `bi-skipped` sur `<html>` au skip, et `bi-done` à la fin d'une intro complète (le CSS affiche alors le hero au repos, sans animation, puisque la séquence d'entrée restée en pause ne sera jamais jouée) — avec `bi-live` (posée pendant toute la durée de l'intro, pour neutraliser la séquence d'entrée et la révélation au défilement que le moteur remplace), ce sont les trois seules exceptions à la règle « rien que `data-bi` ». Séquence : pastille → H1 ligne par ligne (montée masquée) → paragraphe → boutons → coches → cartes du hero en cascade (0,4 / 0,55 / 0,7 s) → étiquettes (1,0 / 1,15 / 1,3 s). Révélation au défilement des sections (translation 22 px + fondu, 0,8 s), avec léger décalage entre colonnes ; pilules de compétences en cascade.

Survols : cartes projets qui se soulèvent de 8 px, image qui zoome lentement (1,07 en 0,9 s), bouton « Voir le projet → » qui apparaît sur l'image, titre en bleu, **lueur radiale qui suit la souris** à l'intérieur de la carte ; carte phare qui se soulève et dont le polaroid se redresse ; cellules du parcours avec trait bleu ; pilules qui montent de 3 px ; flèches des boutons qui glissent de 4 px. Courbe d'animation commune : `cubic-bezier(.2,.8,.2,1)`.

### 4.7 Responsive

Point de rupture principal : 860 px. En dessous : colonnes simples partout, hero sans cartes latérales ni lignes de niveau, boutons empilés, filtres sous le titre, formulaire empilé, nav réduite. Vérifié dans la maquette à 390 px.

### 4.8 Composants existants

À réécrire : `HeroSection`, `TimelineSection`, `SkillSection`, `ProjectSection`, `ContactSection`, `Header`, `Footer`, `SnowEffect`, `globals.css`, `tailwind.config`. À conserver tels quels ou presque : `ThemeToggle`, `ScrollToTop`, `ScrollProgress`, `Logo` (le logo « Cime en C » reste sur l'icône du site et l'image Open Graph ; dans la nav il est remplacé par la photo), `Reveal` (peut servir à la révélation au défilement), métadonnées, sitemap, robots. Photo de profil : `docs/superpowers/mockups/photo.jpg` → à placer dans `public/` (recadrée en carré ou 3:4, ≤ 200 Ko en WebP via `next/image`).

---

## 5. Chantier B — Moteur d'intro

Base : `src/app/beta/buildIntroEngine.js` et `buildIntro.css` (≈ 1 100 lignes). L'architecture reste : plan de construction dérivé du DOM réel, tâches en générateurs, trois curseurs avec des compétences distinctes, physique d'orbite au repos, overlay SVG, restauration du DOM, skip/rejouer, failsafe de 5 s si le JS ne démarre pas.

### 5.1 Plan de construction sur la nouvelle page

Ordre global : nav → hero → projets → parcours → compétences → contact → pied de page, avec défilement automatique comme aujourd'hui (la page défile pour suivre le travail ; un défilement manuel interrompt l'intro).

Répartition :
- **Design** (brun → à passer en bleu glacier foncé pour s'accorder au nouveau thème) : peint le ciel au pot de peinture (dévoilement circulaire existant), **trace les crêtes au stylo** (tâche `line` existante, appliquée aux trois couches de polygones, de l'arrière vers l'avant), pose les trois cartes du hero puis les **tourne avec une poignée de rotation** (nouvelle tâche `rotate` : poignée au-dessus de la carte, arc d'angle affiché, la carte tourne jusqu'à −6° / +6°), **allume la neige** en cliquant sur le bouton neige (nouvelle tâche `toggle` : clic animé sur le bouton réel, retrait de `data-bi~="nosnow"`, les flocons commencent à tomber ; tâche **sautée** si le visiteur a désactivé la neige dans ses préférences), dépose les images, choisit les couleurs, écrit les titres de section, pose les commentaires.
- **Mathieu Crosnier** (bleu accent) : trace les boîtes (nav pilule, cartes, cellules), duplique les cartes projets et les cellules du parcours, corrige les alignements, résout les commentaires, clique « Mettre en ligne ».
- **Stagiaire** (violet) : tape les textes, édite les copies dupliquées, et fait les bêtises.

Pendant la construction, les éléments pas encore construits sont masqués (`visibility: hidden` via `data-bi`), comme aujourd'hui : le contenu est dans le HTML, le lecteur d'écran et Google le voient.

### 5.2 Frappe

- Vitesse de base par caractère : 8–20 ms (aujourd'hui 12–40), espaces +0–15 ms, pauses aléatoires 1 % (aujourd'hui 2,5 %) de 60–140 ms.
- Paragraphes de plus de 80 caractères : frappe **par rafales de 2 à 4 caractères** par pas, pour viser ≈ 70 caractères/seconde ; le curseur I-beam et le caret clignotant suivent la fin du texte.
- La faute de frappe scriptée sur le premier libellé (« Développeur Fullstak » → corrigé) est conservée.

### 5.3 Précision et rythme des curseurs

- Courbure des trajets (`bend`) : 2–7 % de la distance (aujourd'hui 4–14 %), nulle sur les glisser-déposer (déjà le cas).
- Arrivée : les 15 derniers pour cent du trajet décélèrent franchement (easing plus marqué), puis une **micro-correction de 2–3 px** vers la cible (150 ms) avant le clic.
- Pause de 80–150 ms entre l'arrivée et le clic.
- Glisser-déposer : facteur de vitesse 0,55–0,7 (aujourd'hui 0,7–0,9).
- Au repos : orbite réduite (rayon 60 → 36 px, tangente 150 → 80), le curseur se pose à proximité de sa prochaine tâche et y reste quasi immobile avec une légère dérive, au lieu de tournoyer.
- Le tempo global (`tempo()`, 1,35 → 2,7 au fil de l'avancement) reste, c'est lui qui évite que l'intro dure trop longtemps. Durée visée : 35–50 s sans skip sur desktop.

### 5.4 Erreurs corrigées (pool)

Deux erreurs sont tirées au sort par passage parmi :
1. **Faute de frappe** sur le premier libellé (existante, toujours jouée en plus des deux tirées).
2. **Mauvaise image** : le Stagiaire dépose la couverture d'un autre projet sur une carte ; Design commente « c'est pas la bonne 👀 » ; le Stagiaire reprend la bonne image.
3. **Carte trop penchée** : Design tourne la carte droite du hero à +18° ; Mathieu dit « un poil trop » ; Design la ramène à +6°.
4. **Majuscules** : un titre de section est tapé EN MAJUSCULES ; sélection, suppression, nouvelle frappe.
5. **Mauvaise couleur** : la palette choisit le vert pour « Me contacter » ; commentaire ; nouvelle sélection, bleu.
6. **Duplicata décalé** (existant) : une cellule dupliquée atterrit 28 px à côté ; Mathieu la réaligne aux flèches du clavier.
7. **Commentaire « trop gros le titre ? »** sur le H1 : Design le réduit par paliers (⌘ −) puis le commentaire est résolu.

### 5.5 Dialogues

Chaque réplique est tirée d'un pool de 3 à 5 variantes (ouverture, repères, frappe, erreurs, fin). Ton : court, complice, sans jargon ski. Exemples d'ouverture : « On construit le portfolio ? », « Allez, on monte la page. », « Prêts ? On pose les bases. »

### 5.6 Fin

Quand tout est construit : les trois curseurs se rejoignent au centre, répliques de fin, Mathieu clique « 🚀 Mettre en ligne » ; une **barre de déploiement** apparaît (« Build… », puis « Déployé ✓ » en 1,5–2 s, style Vercel, dans le HUD) ; la grille et les règles s'estompent ; les curseurs sortent par les bords. Le bouton « ↻ Rejouer l'intro » reste disponible en bas.

### 5.7 Easter eggs

Règle : **au plus un easter egg aléatoire par passage**, tiré au début du passage. Probabilités : copine 20 %, panne en prod 10 %, console.log 10 %, mode nuit par erreur 10 %, recruteur 10 %, rien 40 %. Chaque easter egg se joue à un moment défini du plan et respecte la règle de restauration du DOM.

1. **copine** — un quatrième curseur, libellé exactement « copine » (minuscules), **rouge rosé** (`#ff5c8a`, bulle et étiquette assorties), petit (échelle 0,85), entre par le bord gauche une fois la carte photo posée. Il attrape la carte photo, la tire de ~30 px vers lui, la redresse (0°), écrit « 😍 » dans une bulle à côté de la carte (la bulle reste 3 s), et repart. Le curseur Mathieu répond « … » puis « bon. » et remet la carte à sa place.
2. **Panne en prod** — pendant la construction de la grille projets : un toast rouge « 500 — service indisponible » s'affiche sur la carte Resilience Alpha ; un curseur « Resilience Alpha » (vert, forme robot) arrive, clique le toast, un compteur tourne, le toast passe en vert « rétabli en 1,8 s ✓ » puis disparaît. Les trois autres curseurs disent « ah. » / « c'est réparé ? » / « automatique 😎 ».
3. **console.log** — le Stagiaire pose un petit chip `console.log('coucou')` sous un paragraphe ; Mathieu passe, le sélectionne, « Suppr », et dit « on nettoie avant la prod 🙄 ».
4. **Thème par erreur** — Design clique le bouton thème ; toute la page bascule dans l'autre thème (nuit si la page est en jour, jour si elle est déjà en nuit) ; « oups » ; après 1,5 s il reclique et tout revient. Joué via `data-bi-theme` (voir §3), jamais via l'état réel.
5. **Recruteur** — vers la fin, un curseur « Recruteur » (gris anthracite, cravate dessinée) entre, va sur « Télécharger mon CV », clique (le bouton s'enfonce, une icône de téléchargement s'anime), dit « merci 👍 » et sort. Aucun vrai téléchargement n'est déclenché.

Déclencheurs cachés, toujours actifs, y compris après l'intro :
- taper **« ski »** au clavier : un petit skieur (forme de curseur dédiée) descend le long de la crête avant du hero de gauche à droite en laissant une trace pointillée, puis disparaît ; relançable.
- une **bannière ASCII montagne** dans la console du navigateur au chargement, avec une ligne : « Curieux ? Le code de cette intro est maison. mathieu.crosnier15@outlook.fr ».

### 5.8 Cadre d'exécution

- L'intro est montée sur la page d'accueil (`src/app/page.js`) ; la route `/beta` et sa métadonnée `noindex` sont supprimées ; le sitemap n'est pas modifié (il ne listait pas `/beta`).
- Pas d'intro si : `prefers-reduced-motion`, largeur < 860 px (même seuil que la mise en page, pour que le plan de construction corresponde toujours à la mise en page desktop), `navigator.webdriver`, `?intro=0`, ou visiteur ayant déjà vu l'intro dans la session (`sessionStorage`) — dans ce cas le site s'affiche avec sa séquence d'entrée CSS normale et le bouton « Rejouer l'intro » reste disponible.
- Skip : clic, touche (Espace, Échap, Entrée, flèches), molette, redimensionnement, défilement manuel — comme aujourd'hui. Le bouton « Passer l'intro » reste dans le HUD en bas.
- Le masquage avant hydratation (`html.bi-pending`) et le failsafe de 5 s restent.
- Le HUD (statut, bouton « Passer », « Mettre en ligne ») garde sa place en bas au centre ; les boutons neige et retour en haut restent dans les coins.

---

## 6. Laissé au builder

- Découpage en composants et organisation des fichiers (par exemple déplacer le moteur dans `src/app/intro/`).
- Choix entre `simple-icons` en dépendance ou SVG inline pour les logos.
- Implémentation exacte de la rafale de frappe et des courbes d'easing, tant que les valeurs cibles de 5.2 et 5.3 sont respectées.
- Forme SVG des nouveaux curseurs (robot, recruteur, skieur) : simples, dans le style des formes existantes (28×28, contour blanc).
- Mécanisme d'envoi du champ e-mail de contact (réutiliser l'existant).
- Recadrage et export de la photo.
- Tests : au minimum un test de restauration du DOM (état avant intro = état après skip) et un test que le plan de construction couvre bien toutes les sections visibles. Ces tests ont besoin d'une vraie mise en page : **Playwright en dépendance de développement est accepté** (la contrainte « pas de changement de stack » vise l'application, pas l'outillage de test). Pas de CI à mettre en place ; un script `npm run test:e2e` suffit.

## 7. Choix faits pendant la rédaction (à vérifier par Mathieu en lisant)

- Le Bac n'apparaît plus dans le parcours (trois formations suffisent).
- Le formulaire de contact complet est remplacé par un champ e-mail unique.
- La neige ne tombe plus que dans le hero.
- Pas d'intro sous 860 px et pas de rejeu automatique dans une même session.
- Le moteur pilote neige et thème par attributs, sans toucher aux préférences enregistrées ; la tâche « allumer la neige » est sautée si le visiteur l'a désactivée.
- La performance se mesure intro désactivée (`?intro=0`).
- La séquence d'entrée CSS ne rejoue pas après une intro complète.
- Playwright accepté pour les tests, sans CI.
- Bouton thème dans la nav en pilule, conservé sur mobile.
- URL Malt fournie : `https://www.malt.fr/profile/mathieucrosnier`. Pas de lien SkiMate pour l'instant : le bouton du projet phare renvoie au profil GitHub.
- Couleur du curseur Design : bleu glacier foncé au lieu du brun actuel.
- Probabilités des easter eggs (5.7) et durée cible de l'intro (35–50 s).
- SkiMate pointe vers le profil GitHub en attendant un lien.
