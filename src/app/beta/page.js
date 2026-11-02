import HeroSection from "@/app/components/HeroSection";
import TimelineSection from "@/app/components/TimelineSection";
import SkillSection from "@/app/components/SkillSection";
import ProjectSection from "@/app/components/ProjectSection";
import ContactSection from "@/app/components/ContactSection";
import BuildIntro from "./BuildIntro";

// Page de test : même contenu que l'accueil, avec l'intro "le site se construit".
// Non indexée et absente du sitemap.
export const metadata = {
    title: "Bêta · Mathieu Crosnier - Développeur Fullstack",
    robots: { index: false, follow: false },
};

// Masque le site avant l'hydratation pour éviter un flash du contenu final.
// Ignoré si l'utilisateur a demandé à réduire les animations.
const pendingScript = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("bi-pending")}catch(e){}`;

export default function BetaHome() {
    return (
        <main>
            <script dangerouslySetInnerHTML={{ __html: pendingScript }} />
            <HeroSection />
            <TimelineSection />
            <SkillSection />
            <ProjectSection />
            <ContactSection />
            <BuildIntro />
        </main>
    );
}
