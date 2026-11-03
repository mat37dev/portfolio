// Table des logos (simple-icons) + pictogramme Salesforce maison.
// Module pur : testable sous node --test.
import {
    siReact,
    siNextdotjs,
    siJavascript,
    siTailwindcss,
    siHtml5,
    siBootstrap,
    siPhp,
    siSymfony,
    siNodedotjs,
    siPython,
    siOpenjdk,
    siDotnet,
    siExpo,
    siPostgresql,
    siMysql,
    siMongodb,
    siGit,
    siDocker,
    siAnsible,
    siGrafana,
} from "simple-icons";

const pick = ({ path, hex }) => ({ path, hex });

const ICONS = {
    react: pick(siReact),
    nextdotjs: pick(siNextdotjs),
    javascript: pick(siJavascript),
    tailwindcss: pick(siTailwindcss),
    html5: pick(siHtml5),
    bootstrap: pick(siBootstrap),
    php: pick(siPhp),
    symfony: pick(siSymfony),
    nodedotjs: pick(siNodedotjs),
    python: pick(siPython),
    // Le logo OpenJDK est noir dans simple-icons ; on garde le bleu de la maquette validée.
    openjdk: { path: siOpenjdk.path, hex: "437291" },
    dotnet: pick(siDotnet),
    expo: pick(siExpo),
    postgresql: pick(siPostgresql),
    mysql: pick(siMysql),
    mongodb: pick(siMongodb),
    git: pick(siGit),
    docker: pick(siDocker),
    ansible: pick(siAnsible),
    grafana: pick(siGrafana),
    // Le logo Salesforce officiel n'est pas dans simple-icons : nuage maison.
    salesforce: {
        path: "M10 5.5a4.3 4.3 0 0 1 3.3 1.6 3.8 3.8 0 0 1 2-.6 4 4 0 0 1 3.9 3.2A3.6 3.6 0 0 1 24 13.3a3.7 3.7 0 0 1-3.8 3.6 3.3 3.3 0 0 1-.8-.1 3.4 3.4 0 0 1-3 1.9 3.5 3.5 0 0 1-1.5-.4 4 4 0 0 1-7.2-.2 3.5 3.5 0 0 1-.8.1A3.7 3.7 0 0 1 3 10.9a3.8 3.8 0 0 1-.3-1.5A4 4 0 0 1 6.7 5.4a4.2 4.2 0 0 1 3.3.1z",
        hex: "00A1E0",
    },
};

/** @returns {{ path: string, hex: string } | null} */
export const iconFor = (slug) => (slug && ICONS[slug]) || null;
