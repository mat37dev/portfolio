"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/app/components/icons/BrandIcons";
import ThemeToggle from "@/app/components/ThemeToggle";

const NAV_LINKS = [
    { href: "#parcours", label: "Parcours" },
    { href: "#competences", label: "Compétences" },
    { href: "#projets", label: "Projets" },
    { href: "#contact", label: "Contact" },
];

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-snow rounded-md";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const close = () => setIsOpen(false);

    return (
        <header className="sticky top-0 z-20 border-b border-line bg-header backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 py-4 px-5 sm:px-8 lg:px-12">
                <Link
                    href="#hero"
                    className={`font-heading font-extrabold text-[19px] text-ink tracking-tight ${FOCUS_RING}`}
                >
                    Mathieu Crosnier
                </Link>

                {/* Nav desktop */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-body hover:text-ink transition-colors ${FOCUS_RING}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="https://github.com/mat37dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Mon GitHub"
                        className={`p-2.5 -m-2.5 text-body hover:text-ink transition-colors ${FOCUS_RING}`}
                    >
                        <GithubIcon size={18} />
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/mathieu-crosnier-b78a16238/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Mon LinkedIn"
                        className={`p-2.5 -m-2.5 text-body hover:text-ink transition-colors ${FOCUS_RING}`}
                    >
                        <LinkedinIcon size={18} />
                    </Link>
                    <ThemeToggle />
                    <Link
                        href="#contact"
                        className={`px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors ${FOCUS_RING}`}
                    >
                        Me contacter
                    </Link>
                </nav>

                {/* Bouton hamburger — mobile uniquement, cible tactile 48px */}
                <div className="md:hidden flex items-center gap-1">
                    <ThemeToggle />
                    <button
                        className={`text-ink w-12 h-12 flex items-center justify-center -mr-2 ${FOCUS_RING}`}
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Menu mobile */}
            {isOpen && (
                <nav className="md:hidden border-t border-line bg-snow px-5 py-4">
                    <ul className="flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block py-3 text-body font-medium hover:text-ink ${FOCUS_RING}`}
                                    onClick={close}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="https://github.com/mat37dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 py-3 text-body font-medium hover:text-ink ${FOCUS_RING}`}
                                onClick={close}
                            >
                                <GithubIcon size={18} /> GitHub
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://www.linkedin.com/in/mathieu-crosnier-b78a16238/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 py-3 text-body font-medium hover:text-ink ${FOCUS_RING}`}
                                onClick={close}
                            >
                                <LinkedinIcon size={18} /> LinkedIn
                            </Link>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
};

export default Navbar;
