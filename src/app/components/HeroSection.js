import Image from "next/image";
import { Download, Mountain } from "lucide-react";

const BADGES = ["23 ans", "Nantes, France", "Alternance chez Cloudity"];

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-snow";

const HeroSection = () => {
    return (
        <section id="hero" className="relative overflow-hidden px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 lg:pt-28">
            <div className="relative z-[2] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 lg:gap-14 items-center">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.06em] text-accent mb-3.5">
                        Développeur Fullstack
                    </p>
                    <h1 className="font-heading font-extrabold text-ink tracking-tight leading-[1.05] text-[clamp(34px,5.2vw,58px)] mb-5">
                        Mathieu Crosnier
                    </h1>
                    <p className="text-[clamp(16px,1.6vw,19px)] leading-relaxed max-w-[560px] mb-3">
                        Étudiant en Master SIN à l&apos;EPSI Nantes, actuellement en alternance chez
                        Cloudity où je développe des solutions sur mesure sur la plateforme Salesforce.
                        Stack principale : React, Next.js, Symfony et PHP.
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted max-w-[560px] mb-7">
                        <Mountain size={16} className="text-accent flex-none" aria-hidden="true" />
                        Passionné de ski et de montagne — j&apos;ai d&apos;ailleurs créé SkiMate, une
                        application pensée pour les amateurs de glisse.
                    </p>
                    <div className="flex flex-wrap gap-2.5 mb-8">
                        {BADGES.map((badge) => (
                            <span
                                key={badge}
                                className="px-3.5 py-[7px] rounded-full bg-accent-soft text-accent-dark text-[13px] font-semibold"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#contact"
                            className={`px-6 py-3 rounded-[9px] bg-anthracite text-on-anthracite font-semibold text-[15px] whitespace-nowrap hover:bg-anthracite-2 transition-colors ${FOCUS_RING}`}
                        >
                            Me contacter
                        </a>
                        <a
                            href="/cv.pdf"
                            download
                            className={`flex items-center gap-2 px-6 py-3 rounded-[9px] border-[1.5px] border-line text-ink font-semibold text-[15px] whitespace-nowrap hover:border-accent transition-colors ${FOCUS_RING}`}
                        >
                            <Download size={17} />
                            Télécharger mon CV
                        </a>
                    </div>
                </div>
                <div className="justify-self-center">
                    <Image
                        src="/avatar.png"
                        alt="Photo de profil de Mathieu Crosnier, développeur fullstack à Nantes"
                        width={280}
                        height={280}
                        className="rounded-full w-44 h-44 sm:w-64 sm:h-64 lg:w-[280px] lg:h-[280px] object-cover border border-line"
                        priority
                    />
                </div>
            </div>

            {/* Crête de montagne — signature discrète en bas du hero */}
            <svg
                viewBox="0 0 1440 180"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="relative z-[1] block w-full h-[clamp(70px,12vw,150px)] mt-[clamp(32px,6vw,64px)]"
            >
                <polygon
                    points="0,180 0,120 180,40 360,100 520,20 700,90 880,30 1080,110 1260,50 1440,100 1440,180"
                    fill="var(--anthracite-2)"
                    opacity="0.9"
                />
                <polygon
                    points="0,180 0,150 220,90 460,140 660,70 900,130 1120,80 1440,140 1440,180"
                    fill="var(--accent)"
                    opacity="0.25"
                />
            </svg>
        </section>
    );
};

export default HeroSection;
