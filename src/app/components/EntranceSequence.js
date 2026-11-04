"use client";
import { useEffect } from "react";

/**
 * Déclenche la séquence d'entrée du hero (spec §4.6) en posant `html.entrance`.
 * Ne se déclenche pas si l'utilisateur préfère moins de mouvement (le CSS
 * affiche tout immédiatement), ni si le moteur d'intro est en attente
 * (`html.bi-pending`) : dans ce cas le moteur posera `bi-skipped` après un
 * skip, et c'est ce signal qui lance la séquence.
 */
export default function EntranceSequence() {
    useEffect(() => {
        const html = document.documentElement;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!html.classList.contains("bi-pending")) {
            html.classList.add("entrance");
            return;
        }
        const mo = new MutationObserver(() => {
            if (html.classList.contains("bi-skipped")) {
                html.classList.add("entrance");
                mo.disconnect();
            }
        });
        mo.observe(html, { attributes: true, attributeFilter: ["class"] });
        return () => mo.disconnect();
    }, []);
    return null;
}
