"use client";
import { useState } from "react";
import Image from "next/image";

import skimateImage from "/public/projectImages/skimate.jpg";
import kodokaImage from "/public/projectImages/kodoka.png";
import geek4FunImage from "/public/projectImages/geek4Fun.png";
import covoiturageImage from "/public/projectImages/covoiturage.png";
import gameJamImage from "/public/projectImages/gameJam.png";

const FILTERS = ["Tous", "Web", "Mobile", "Jeux Vidéo"];

const PROJECTS = [
    {
        id: 1,
        title: "SkiMate",
        filterCat: "Mobile",
        featured: true,
        date: "2025",
        description:
            "Application mobile centralisant les données utiles pour les skieurs : conditions météo, cartographie des domaines skiables et informations en temps réel sur les stations françaises.",
        techStack: ["Symfony", "React Native", "React", "API", "SQL", "NoSQL", "MapBox"],
        image: skimateImage,
        imageAlt: "Capture d'écran de SkiMate, application mobile pour les skieurs",
    },
    {
        id: 2,
        title: "Site CRM-Kodoka",
        filterCat: "Web",
        date: "2023",
        description:
            "CRM développé en PHP/CodeIgniter pour la gestion des utilisateurs, permissions, devis, factures et avoirs d'une entreprise.",
        techStack: ["PHP", "MySQL", "CodeIgniter"],
        github: "https://github.com/mat37dev/crm-kodoka",
        image: kodokaImage,
        imageAlt: "Capture d'écran du CRM Kodoka",
    },
    {
        id: 3,
        title: "Site Geek4Fun",
        filterCat: "Web",
        date: "2022",
        description:
            "Site de gestion de tournois de jeux vidéo pour un festival, réalisé en équipe de trois. En charge du module tournois et du système de compte utilisateur.",
        techStack: ["PHP", "MySQL", "CodeIgniter"],
        github: "https://github.com/mat37dev/Geek4Fun",
        image: geek4FunImage,
        imageAlt: "Capture d'écran du site Geek4Fun de gestion de tournois",
    },
    {
        id: 4,
        title: "Site de Covoiturage",
        filterCat: "Web",
        date: "2020",
        description:
            "Plateforme de covoiturage étudiant en PHP pur, sans framework : profils, publication et recherche de trajets.",
        techStack: ["PHP", "MySQL", "JavaScript"],
        image: covoiturageImage,
        imageAlt: "Capture d'écran de la plateforme de covoiturage étudiant",
    },
    {
        id: 5,
        title: "Find And Build",
        filterCat: "Jeux Vidéo",
        date: "2020",
        description:
            "Jeu vidéo 3D réalisé en 48h lors d'une Game Jam à trois : retrouver des fragments d'une ville pour la reconstruire.",
        techStack: ["C#", "Unity"],
        link: { href: "https://iphinis.itch.io/find-build", label: "Voir le jeu →" },
        image: gameJamImage,
        imageAlt: "Capture d'écran du jeu Find And Build réalisé en Game Jam",
    },
];

const FeaturedCard = ({ project }) => (
    <article className="col-span-full bg-anthracite rounded-[14px] overflow-hidden grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        <div className="relative min-h-[220px] bg-snow-alt p-4">
            <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain rounded-lg"
            />
        </div>
        <div className="px-[22px] py-5 pb-[22px]">
            <div className="flex items-baseline justify-between gap-2.5 mb-1.5">
                <h3 className="font-heading text-[22px] font-bold text-white">{project.title}</h3>
                <span className="text-xs text-[oklch(70%_0.01_235)] whitespace-nowrap">{project.date}</span>
            </div>
            <p className="text-sm leading-[1.55] text-[oklch(82%_0.008_235)] mb-3.5">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                    <span
                        key={tech}
                        className="px-2.5 py-1 rounded-full bg-[oklch(30%_0.02_235)] border border-[oklch(38%_0.02_235)] text-xs font-medium text-[oklch(85%_0.008_235)] whitespace-nowrap"
                    >
                        {tech}
                    </span>
                ))}
            </div>
        </div>
    </article>
);

const FOCUS_RING =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-snow rounded-sm";

const ProjectCard = ({ project }) => (
    <article className="bg-card border border-line rounded-[14px] overflow-hidden flex flex-col">
        <div className="relative h-[150px] bg-snow-alt p-3">
            <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-contain rounded-md"
            />
        </div>
        <div className="px-[22px] py-5 pb-[22px] flex flex-col flex-1">
            <div className="flex items-baseline justify-between gap-2.5 mb-1.5">
                <h3 className="font-heading text-[17px] font-bold text-ink">{project.title}</h3>
                <span className="text-xs text-muted whitespace-nowrap">{project.date}</span>
            </div>
            <p className="text-sm leading-[1.55] mb-3.5">{project.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3.5 mt-auto">
                {project.techStack.map((tech) => (
                    <span
                        key={tech}
                        className="px-2.5 py-1 rounded-full bg-snow border border-line text-xs font-medium whitespace-nowrap"
                    >
                        {tech}
                    </span>
                ))}
            </div>
            {project.github && (
                <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir le code de ${project.title} sur GitHub`}
                    className={`text-[13px] font-semibold text-accent hover:text-accent-dark ${FOCUS_RING}`}
                >
                    Voir le code →
                </a>
            )}
            {project.link && (
                <a
                    href={project.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.link.label.replace(" →", "")} : ${project.title}`}
                    className={`text-[13px] font-semibold text-accent hover:text-accent-dark ${FOCUS_RING}`}
                >
                    {project.link.label}
                </a>
            )}
        </div>
    </article>
);

const ProjectSection = () => {
    const [activeFilter, setActiveFilter] = useState("Tous");
    const [gridVisible, setGridVisible] = useState(true);

    const setFilter = (name) => {
        if (name === activeFilter) return;
        setGridVisible(false);
        setTimeout(() => {
            setActiveFilter(name);
            setGridVisible(true);
        }, 160);
    };

    const filteredProjects = PROJECTS.filter(
        (p) => activeFilter === "Tous" || p.filterCat === activeFilter
    );

    return (
        <section id="projets" className="px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24">
            <h2 className="font-heading font-extrabold text-ink tracking-tight text-center text-[clamp(26px,3vw,34px)] mb-3">
                Projets
            </h2>
            <p className="text-center text-muted text-[15px] mb-8">
                Une sélection de projets académiques et personnels.
            </p>

            <div className="flex justify-center flex-wrap gap-2 mb-9">
                {FILTERS.map((filter) => {
                    const active = activeFilter === filter;
                    return (
                        <button
                            key={filter}
                            onClick={() => setFilter(filter)}
                            aria-pressed={active}
                            className={`px-[18px] py-2 rounded-full text-[13.5px] font-semibold border-[1.5px] whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-snow ${
                                active
                                    ? "border-accent bg-accent-soft text-accent-dark"
                                    : "border-line bg-card text-body hover:border-accent"
                            }`}
                        >
                            {filter}
                        </button>
                    );
                })}
            </div>

            <div
                className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5"
                style={{
                    opacity: gridVisible ? 1 : 0,
                    transform: `translateY(${gridVisible ? 0 : 8}px)`,
                    transition: gridVisible
                        ? "opacity .3s ease, transform .3s ease"
                        : "opacity .16s ease, transform .16s ease",
                }}
            >
                {filteredProjects.map((project) =>
                    project.featured ? (
                        <FeaturedCard key={project.id} project={project} />
                    ) : (
                        <ProjectCard key={project.id} project={project} />
                    )
                )}
            </div>
        </section>
    );
};

export default ProjectSection;
