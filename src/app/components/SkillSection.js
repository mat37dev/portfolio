import { SKILL_GROUPS } from "@/app/data/skills";
import TechIcon from "@/app/components/icons/TechIcon";

export default function SkillSection() {
    return (
        <section id="competences" data-intro="competences" className="sec">
            <div className="wrap">
                <div className="rv">
                    <div className="eyebrow" data-intro="competences-eyebrow">
                        Compétences
                    </div>
                    <h2 className="serif" data-intro="competences-h2">
                        Une stack web et mobile, plus Salesforce.
                    </h2>
                </div>
                {SKILL_GROUPS.map((group, i) => (
                    <div key={group.name} className={`grp rv${i === 0 ? " grp-first" : ""}`} data-intro="grp">
                        <h4>{group.name}</h4>
                        <div className="tiles">
                            {group.skills.map((s) => (
                                <span key={s.name} className="tile" data-intro="tile">
                                    {s.icon && <TechIcon slug={s.icon} inverted={s.inverted} />}
                                    {s.name}
                                    {s.level && <i className="lv">{s.level}</i>}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
