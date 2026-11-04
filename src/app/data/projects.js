// Projets (spec §4.3-3). Module pur : `image` est une clé résolue par
// projectImages.js côté composant, pour rester importable sous node --test.

export const FILTERS = ["Tous", "Web", "Mobile", "Jeux vidéo", "DevOps"];

export const PROJECTS = [
    {
        id: "skimate",
        title: "SkiMate",
        category: "Mobile",
        year: "2025",
        featured: true,
        role: "Conception et développement",
        description:
            "Application mobile qui centralise les données utiles aux skieurs : conditions météo, cartographie des domaines skiables et informations en temps réel sur les stations françaises.",
        stack: ["Symfony", "React Native", "React", "MapBox", "SQL", "NoSQL"],
        href: "https://github.com/mat37dev",
        image: "skimate",
        imageAlt: "Couverture de SkiMate : logo pingouin et écrans météo, plan des pistes et webcams",
        platform: "iOS & Android",
    },
    {
        id: "resilience-alpha",
        title: "Resilience Alpha",
        category: "DevOps",
        year: "2026",
        description:
            "Plateforme de paiement auto-résiliente : détecte une anomalie et rétablit seule son service. Docker, Ansible, observabilité, WAF, SIEM et conformité RGPD.",
        stack: ["Docker", "Ansible", "Grafana", "ModSecurity"],
        href: "https://github.com/mat37dev/resilience-alpha",
        image: "resilience-alpha",
        imageAlt: "Couverture de Resilience Alpha : bouclier avec flèche de reprise et validation",
    },
    {
        id: "notre-cuisine",
        title: "Notre cuisine",
        category: "Web",
        year: "2026",
        description:
            "Recettes partagées en PWA : quantités recalculées selon le nombre de personnes, trois niveaux d'accès, API pour Claude.",
        stack: ["Next.js", "TypeScript", "Supabase"],
        href: "https://github.com/mat37dev/notre-cuisine",
        image: "notre-cuisine",
        imageAlt: "Couverture de Notre cuisine : logo carnet de recettes et écrans mobiles de l'application",
    },
    {
        id: "crm-kodoka",
        title: "CRM Kōdoka",
        category: "Web",
        year: "2023",
        description: "CRM en PHP/CodeIgniter : gestion des utilisateurs, permissions, devis, factures et avoirs.",
        stack: ["PHP", "CodeIgniter", "MySQL"],
        href: "https://github.com/mat37dev/crm-kodoka",
        image: "kodoka",
        imageAlt: "Couverture du CRM Kōdoka : logo et tableau de bord des revenus et clients",
    },
    {
        id: "geek4fun",
        title: "Geek4Fun",
        category: "Web",
        year: "2022",
        description:
            "Gestion de tournois de jeux vidéo pour un festival, en équipe de trois : module tournois et comptes utilisateurs.",
        stack: ["PHP", "CodeIgniter"],
        href: "https://github.com/mat37dev/Geek4Fun",
        image: "geek4fun",
        imageAlt: "Couverture de Geek4Fun : logo manette du festival jeux et numérique",
    },
    {
        id: "find-and-build",
        title: "Find And Build",
        category: "Jeux vidéo",
        year: "2020",
        description:
            "Jeu 3D réalisé en 48 h lors d'une Game Jam à trois : retrouver des fragments d'une ville pour la reconstruire.",
        stack: ["Unity", "C#"],
        href: "https://iphinis.itch.io/find-build",
        image: "gameJam",
        imageAlt: "Capture d'écran du jeu Find And Build réalisé en Game Jam",
    },
    {
        id: "covoiturage",
        title: "Site de covoiturage",
        category: "Web",
        year: "2020",
        description:
            "Plateforme de covoiturage étudiant en PHP pur, sans framework : profils, publication et recherche de trajets.",
        stack: ["PHP", "MySQL", "JavaScript"],
        image: "covoiturage",
        imageAlt: "Capture d'écran de la plateforme de covoiturage étudiant",
    },
];

export const featuredProject = () => PROJECTS.find((p) => p.featured);
export const otherProjects = () => PROJECTS.filter((p) => !p.featured);
