import { Download } from "lucide-react";
import { PROFILE } from "@/app/data/profile";
import HeroBackground from "@/app/components/hero/HeroBackground";
import HeroStage from "@/app/components/hero/HeroStage";
import SnowToggle from "@/app/components/hero/SnowToggle";

export default function HeroSection() {
    const { lead } = PROFILE;
    return (
        <section id="top" data-intro="hero" className="hero">
            <HeroBackground />
            <div className="wrap">
                <span className="badge in" data-intro="badge">
                    <i />
                    {PROFILE.badge}
                </span>
                <h1 className="serif" data-intro="h1">
                    {PROFILE.h1.map((line) => (
                        <span key={line} className="ln">
                            <span>{line}</span>
                        </span>
                    ))}
                </h1>
                <p className="lead in d2" data-intro="lead">
                    {lead.before}
                    <b>{lead.strong1}</b>
                    {lead.middle}
                    <b>{lead.strong2}</b>
                    {lead.after}
                </p>
                <div className="cta in d3">
                    <a href="#contact" className="pill pill-acc focus-ring" data-intro="cta-contact">
                        Me contacter <span className="ar">→</span>
                    </a>
                    <a href={PROFILE.cv} download className="pill pill-ghost focus-ring" data-intro="cta-cv">
                        <Download size={16} aria-hidden="true" />
                        Télécharger mon CV
                    </a>
                    <a href="#projets" className="more focus-ring" data-intro="cta-projects">
                        Voir mes projets <span className="ar ar-down">↓</span>
                    </a>
                </div>
                <div className="checks in d4" data-intro="checks">
                    {PROFILE.checks.map((c) => (
                        <span key={c}>✓ {c}</span>
                    ))}
                </div>
                <HeroStage />
            </div>
            <SnowToggle />
        </section>
    );
}
