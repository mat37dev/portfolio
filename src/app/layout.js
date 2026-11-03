import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";
import SnowEffect from "@/app/components/SnowEffect";
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
});

export const metadata = {
    metadataBase: new URL("https://mathieucrosnier.fr"),
    title: "Mathieu Crosnier - Développeur Fullstack | Nantes",
    description: "Portfolio de Mathieu Crosnier, développeur fullstack en Master SIN à l'EPSI Nantes, alternant chez Cloudity. Découvrez mes projets et compétences en développement web, Salesforce et applications mobiles.",
    keywords: "Mathieu Crosnier, développeur fullstack Nantes, développeur web Nantes, alternant Salesforce, Master SIN EPSI, Next.js, React, Apex, portfolio développeur fullstack, Cloudity",
    authors: [{ name: "Mathieu Crosnier" }],
    alternates: { canonical: "https://mathieucrosnier.fr" },
    openGraph: {
        title: "Mathieu Crosnier - Développeur Fullstack | Nantes",
        description: "Portfolio de Mathieu Crosnier, développeur fullstack en Master SIN à l'EPSI Nantes, alternant chez Cloudity.",
        url: "https://mathieucrosnier.fr",
        type: "profile",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mathieu Crosnier - Développeur Fullstack | Nantes",
        description: "Portfolio de Mathieu Crosnier, développeur fullstack en Master SIN à l'EPSI Nantes.",
    },
};

export const viewport = {
    themeColor: "#f6f8fa",
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mathieu Crosnier",
    url: "https://mathieucrosnier.fr",
    email: "mathieu.crosnier15@outlook.fr",
    jobTitle: "Développeur Fullstack",
    alumniOf: { "@type": "EducationalOrganization", name: "EPSI Nantes" },
    worksFor: { "@type": "Organization", name: "Cloudity" },
    knowsAbout: ["Next.js", "React", "JavaScript", "Salesforce", "Apex", "PHP", "Symfony", "React Native"],
    sameAs: [
        "https://github.com/mat37dev",
        "https://www.linkedin.com/in/mathieu-crosnier-b78a16238/",
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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased font-sans`}>
                <ScrollProgress />
                <SnowEffect />
                <div className="max-w-[1360px] mx-auto relative">
                    <Navbar />
                    {children}
                    <Footer />
                </div>
                <ScrollToTop />
                <Analytics />
            </body>
        </html>
    );
}
