// Précision et rythme des curseurs (spec §5.3). Module pur.
import { rand } from "./rng.js";

/** Courbure d'un trajet : signe aléatoire, 2–7 % de min(dist, 600). */
export function bendFor(dist, rng) {
    const sign = rng() < 0.5 ? -1 : 1;
    return sign * rand(rng, 0.02, 0.07) * Math.min(dist, 600);
}

/** Décalage d'arrivée (2–3 px) corrigé ensuite par une micro-correction. */
export function settleOffset(rng) {
    const a = rand(rng, 0, Math.PI * 2);
    const n = rand(rng, 2, 3);
    return { dx: Math.cos(a) * n, dy: Math.sin(a) * n };
}

/** Pause entre l'arrivée et le clic, en secondes : 80–150 ms. */
export const preClickPause = (rng) => rand(rng, 0.08, 0.15);

/** Facteur de vitesse des glisser-déposer : 0,55–0,7. */
export const dragSpeed = (rng) => rand(rng, 0.55, 0.7);

/** Orbite au repos : rayon, tangente et dérive, en px. */
export const IDLE = { radius: 36, tangent: 80, drift: 6 };

/** Sortie cubique renforcée : les 15 derniers pour cent du trajet freinent nettement. */
export function approachEase(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return 1 - Math.pow(1 - t, 4);
}
