"use client";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setVisible(window.scrollY > 300);
                ticking = false;
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Retour en haut"
            className={`fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-acc text-[var(--on-acc)] shadow-[0_8px_28px_var(--glow)]
                hover:-translate-y-0.5 transition-all duration-300 ease-ease2 focus-ring ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
        >
            <ChevronUp size={20} />
        </button>
    );
}
