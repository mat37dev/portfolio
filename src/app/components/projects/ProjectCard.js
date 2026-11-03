"use client";
import Image from "next/image";
import { PROJECT_IMAGES } from "@/app/data/projectImages";

// Lueur radiale qui suit la souris (spec §4.6) : écrit --mx/--my sur la carte.
const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
};

export default function ProjectCard({ project }) {
    const body = (
        <>
            <div className="im">
                <Image
                    src={PROJECT_IMAGES[project.image]}
                    alt={project.imageAlt}
                    width={360}
                    height={170}
                    sizes="(max-width: 859px) 100vw, 360px"
                />
            </div>
            <div className="b">
                <h3 className="serif">
                    {project.title} <small>{project.year}</small>
                </h3>
                <p>{project.description}</p>
                <div className="tags">
                    {project.stack.map((t) => (
                        <span key={t} className="tag">
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );

    const common = {
        className: "card rv",
        "data-intro": "card",
        "data-category": project.category,
        onMouseMove: onMove,
    };

    if (!project.href) {
        return (
            <div {...common} data-nolink="">
                {body}
            </div>
        );
    }
    return (
        <a {...common} href={project.href} target="_blank" rel="noopener noreferrer">
            {body}
        </a>
    );
}
