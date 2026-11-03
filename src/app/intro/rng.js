// Générateur aléatoire seedable (mulberry32). Module pur.

export function createRng(seed) {
    let a = (Number(seed) >>> 0) || 0x9e3779b9;
    return function rng() {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export const rand = (rng, a, b) => a + rng() * (b - a);

export const pick = (rng, array) => array[Math.floor(rng() * array.length)];

/** Tirage pondéré : `[{ id, weight }]` → id. */
export function weighted(rng, items) {
    const total = items.reduce((s, it) => s + it.weight, 0);
    let r = rng() * total;
    for (const it of items) {
        r -= it.weight;
        if (r < 0) return it.id;
    }
    return items[items.length - 1].id;
}
