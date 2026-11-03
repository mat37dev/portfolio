"use client";
import { useEffect } from "react";

/**
 * Révélation au défilement : observe tous les `.rv` de la page et pose
 * `is-visible` quand ils entrent dans le viewport (une seule fois).
 * Sous prefers-reduced-motion le CSS neutralise déjà l'effet ; on marque
 * quand même tout visible pour ne rien laisser dépendre d'un observer.
 */
export default function Reveal() {
    useEffect(() => {
        const els = Array.from(document.querySelectorAll(".rv"));
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            for (const el of els) el.classList.add("is-visible");
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
        );
        for (const el of els) io.observe(el);
        return () => io.disconnect();
    }, []);
    return null;
}
