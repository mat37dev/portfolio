import Image from "next/image";
import { PROJECT_IMAGES } from "@/app/data/projectImages";

export default function FeaturedProject({ project }) {
    return (
        <article className="feat rv" data-intro="featured">
            <div>
                <span className="num">01</span> <span className="chip">{project.category}</span>{" "}
                <span className="chip chip-acc">Projet phare</span>
                <h3 className="serif">{project.title}</h3>
                <p>{project.description}</p>
                <div className="meta">
                    {project.role && <span>Rôle : {project.role.toLowerCase()}</span>}
                    <span>·</span>
                    <span>{project.year}</span>
                </div>
                <div className="acts">
                    <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill pill-dark focus-ring"
                        data-intro="featured-link"
                    >
                        Voir le projet <span className="ar">→</span>
                    </a>
                    <small>{project.stack.join(" · ")}</small>
                </div>
            </div>
            <figure className="pola" data-intro="featured-image">
                <div className="im">
                    <Image
                        src={PROJECT_IMAGES[project.image]}
                        alt={project.imageAlt}
                        width={480}
                        height={280}
                        sizes="(max-width: 859px) 100vw, 480px"
                    />
                </div>
                <figcaption>
                    <b>{project.title}</b>
                    <small>{project.platform}</small>
                </figcaption>
            </figure>
        </article>
    );
}
