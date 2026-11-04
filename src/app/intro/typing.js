// Rythme de frappe (spec §5.2). Module pur ; les délais sont en millisecondes.
import { rand } from "./rng.js";

/** Délai avant un caractère : 8–20 ms, +0–15 ms sur une espace, +60–140 ms dans 1 % des cas. */
export function charDelay(ch, rng) {
    let d = rand(rng, 8, 20);
    if (ch === " ") d += rand(rng, 0, 15);
    if (rng() < 0.01) d += rand(rng, 60, 140);
    return d;
}

/** Taille d'une rafale : 1 caractère jusqu'à 80 caractères, sinon 2 à 4. */
export function burstSize(totalLength, rng) {
    if (totalLength <= 80) return 1;
    return 2 + Math.floor(rng() * 3);
}

/**
 * Plan de frappe : positions cumulées et délai avant chaque rafale.
 * Le délai d'une rafale est la somme des délais de ses caractères.
 */
export function typingPlan(text, rng) {
    const plan = [];
    const n = text.length;
    let i = 0;
    while (i < n) {
        const size = Math.min(burstSize(n, rng), n - i);
        let delay = 0;
        for (let j = i; j < i + size; j++) delay += charDelay(text[j], rng);
        i += size;
        plan.push({ upTo: i, delay });
    }
    return plan;
}
