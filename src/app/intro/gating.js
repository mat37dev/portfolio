// Garde-fous de l'intro (spec §5.8). Module pur.
import { readParams } from "./params.js";

/**
 * L'intro se lance automatiquement sauf si : mouvement réduit, fenêtre < 860 px,
 * navigateur piloté (webdriver), `?intro=0`, ou intro déjà vue dans la session.
 * `?intro=fast` et `?intro=debug` (tests et mesure) passent outre webdriver et
 * la session, mais jamais le mouvement réduit ni la largeur : le plan de
 * construction correspond à la mise en page desktop.
 */
export function shouldAutoplay({ reducedMotion, width, webdriver, search, sessionSeen }) {
    const { mode } = readParams(search);
    if (mode === "off") return false;
    if (reducedMotion) return false;
    if (width < 860) return false;
    if (mode === "fast" || mode === "debug") return true;
    if (webdriver) return false;
    if (sessionSeen) return false;
    return true;
}
