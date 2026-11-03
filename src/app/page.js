import HeroSection from "@/app/components/HeroSection";
import ProjectSection from "@/app/components/ProjectSection";
import TimelineSection from "@/app/components/TimelineSection";
import SkillSection from "@/app/components/SkillSection";
import ContactSection from "@/app/components/ContactSection";
import EntranceSequence from "@/app/components/EntranceSequence";
import Reveal from "@/app/components/Reveal";
import BuildIntro from "@/app/intro/BuildIntro";

// Masque le site avant l'hydratation quand l'intro va se lancer, pour éviter
// un flash du contenu final. Mêmes garde-fous que src/app/intro/gating.js
// (intro=fast / intro=debug forcent, intro=0 coupe). Filet : le CSS rend tout
// visible après 5 s si le JS ne démarre pas.
const pendingScript = `(function(){try{
var m=new URLSearchParams(location.search).getAll("intro");
if(m.indexOf("0")>-1)return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(innerWidth<860)return;
var force=m.indexOf("fast")>-1||m.indexOf("debug")>-1;
if(!force){
if(navigator.webdriver)return;
if(sessionStorage.getItem("introSeen")==="1")return;}
document.documentElement.classList.add("bi-pending");
}catch(e){}})();`;

export default function Home() {
    return (
        <main>
            <script dangerouslySetInnerHTML={{ __html: pendingScript }} />
            <EntranceSequence />
            <Reveal />
            <HeroSection />
            <ProjectSection />
            <TimelineSection />
            <SkillSection />
            <ContactSection />
            <BuildIntro />
        </main>
    );
}
