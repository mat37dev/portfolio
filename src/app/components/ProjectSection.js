import { featuredProject, otherProjects } from "@/app/data/projects";
import FeaturedProject from "@/app/components/projects/FeaturedProject";
import ProjectCard from "@/app/components/projects/ProjectCard";
import ProjectFilters from "@/app/components/projects/ProjectFilters";

export default function ProjectSection() {
    return (
        <section id="projets" data-intro="projets" className="sec">
            <div className="wrap">
                <div className="head rv">
                    <div>
                        <div className="eyebrow" data-intro="projets-eyebrow">
                            Projets
                        </div>
                        <h2 className="serif" data-intro="projets-h2">
                            Sept projets, du mobile au DevOps.
                        </h2>
                        <p className="sub" data-intro="projets-sub">
                            Des applications conçues seul ou en équipe, en école comme en entreprise. Le code est
                            ouvert pour la plupart d&apos;entre elles.
                        </p>
                    </div>
                    <ProjectFilters />
                </div>
                <FeaturedProject project={featuredProject()} />
                <div className="grid" id="projets-grid" data-intro="grid" data-filter="Tous">
                    {otherProjects().map((p) => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>
            </div>
        </section>
    );
}
