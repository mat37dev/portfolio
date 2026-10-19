"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Apparition au scroll : fondu + translation verticale, jouée une seule fois.
 * Respecte prefers-reduced-motion (affichage immédiat, sans animation).
 */
export default function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShown(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: shown ? 1 : 0,
                transform: `translateY(${shown ? 0 : 14}px)`,
                transition: `opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
