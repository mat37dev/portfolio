import HeroSection from "@/app/components/HeroSection";
import TimelineSection from "@/app/components/TimelineSection";
import SkillSection from "@/app/components/SkillSection";
import ProjectSection from "@/app/components/ProjectSection";
import ContactSection from "@/app/components/ContactSection";

export default function Home() {
    return (
        <main>
            <HeroSection />
            <TimelineSection />
            <SkillSection />
            <ProjectSection />
            <ContactSection />
        </main>
    );
}
