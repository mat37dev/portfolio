// Répliques des curseurs (spec §5.5) : court, complice, sans jargon de montagne.
import { pick } from "./rng.js";

export const LINES = {
    open: ["On construit le portfolio ?", "Allez, on monte la page.", "Prêts ? On pose les bases.", "Bon, on s'y met ?"],
    guides: ["je pose les repères 📐", "les colonnes d'abord 📐", "deux repères et c'est parti", "on aligne tout ça 📐"],
    typing: ["je prends les textes ✍️", "les textes, c'est pour moi ✍️", "je tape, vous posez ✍️", "je m'occupe des mots ✍️"],
    typo: ["typo 👀", "il manque une lettre 👀", "relis-toi 👀", "coquille 👀"],
    typoFixed: ["corrigé 😅", "voilà 😅", "c'est réglé 😅", "pardon 😅"],
    paint: ["le ciel d'abord 🪣", "un fond, vite 🪣", "je peins le ciel 🪣", "ambiance 🪣"],
    oops: ["oups 😬", "ah, décalé 😬", "pas tout à fait 😬", "hmm 😬"],
    fix: ["je réaligne", "je corrige", "on reprend", "c'est mieux comme ça"],
    wrongImage: ["c'est pas la bonne 👀", "mauvais visuel 👀", "ça, c'est l'autre projet 👀", "pas celle-là 👀"],
    tilted: ["un poil trop", "trop penché", "un peu moins", "doucement sur l'angle"],
    caps: ["pas en majuscules 🙃", "on crie pas 🙃", "en minuscules, merci 🙃", "majuscules ? non 🙃"],
    color: ["pas vert 🙃", "on reste sur le bleu", "le vert, non", "bleu, comme le reste"],
    titleBig: ["trop gros le titre ?", "un peu grand, non ?", "on réduit le titre ?", "il déborde un peu"],
    done: ["Site prêt ✓", "on publie ? 🚀", "go go go 🎉", "ça tient la route ✓", "c'est propre 🎉"],
};

/** Une réplique tirée au sort dans le pool `key`. */
export const line = (rng, key) => pick(rng, LINES[key]);

/** `n` répliques distinctes du pool `key`. */
export function lines(rng, key, n) {
    const pool = [...LINES[key]];
    const out = [];
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    return out;
}
