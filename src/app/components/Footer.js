import Link from "next/link";
import { PROFILE } from "@/app/data/profile";
import { ARTISANS } from "@/app/data/artisans";

const LINKS = [
    { href: PROFILE.links.instagram, label: "Instagram" },
    { href: PROFILE.links.facebook, label: "Facebook" },
    { href: PROFILE.links.linkedin, label: "LinkedIn" },
    { href: PROFILE.links.malt, label: "Malt" },
    { href: PROFILE.links.github, label: "GitHub" },
];

export default function Footer() {
    return (
        <footer data-intro="footer" className="footer">
            <div className="wrap">
                <span className="footer-brand">{PROFILE.name}</span>
                <nav aria-label="Liens">
                    <Link href={ARTISANS.path} className="focus-ring">
                        {ARTISANS.navLabel}
                    </Link>
                    {LINKS.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="focus-ring">
                            {l.label}
                        </a>
                    ))}
                    <span>© 2026</span>
                </nav>
            </div>
        </footer>
    );
}
