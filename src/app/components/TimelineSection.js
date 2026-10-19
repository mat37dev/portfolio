import Reveal from "@/app/components/Reveal";

const EDUCATION = [
    {
        period: "2025 - 2027",
        title: "Master SIN — Systèmes Informatiques et Numériques",
        subtitle: "EPSI Nantes",
        active: true,
    },
    {
        period: "2023 - 2025",
        title: "Concepteur Développeur d'Application",
        subtitle: "Titre RNCP 6",
    },
    {
        period: "2021 - 2023",
        title: "BTS SIO — option SLAM",
        subtitle: "Solutions Logicielles et Applications Métiers",
    },
    {
        period: "2018 - 2021",
        title: "Bac Général",
        subtitle: "Spécialités Mathématiques, NSI",
    },
];

const EXPERIENCE = [
    {
        period: "12/2025 - 08/2027",
        title: "Alternance — Cloudity",
        active: true,
        desc: "Développement de solutions CRM sur mesure sur la plateforme Salesforce : Apex, automatisation de processus via Salesforce Flow, intégrations avec des systèmes tiers.",
    },
    {
        period: "09/2023 - 08/2025",
        title: "Alternance — Esima (Armée de l'air et de l'espace)",
        desc: "Développement d'applications avec Symfony et Twig dans un cadre réglementé et sécurisé, avec utilisation de machines virtuelles hors ligne et respect des normes de style DSFR.",
    },
    {
        period: "03/2023 - 04/2023",
        title: "Stage — Kõdoka",
        desc: "Conception d'une application web CRM en PHP avec un autre stagiaire, actualisation en AJAX et respect des normes de sécurité en vigueur.",
    },
    {
        period: "05/2022 - 06/2022",
        title: "Stage — Kamisys",
        desc: "Optimisation d'un script de génération de données de test en volume avec JavaScript, Sequelize et MySQL.",
    },
];

const ActiveBadge = () => (
    <span className="text-[11px] font-semibold bg-[var(--ongoing-bg)] text-[var(--ongoing-text)] px-2 py-0.5 rounded-full ml-1.5 align-middle whitespace-nowrap inline-block">
        En cours
    </span>
);

const TimelineEntry = ({ item, index }) => (
    <Reveal delay={index * 70}>
        <div className="grid grid-cols-[14px_1fr] gap-3.5">
            <div className="flex flex-col items-center">
                <div
                    className={`w-2.5 h-2.5 rounded-full mt-[5px] flex-none ${
                        item.active ? "bg-[var(--ongoing)]" : "bg-accent"
                    }`}
                />
                <div className="w-0.5 flex-1 bg-line mt-1" />
            </div>
            <div className="pb-1.5">
                <p className="text-xs text-muted font-medium mb-[3px]">{item.period}</p>
                <h4 className="font-heading text-base font-bold text-ink">
                    {item.title}
                    {item.active && <ActiveBadge />}
                </h4>
                {item.subtitle && <p className="text-sm text-muted mt-0.5">{item.subtitle}</p>}
                {item.desc && <p className="text-sm leading-[1.55] mt-1.5">{item.desc}</p>}
            </div>
        </div>
    </Reveal>
);

const ColumnTitle = ({ children }) => (
    <h3 className="font-heading text-[13px] font-bold uppercase tracking-[0.08em] text-accent-dark mb-5 pb-2.5 border-b-2 border-accent-soft">
        {children}
    </h3>
);

const TimelineSection = () => {
    return (
        <section id="parcours" className="px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24">
            <h2 className="font-heading font-extrabold text-ink tracking-tight text-center text-[clamp(26px,3vw,34px)] mb-11">
                Parcours
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
                <div>
                    <ColumnTitle>Formation</ColumnTitle>
                    <div className="flex flex-col gap-[22px]">
                        {EDUCATION.map((item, i) => (
                            <TimelineEntry key={item.title} item={item} index={i} />
                        ))}
                    </div>
                </div>
                <div>
                    <ColumnTitle>Expérience</ColumnTitle>
                    <div className="flex flex-col gap-[22px]">
                        {EXPERIENCE.map((item, i) => (
                            <TimelineEntry key={item.title} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
