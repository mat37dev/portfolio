// Erreurs corrigées (spec §5.4). Module pur.
// La faute de frappe est toujours jouée ; deux erreurs sont tirées parmi six.

export const MISTAKES = ["wrong-image", "tilted-card", "caps", "wrong-color", "misaligned", "title-too-big"];

/** Deux erreurs distinctes, ou la liste forcée filtrée sur les ids valides. */
export function pickMistakes(rng, forced = null) {
    if (forced) return forced.filter((id) => MISTAKES.includes(id));
    const pool = [...MISTAKES];
    const out = [];
    while (out.length < 2 && pool.length) {
        const i = Math.floor(rng() * pool.length);
        out.push(pool.splice(i, 1)[0]);
    }
    return out;
}
