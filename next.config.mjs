import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const securityHeaders = [
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
    // Le badge Next.js de dev (bas-gauche) couvrait le bouton neige.
    devIndicators: false,
    // Dossier de build séparé pour les tests et le serveur de dev (NEXT_DIST_DIR),
    // afin de ne pas écraser le build de production servi en parallèle.
    distDir: process.env.NEXT_DIST_DIR || ".next",
    experimental: {
        optimizePackageImports: ["lucide-react"],
        // CSS intégré au HTML : plus de requêtes CSS bloquantes avant le rendu.
        inlineCss: true,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
