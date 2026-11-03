import HeroSection from "@/app/components/HeroSection";
import ProjectSection from "@/app/components/ProjectSection";
import TimelineSection from "@/app/components/TimelineSection";
import SkillSection from "@/app/components/SkillSection";
import ContactSection from "@/app/components/ContactSection";
import EntranceSequence from "@/app/components/EntranceSequence";
import Reveal from "@/app/components/Reveal";

export default function Home() {
    return (
        <main>
            <EntranceSequence />
            <Reveal />
            <HeroSection />
            <ProjectSection />
            <TimelineSection />
            <SkillSection />
            <ContactSection />
        </main>
    );
}
