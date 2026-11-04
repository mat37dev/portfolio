import { PROFILE } from "@/app/data/profile";

const LINKS = [
    { href: PROFILE.links.github, label: "GitHub" },
    { href: PROFILE.links.linkedin, label: "LinkedIn" },
    { href: PROFILE.links.malt, label: "Malt" },
];

export default function Footer() {
    return (
        <footer data-intro="footer" className="footer">
            <div className="wrap">
                <span className="footer-brand">{PROFILE.name}</span>
                <nav aria-label="Liens externes">
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
