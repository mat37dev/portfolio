import { EXPERIENCES, EDUCATION } from "@/app/data/experience";

export default function TimelineSection() {
    return (
        <section id="parcours" data-intro="parcours" className="sec sec-tint">
            <div className="wrap">
                <div className="rv">
                    <div className="eyebrow" data-intro="parcours-eyebrow">
                        Parcours
                    </div>
                    <h2 className="serif" data-intro="parcours-h2">
                        Quatre ans entre alternances et stages.
                    </h2>
                    <p className="sub" data-intro="parcours-sub">
                        Du CRM Salesforce aux applications Symfony en environnement réglementé, avec une formation en
                        continu jusqu&apos;au Master.
                    </p>
                </div>

                <div className="tbl rv" data-intro="xp-grid">
                    {EXPERIENCES.map((xp) => (
                        <article key={xp.company} className="cell" data-intro="cell">
                            <div className="h">
                                <h3 className="serif">
                                    {xp.role} <span>· {xp.company}</span>
                                </h3>
                                <span className="y" data-current={xp.current ? "" : undefined}>
                                    {xp.period}
                                </span>
                            </div>
                            <p>{xp.description}</p>
                            <div className="tags">
                                {xp.tags.map((t) => (
                                    <span key={t} className="tag">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>

                <div className="edu rv" data-intro="edu-grid">
                    {EDUCATION.map((e) => (
                        <article key={e.title} data-intro="edu">
                            <small data-current={e.current ? "" : undefined}>{e.period}</small>
                            <b>{e.title}</b>
                            <span>{e.subtitle}</span>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
