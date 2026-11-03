// Déclencheurs cachés (spec §5.7), toujours actifs, y compris après l'intro.

const SEQUENCE = ["s", "k", "i"];
const WINDOW_MS = 1500;

const inField = (el) =>
    !!el && !!el.closest && !!el.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']");

/**
 * Écoute la séquence « ski » au clavier (en moins de 1,5 s, hors champs de
 * saisie) et appelle `onSki`. Renvoie la fonction de désinstallation.
 */
export function installSecrets({ onSki }) {
    let i = 0;
    let t0 = 0;
    const onKey = (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (inField(e.target)) { i = 0; return; }
        const k = (e.key || "").toLowerCase();
        const now = performance.now();
        if (i > 0 && now - t0 > WINDOW_MS) i = 0;
        if (k === SEQUENCE[i]) {
            if (i === 0) t0 = now;
            i++;
            if (i === SEQUENCE.length) {
                i = 0;
                onSki();
            }
        } else {
            i = k === SEQUENCE[0] ? 1 : 0;
            if (i === 1) t0 = now;
        }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
}

const BANNER = [
    "",
    "            /\\",
    "           /  \\        /\\",
    "          /    \\      /  \\",
    "         /      \\    /    \\      /\\",
    "        /        \\  /      \\    /  \\",
    "  _____/          \\/        \\__/    \\_____",
    "",
    "  Curieux ? Le code de cette intro est maison. mathieu.crosnier15@outlook.fr",
    "  Astuce : tapez « ski ».",
    "",
].join("\n");

/** Bannière ASCII dans la console du navigateur. */
export function logBanner() {
    try {
        console.log(BANNER);
    } catch {}
}
