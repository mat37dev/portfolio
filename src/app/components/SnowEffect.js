"use client";
import { useEffect, useRef, useState } from "react";
import { Snowflake } from "lucide-react";

// Positions/tailles déterministes (mêmes valeurs serveur/client → pas de mismatch d'hydratation)
const FLAKES = Array.from({ length: 10 }, (_, i) => ({
    left: `${(i * 97) % 100}%`,
    size: 6 + (i % 3) * 2,
    duration: 9 + (i % 5),
    delay: i * 0.7,
}));

export default function SnowEffect() {
    const [snowOn, setSnowOn] = useState(true);
    const crestRef = useRef(null);

    // Préférence persistée (peut échouer en navigation privée → try/catch)
    useEffect(() => {
        try {
            if (localStorage.getItem("snow") === "off") setSnowOn(false);
        } catch {}
    }, []);

    const toggleSnow = () => {
        setSnowOn((on) => {
            try {
                localStorage.setItem("snow", on ? "off" : "on");
            } catch {}
            return !on;
        });
    };

    // Parallaxe très discrète de la bande "crête" en bas d'écran
    useEffect(() => {
        const el = crestRef.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = Math.min(window.scrollY * 0.04, 30);
                el.style.transform = `translateY(-${y}px)`;
                ticking = false;
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            {snowOn && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]" aria-hidden="true">
                    {FLAKES.map((f, i) => (
                        <div
                            key={i}
                            className="snowflake"
                            style={{
                                top: "-4%",
                                left: f.left,
                                width: f.size,
                                height: f.size,
                                animationDuration: `${f.duration}s`,
                                animationDelay: `${f.delay}s`,
                            }}
                        />
                    ))}
                </div>
            )}
            <div
                ref={crestRef}
                aria-hidden="true"
                className="fixed left-0 right-0 bottom-0 h-[120px] z-[4] pointer-events-none opacity-[0.055] bg-ink"
                style={{
                    clipPath:
                        "polygon(0 100%,0 55%,8% 70%,18% 30%,28% 65%,38% 20%,50% 60%,62% 15%,74% 55%,86% 25%,100% 60%,100% 100%)",
                }}
            />
            <button
                onClick={toggleSnow}
                aria-pressed={snowOn}
                aria-label={snowOn ? "Désactiver la neige" : "Activer la neige"}
                title={snowOn ? "Désactiver la neige" : "Activer la neige"}
                className={`fixed bottom-6 left-6 z-50 w-12 h-12 flex items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    snowOn
                        ? "bg-accent-soft border-accent text-accent-dark"
                        : "bg-card border-line text-muted hover:border-accent"
                }`}
            >
                <Snowflake size={20} />
            </button>
        </>
    );
}
