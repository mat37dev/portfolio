import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import { PROFILE } from "@/app/data/profile";
import Footer from "@/app/components/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";
import ScrollProgress from "@/app/components/ScrollProgress";
import { Analytics } from "@vercel/analytics/react";

// Appliqué avant l'hydratation React pour éviter le flash clair→sombre.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

// Sans JavaScript, rien ne poserait `html.entrance` ni `is-visible` :
// on force l'affichage de tout ce que les animations masquent.
const noscriptCss =
    ".art-list .art-item,.art-steps li>*{opacity:1!important;transform:none!important}" +
    ".in,.rv,.rv .tile,.stage .c,.stage .tag,.hero h1 .ln span{animation:none!important;opacity:1!important;transform:none!important}" +
    ".stage .c{transform:rotate(var(--r))!important}";

const serif = DM_Serif_Display({
    variable: "--font-serif",
    subsets: ["latin"],
    display: "swap",
    weight: "400",
});

const sans = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500"],
    // Petits libellés seulement : inutile de la précharger avant le titre.
    preload: false,
});

export const metadata = {
    metadataBase: new URL("https://mathieucrosnier.fr"),
    title: "Mathieu Crosnier – Développeur web freelance à Nantes | Sites internet, applis mobiles & IA",
    description: "Mathieu Crosnier, développeur web freelance à Nantes : création de sites internet, d'applications web et mobiles et intégration de l'IA pour les artisans, commerces et entreprises, à Nantes et à distance.",
    keywords: "Mathieu Crosnier, développeur web freelance Nantes, création site internet Nantes, développeur web Nantes, application mobile, intégration IA, site internet artisan, site internet commerce, Next.js, React, Symfony, Master SIN EPSI",
    authors: [{ name: "Mathieu Crosnier" }],
    alternates: { canonical: "https://mathieucrosnier.fr" },
    openGraph: {
        title: "Mathieu Crosnier – Développeur web freelance à Nantes | Sites internet, applis mobiles & IA",
        description: "Mathieu Crosnier, développeur web freelance à Nantes : création de sites internet, d'applications web et mobiles et intégration de l'IA pour les artisans, commerces et entreprises, à Nantes et à distance.",
        url: "https://mathieucrosnier.fr",
        siteName: "Mathieu Crosnier",
        locale: "fr_FR",
        type: "profile",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mathieu Crosnier – Développeur web freelance à Nantes | Sites internet, applis mobiles & IA",
        description: "Création de sites internet, d'applications web et mobiles et intégration de l'IA, à Nantes et à distance.",
    },
};

export const viewport = {
    themeColor: "#ffffff",
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mathieu Crosnier",
    url: "https://mathieucrosnier.fr",
    email: "mathieu.crosnier15@outlook.fr",
    image: "https://mathieucrosnier.fr/profile.jpg",
    jobTitle: "Développeur web freelance",
    address: { "@type": "PostalAddress", addressLocality: PROFILE.city, addressCountry: "FR" },
    alumniOf: { "@type": "EducationalOrganization", name: "EPSI Nantes" },
    knowsAbout: [
        "Création de sites internet",
        "Applications web et mobiles",
        "Intégration de l'IA",
        "Next.js",
        "React",
        "JavaScript",
        "PHP",
        "Symfony",
        "React Native",
    ],
    sameAs: [
        PROFILE.links.github,
        PROFILE.links.linkedin,
        PROFILE.links.malt,
        PROFILE.links.instagram,
        PROFILE.links.facebook,
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-title" content="Crosnier Mathieu" />
                <link rel="icon" type="image/svg+xml" href="/icon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
                <noscript>
                    <style>{noscriptCss}</style>
                </noscript>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased font-sans`}>
                <ScrollProgress />
                <Header />
                {children}
                <Footer />
                <ScrollToTop />
                {/* Le script d'audience n'existe que sur Vercel (404 en local). */}
                {process.env.VERCEL ? <Analytics /> : null}
            </body>
        </html>
    );
}
