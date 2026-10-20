# Logo - Mathieu Crosnier

**Cime en C** : un M en deux sommets, entouré d'un C ouvert comme un cirque de montagne.
Couleurs reprises des tokens du site (`--accent` et `--wood`).

## Fichiers

| Dossier | Contenu |
|---|---|
| `svg/` | Masters vectoriels : symbole, horizontal, empilé, en couleur, fond sombre (`-reversed`), noir, blanc, bleu |
| `png/` | Exports prêts à l'emploi (symbole 512 px, logos avec nom 1200 px) |
| `web/` | Icônes du site : `icon.svg`, `favicon.ico`, `apple-icon.png`, `icon-192/512.png`, `icon-maskable-512.png` |
| `presentation/` | Planche de présentation (HTML + une image par diapositive) |

Quel fichier utiliser :

| Besoin | Fichier |
|---|---|
| Logo avec nom, fond clair | `svg/mc-horizontal-color.svg` (ou `mc-stacked-color.svg` en format carré) |
| Logo avec nom, fond sombre | `svg/mc-horizontal-reversed.svg` |
| Symbole seul (avatar, en-tête) | `svg/mc-symbol-color.svg` ou `mc-symbol-reversed.svg` |
| Moins de 40 px de haut | `svg/mc-symbol-small-color.svg` ou `-small-reversed.svg` (traits plus épais) |
| Une seule couleur | `-black`, `-white` ou `-blue` |

## Couleurs

| Rôle | Fond clair | Fond sombre |
|---|---|---|
| Anneau (bleu glacier) | `#136b94` · rgb(19, 107, 148) | `#5da1c8` · rgb(93, 161, 200) |
| M (bois) | `#865448` · rgb(134, 84, 72) | `#ac776a` · rgb(172, 119, 106) |
| Nom | `#10171c` (ardoise) | `#f6f9fb` (neige) |
| Fond | `#f6f9fb` | `#10171c` |

Équivalents tokens du site : `oklch(50% 0.10 235)` bleu, `oklch(50% 0.07 35)` bois (thème clair) ; `oklch(68% 0.09 235)` et `oklch(62% 0.07 35)` (thème sombre).

Contrastes (WCAG) : bleu sur fond clair 5,6:1 · bois sur fond clair 5,9:1 · bleu clair sur ardoise 6,4:1 · bois clair sur ardoise 4,8:1.
Valeurs sRGB uniquement : pour une impression, demander une conversion CMJN/Pantone à l'imprimeur.

## Règles d'usage

- **Espace libre** : au moins un quart de la hauteur du symbole (64 unités sur le dessin de 256) autour du logo.
- **Tailles minimales** : symbole complet 32 px de haut ; en dessous, version `small` (16 px minimum) ; logo horizontal 160 px de large.
- **Fonds autorisés** : clair (`#f6f9fb`, blanc) avec la version couleur ; sombre (`#10171c`) avec `-reversed`.
- **Fond bleu de marque ou photo** : version blanche (`-white`). Sur `#136b94`, l'anneau bleu de la version couleur disparaît.
- **À ne pas faire** : étirer ou pivoter le logo, changer les couleurs, ajouter une ombre ou un dégradé, utiliser la version couleur claire sur fond clair (ou l'inverse), remplacer la police du nom.

## Dessin

- Symbole sur grille 256 × 256 : anneau rayon 116 / 88, ouverture de 60° en haut à droite, extrémités arrondies. M à pentes de 75° et 65°.
- Le nom est dessiné en contours (police Manrope Bold, la même que les titres du site, licence libre SIL OFL) : aucune police à installer.
- Retourné à 180°, le symbole se lit « W » : sans conséquence.

## Intégration au site (non faite)

Rien n'a été modifié dans `src/` ni dans `public/`. Pour l'appliquer :
1. Remplacer `src/app/icon.svg`, `icon.png`, `apple-icon.png`, `favicon.ico` par les fichiers de `web/`.
2. Remplacer le texte « Mathieu Crosnier » du header par `mc-horizontal-color.svg` / `-reversed.svg`, selon le thème.
3. Mettre à jour `src/app/manifest.json` avec `icon-192.png`, `icon-512.png` et `icon-maskable-512.png`.

## Limites

- Pas de recherche d'antériorité : une vérification de marque (INPI, recherche d'image inversée) est conseillée avant tout usage commercial.
- Les exemples de la planche de présentation contiennent des textes fictifs (nom sur la carte de visite).
