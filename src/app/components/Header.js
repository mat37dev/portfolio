"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import { PROFILE } from "@/app/data/profile";

const NAV_LINKS = [
    { id: "projets", label: "Projets" },
    { id: "parcours", label: "Parcours" },
    { id: "competences", label: "Compétences" },
    { id: "contact", label: "Contact" },
];

/**
 * Nav flottante en pilule (spec §4.3-1). Les classes `is-scrolled` (header)
 * et `is-active` (lien de la section visible) sont posées directement dans
 * le DOM, sans état React, pour ne pas re-rendre à chaque défilement.
 */
export default function Header() {
    const headerRef = useRef(null);

    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                header.classList.toggle("is-scrolled", window.scrollY > 40);
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        const links = Array.from(header.querySelectorAll("a[data-section]"));
        const observer = new IntersectionObserver(
            (entries) => {
                // La bande d'observation (5 % du viewport) ne contient qu'une section
                // à la fois : chaque lien suit l'état de sa propre section, ce qui
                // retire aussi l'actif quand on revient sur le hero.
                for (const entry of entries) {
                    const link = links.find((l) => l.dataset.section === entry.target.id);
                    if (link) link.classList.toggle("is-active", entry.isIntersecting);
                }
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );
        for (const { id } of NAV_LINKS) {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        }

        return () => {
            window.removeEventListener("scroll", onScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <header ref={headerRef} data-intro="nav" className="nav">
            <div className="nav-bar">
                <Link href="/#top" className="brand focus-ring">
                    <Image src="/profile.jpg" alt="" width={34} height={34} priority />
                    <span>
                        <b>{PROFILE.name}</b>
                        <small>{PROFILE.role}</small>
                    </span>
                    {/* Nom accessible = texte visible + destination (WCAG 2.5.3). */}
                    <span className="sr-only"> : retour en haut</span>
                </Link>

                <nav aria-label="Sections">
                    <ul>
                        {NAV_LINKS.map((link) => (
                            <li key={link.id}>
                                <Link href={`/#${link.id}`} data-section={link.id} className="focus-ring">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="nav-actions">
                    <ThemeToggle />
                    <Link href="/#contact" className="pill pill-acc focus-ring">
                        Me contacter
                    </Link>
                </div>
            </div>
        </header>
    );
}
