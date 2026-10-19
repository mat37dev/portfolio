"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Toggle thème clair/sombre. La classe "dark" est déjà posée sur <html>
 * par le script bloquant dans layout.js (avant hydratation) — ce composant
 * ne fait que lire cet état au montage et le faire basculer au clic.
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
            onClick={toggle}
            aria-pressed={isDark ?? false}
            aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
            title={isDark ? "Thème clair" : "Thème sombre"}
            className={`p-2.5 -m-2.5 text-body hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-snow rounded-md ${className}`}
        >
            {isDark === null ? (
                <span className="block w-[18px] h-[18px]" aria-hidden="true" />
            ) : isDark ? (
                <Sun size={18} />
            ) : (
                <Moon size={18} />
            )}
        </button>
    );
}
