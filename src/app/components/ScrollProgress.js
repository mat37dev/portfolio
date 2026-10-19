"use client";
import { useEffect, useRef } from "react";

/**
 * Barre de progression de lecture façon "ascension" : se remplit
 * en haut de l'écran au fil du scroll. Discrète, mais fonctionnelle
 * (vraie sémantique progressbar), en écho au thème montagne.
 *
 * Perf : pas de useState ici — un re-render React à chaque frame de
 * scroll est coûteux (main-thread). On écrit directement dans le DOM
 * via ref, et on anime `transform: scaleX()` (compositée, pas de
 * layout) plutôt que `width` (qui force un reflow à chaque frame).
 * La hauteur scrollable est mise en cache et recalculée uniquement au
 * resize, pas à chaque scroll, pour éviter les reflows forcés.
 */
export default function ScrollProgress() {
    const barRef = useRef(null);
    const trackRef = useRef(null);
    const scrollableRef = useRef(0);

    useEffect(() => {
        const measure = () => {
            scrollableRef.current = document.documentElement.scrollHeight - window.innerHeight;
        };

        let ticking = false;
        const update = () => {
            const scrollable = scrollableRef.current;
            const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${pct / 100})`;
            }
            if (trackRef.current) {
                trackRef.current.setAttribute("aria-valuenow", String(Math.round(pct)));
            }
            ticking = false;
        };
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        const onResize = () => {
            measure();
            onScroll();
        };

        measure();
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <div
            ref={trackRef}
            role="progressbar"
            aria-label="Progression de lecture de la page"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={100}
            className="fixed top-0 left-0 right-0 z-30 h-[3px] bg-transparent"
        >
            <div
                ref={barRef}
                className="h-full w-full origin-left bg-gradient-to-r from-accent to-wood"
                style={{ transform: "scaleX(0)" }}
            />
        </div>
    );
}
