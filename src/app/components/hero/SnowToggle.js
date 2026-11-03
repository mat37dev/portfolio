"use client";
import { useEffect, useState } from "react";
import { Snowflake } from "lucide-react";

const read = () => {
    try {
        return localStorage.getItem("snow") !== "off";
    } catch {
        return true;
    }
};

const apply = (on) => {
    document.documentElement.dataset.snow = on ? "on" : "off";
    window.dispatchEvent(new CustomEvent("snow:change", { detail: { on } }));
};

/**
 * Bouton fixe bas-gauche qui active ou coupe la neige du hero.
 * État persisté dans `localStorage.snow`, exposé via `html[data-snow]`.
 */
export default function SnowToggle() {
    const [on, setOn] = useState(true);

    useEffect(() => {
        const initial = read();
        setOn(initial);
        apply(initial);
    }, []);

    const toggle = () => {
        const next = !on;
        setOn(next);
        try {
            localStorage.setItem("snow", next ? "on" : "off");
        } catch {}
        apply(next);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={on}
            aria-label={on ? "Désactiver la neige" : "Activer la neige"}
            title={on ? "Désactiver la neige" : "Activer la neige"}
            data-intro="snow-toggle"
            className={`snow-toggle icon-btn focus-ring ${on ? "" : "is-off"}`}
        >
            <Snowflake size={16} />
        </button>
    );
}
