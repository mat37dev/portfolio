import Image from "next/image";
import Link from "next/link";
import { Palette, PhoneCall, Rocket, Search, Smartphone, Wrench } from "lucide-react";
import Reveal from "@/app/components/Reveal";
import ArtisanContact from "@/app/components/artisans/ArtisanContact";
import HeroMock from "@/app/components/artisans/HeroMock";
import "./artisans.css";
import { ARTISANS } from "@/app/data/artisans";
import { PROFILE } from "@/app/data/profile";

const { seo, lead, included, steps, about, faq } = ARTISANS;
const url = `https://mathieucrosnier.fr${ARTISANS.path}`;

const ICONS = { palette: Palette, phone: Smartphone, search: Search, call: PhoneCall, rocket: Rocket, wrench: Wrench };

export const metadata = {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
        title: seo.title,
        description: seo.description,
        url,
        siteName: "Mathieu Crosnier",
        locale: "fr_FR",
        type: "website",
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Création de site internet",
    serviceType: "Création de site internet",
    url,
    areaServed: { "@type": "City", name: PROFILE.city },
    provider: {
        "@type": "Person",
        name: PROFILE.name,
        url: "https://mathieucrosnier.fr",
        jobTitle: PROFILE.role,
    },
};

export default function ArtisansPage() {
    return (
        <main className="art-page">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Reveal />

            <section id="top" className="art-hero">
                <div className="art-sky" aria-hidden="true" />
                <div className="wrap art-hero-grid">
                    <div className="art-hero-text">
                        <span className="badge">
                            <i />
                            {ARTISANS.badge}
                        </span>
                        <h1 className="serif art-h1">{ARTISANS.h1.join(" ")}</h1>
                        <p className="lead">
                            {lead.before}
                            <b>{lead.strong}</b>
                            {lead.after}
                        </p>
                        <div className="cta">
                            <a href="#contact" className="pill pill-acc focus-ring">
                                Demander ma maquette <span className="ar">→</span>
                            </a>
                            <a href="#etapes" className="more focus-ring">
                                Comment ça se passe <span className="ar ar-down">↓</span>
                            </a>
                        </div>
                        <div className="checks">
                            {ARTISANS.checks.map((c) => (
                                <span key={c}>✓ {c}</span>
                            ))}
                        </div>
                    </div>
                    <HeroMock />
                </div>
            </section>

            <section id="inclus" className="sec sec-tint">
                <div className="wrap">
                    <div className="eyebrow">{included.eyebrow}</div>
                    <h2 className="serif">{included.title}</h2>
                    <div className="art-list rv">
                        {included.items.map((item) => {
                            const Icon = ICONS[item.icon];
                            return (
                                <article key={item.title} className="art-item">
                                    <span className="art-ico" aria-hidden="true">
                                        <Icon size={20} />
                                    </span>
                                    <h3 className="serif">{item.title}</h3>
                                    <p>{item.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="etapes" className="sec">
                <div className="wrap">
                    <div className="eyebrow">{steps.eyebrow}</div>
                    <h2 className="serif">{steps.title}</h2>
                    <ol className="art-steps rv">
                        {steps.items.map((step, i) => (
                            <li key={step.title} style={{ "--i": i }}>
                                <span className="art-dot mono" aria-hidden="true">{i + 1}</span>
                                <h3 className="serif">{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section id="qui" className="sec sec-tint">
                <div className="wrap art-about rv">
                    <Image src="/profile.jpg" alt="Mathieu Crosnier" width={180} height={180} className="art-photo" />
                    <div>
                        <div className="eyebrow">{about.eyebrow}</div>
                        <h2 className="serif">{about.title}</h2>
                        {about.paragraphs.map((p) => (
                            <p key={p} className="sub">
                                {p}
                            </p>
                        ))}
                        {about.legal ? <p className="art-legal mono">{about.legal}</p> : null}
                        <Link href="/#projets" className="art-link focus-ring">
                            {about.projectsLink} <span className="ar">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section id="questions" className="sec">
                <div className="wrap">
                    <div className="eyebrow">{faq.eyebrow}</div>
                    <h2 className="serif">{faq.title}</h2>
                    <div className="art-faq">
                        {faq.items.map((item) => (
                            <details key={item.q}>
                                <summary>{item.q}</summary>
                                <p>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <ArtisanContact />
        </main>
    );
}
