// Easter eggs (spec §5.7). Module pur.
// À chaque lancement de l'intro, chaque easter egg est tiré indépendamment
// avec sa propre chance : il peut n'y en avoir aucun, un, ou plusieurs.

export const EGGS = [
    { id: "copine", chance: 1 / 3 },
    { id: "prod", chance: 1 / 4 },
    { id: "console", chance: 1 / 4 },
    { id: "theme", chance: 1 / 5 },
    { id: "recruiter", chance: 1 / 4 },
];

const IDS = EGGS.map((e) => e.id);

/**
 * Easter eggs du lancement. `forced` (paramètre de test `?egg=`) impose
 * une liste : un id, plusieurs séparés par des virgules, ou `none`.
 */
export function pickEggs(rng, forced = null) {
    if (forced) return String(forced).split(",").map((s) => s.trim()).filter((id) => IDS.includes(id));
    return EGGS.filter((e) => rng() < e.chance).map((e) => e.id);
}
