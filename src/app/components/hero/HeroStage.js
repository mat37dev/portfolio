"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { PROFILE } from "@/app/data/profile";
import { PROJECT_IMAGES } from "@/app/data/projectImages";

/**
 * Scène à trois cartes du hero (spec §4.3-2) : couverture SkiMate à gauche,
 * photo au centre, couverture Notre cuisine à droite, trois étiquettes.
 * Parallaxe douce à la souris, désactivée si l'utilisateur préfère moins de
 * mouvement. Sous 860 px seule la photo reste (CSS).
 */
export default function HeroStage() {
    const ref = useRef(null);

    useEffect(() => {
        const stage = ref.current;
        if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const cards = Array.from(stage.querySelectorAll(".c"));
        const onMove = (e) => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;
            for (const el of cards) {
                const d = Number(el.dataset.depth) || 1;
                el.style.setProperty("--px", `${x * -16 * d}px`);
                el.style.setProperty("--py", `${y * -12 * d}px`);
            }
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const [tag1, tag2, tag3] = PROFILE.stageTags;

    return (
        <div ref={ref} className="stage" data-intro="stage">
            <a href="#projets" className="c l" data-intro="card-left" data-depth="1.4" aria-label="Voir le projet SkiMate">
                <Image src={PROJECT_IMAGES.skimate} alt="" width={300} height={180} sizes="300px" />
            </a>
            <figure className="c m" data-intro="card-photo" data-depth="0.6">
                <Image
                    src="/profile.jpg"
                    alt="Portrait de Mathieu Crosnier"
                    width={300}
                    height={300}
                    sizes="(max-width: 859px) 230px, 300px"
                    priority
                />
                <figcaption>{PROFILE.photoCaption}</figcaption>
            </figure>
            <a href="#projets" className="c r" data-intro="card-right" data-depth="1.4" aria-label="Voir le projet Notre cuisine">
                <Image src={PROJECT_IMAGES["notre-cuisine"]} alt="" width={300} height={180} sizes="300px" />
            </a>
            <span className="tag t1" data-intro="tag-1">
                <i />
                {tag1}
            </span>
            <span className="tag t2" data-intro="tag-2">
                <i />
                {tag2}
            </span>
            <span className="tag t3" data-intro="tag-3">
                <i />
                {tag3}
            </span>
        </div>
    );
}
