// Garde-fous de l'intro (spec §5.8). Module pur.
import { readParams } from "./params.js";

/** Mise en page de l'intro : la version complète sur desktop, une mini-intro du hero sous 860 px. */
export const introLayout = (width) => (width < 860 ? "mobile" : "desktop");

/**
 * L'intro se lance automatiquement sauf si : mouvement réduit, écran très étroit
 * (< 320 px), navigateur piloté (webdriver), `?intro=0`, ou intro déjà vue dans
 * la session. `?intro=fast` et `?intro=debug` (tests et mesure) passent outre
 * webdriver et la session, jamais le mouvement réduit ni la largeur minimale.
 */
export function shouldAutoplay({ reducedMotion, width, webdriver, search, sessionSeen }) {
    const { mode } = readParams(search);
    if (mode === "off") return false;
    if (reducedMotion) return false;
    if (width < 320) return false;
    if (mode === "fast" || mode === "debug") return true;
    if (webdriver) return false;
    if (sessionSeen) return false;
    return true;
}
