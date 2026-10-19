import Reveal from "@/app/components/Reveal";

const CATEGORIES = [
    { name: "Frontend", skills: ["HTML & CSS", "JavaScript", "React", "Next.js", "Tailwind CSS", "Bootstrap"] },
    { name: "Backend", skills: ["PHP", "Symfony", "Node.js", "Python", "Java", "C#"] },
    { name: "Mobile", skills: ["React Native", "Expo"] },
    { name: "Bases de données", skills: ["MySQL", "PostgreSQL", "NoSQL"] },
    { name: "DevOps & Outils", skills: ["Git", "Docker"] },
    { name: "CRM Salesforce", skills: ["Salesforce", "Apex", "SOQL", "Flow"] },
    { name: "Langues", skills: ["Français (natif)", "Anglais (professionnel)"] },
];

// Couleur de badge rotative par catégorie (glacier, glacier foncé, bois).
// Teintes figées (--chip-*), indépendantes du thème clair/sombre : ce sont des
// fonds pleins avec texte blanc, elles ne doivent pas s'éclaircir en dark mode.
const ICON_TONES = ["bg-chip1", "bg-chip2", "bg-chip3"];

export default function SkillSection() {
    return (
        <section
            id="competences"
            className="px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24 bg-snow-alt border-y border-line-soft"
        >
            <h2 className="font-heading font-extrabold text-ink tracking-tight text-center text-[clamp(26px,3vw,34px)] mb-11">
                Compétences
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px] max-w-[1120px] mx-auto">
                {CATEGORIES.map((category, i) => (
                    <Reveal key={category.name} delay={i * 60}>
                        <div className="bg-card border border-line-soft rounded-[14px] px-[22px] py-5 h-full">
                            <div className="flex items-center gap-2.5 mb-3.5">
                                <span
                                    className={`w-[26px] h-[26px] rounded-[7px] ${ICON_TONES[i % ICON_TONES.length]} flex-none flex items-center justify-center text-[11px] font-bold text-white font-heading`}
                                >
                                    {category.name[0]}
                                </span>
                                <h3 className="font-heading text-[12.5px] font-bold uppercase tracking-[0.07em] text-body">
                                    {category.name}
                                </h3>
                            </div>
                            <ul className="flex flex-wrap gap-2 list-none">
                                {category.skills.map((skill) => (
                                    <li
                                        key={skill}
                                        className="px-[15px] py-2 rounded-[9px] bg-snow border border-line text-[13.5px] font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-accent"
                                    >
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
