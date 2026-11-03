"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
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
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    for (const link of links) {
                        link.classList.toggle("is-active", link.dataset.section === entry.target.id);
                    }
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
                <a href="#top" className="brand focus-ring" aria-label="Retour en haut">
                    <Image src="/avatar.png" alt="" width={34} height={34} priority />
                    <span>
                        <b>{PROFILE.name}</b>
                        <small>{PROFILE.role}</small>
                    </span>
                </a>

                <nav aria-label="Sections">
                    <ul>
                        {NAV_LINKS.map((link) => (
                            <li key={link.id}>
                                <a href={`#${link.id}`} data-section={link.id} className="focus-ring">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="nav-actions">
                    <ThemeToggle />
                    <a href="#contact" className="pill pill-acc focus-ring">
                        Me contacter
                    </a>
                </div>
            </div>
        </header>
    );
}
