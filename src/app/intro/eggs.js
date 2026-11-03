// Easter eggs (spec §5.7) : au plus un par passage, tiré au début. Module pur.
import { weighted } from "./rng.js";

export const EGGS = [
    { id: "copine", weight: 0.2 },
    { id: "prod", weight: 0.1 },
    { id: "console", weight: 0.1 },
    { id: "theme", weight: 0.1 },
    { id: "recruiter", weight: 0.1 },
    { id: "none", weight: 0.4 },
];

/** Id de l'easter egg du passage ; `forced` l'impose s'il est valide. */
export function pickEgg(rng, forced = null) {
    if (forced && EGGS.some((e) => e.id === forced)) return forced;
    return weighted(rng, EGGS);
}
