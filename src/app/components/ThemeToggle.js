"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Bascule jour/nuit. La classe "dark" est déjà posée sur <html> par le
 * script bloquant de layout.js (avant hydratation) : ce composant lit cet
 * état au montage et le fait basculer au clic.
 */
export default function ThemeToggle({ className = "" }) {
    const [isDark, setIsDark] = useState(null);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggle = () => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch {}
        setIsDark(next);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={isDark ?? false}
            aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
            title={isDark ? "Thème clair" : "Thème sombre"}
            data-intro="theme-toggle"
            className={`icon-btn focus-ring ${className}`}
        >
            {isDark === null ? (
                <span className="block w-4 h-4" aria-hidden="true" />
            ) : isDark ? (
                <Sun size={16} />
            ) : (
                <Moon size={16} />
            )}
        </button>
    );
}
