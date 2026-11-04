"use client";
import { useState } from "react";
import { FILTERS } from "@/app/data/projects";

/**
 * Filtres de la grille. La grille reste rendue côté serveur avec ses six
 * cartes ; le filtre actif est posé en `data-filter` sur #projets-grid et
 * le masquage se fait en CSS, ce qui préserve l'ordre d'origine.
 */
export default function ProjectFilters() {
    const [active, setActive] = useState(FILTERS[0]);

    const select = (name) => {
        setActive(name);
        const grid = document.getElementById("projets-grid");
        if (grid) grid.dataset.filter = name;
    };

    return (
        <div className="filters" data-intro="filters" role="group" aria-label="Filtrer les projets">
            {FILTERS.map((f) => (
                <button key={f} type="button" aria-pressed={active === f} onClick={() => select(f)} className="focus-ring">
                    {f}
                </button>
            ))}
        </div>
    );
}
