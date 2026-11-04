import Link from "next/link";

export default function NotFound() {
    return (
        <main className="sec" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
            <div className="wrap" style={{ textAlign: "center" }}>
                <div className="eyebrow">Erreur 404</div>
                <h1 className="serif" style={{ fontSize: "clamp(44px, 6.4vw, 78px)", lineHeight: 1.02, margin: "16px 0 0" }}>
                    Cette page n&apos;existe pas.
                </h1>
                <p className="sub" style={{ margin: "20px auto 0" }}>
                    L&apos;adresse est peut-être erronée, ou la page a été déplacée. Tout ce qui compte est sur
                    l&apos;accueil.
                </p>
                <div className="cta">
                    <Link href="/" className="pill pill-acc focus-ring">
                        Retour à l&apos;accueil <span className="ar">→</span>
                    </Link>
                    <Link href="/#contact" className="more focus-ring">
                        Me contacter <span className="ar">→</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
