// Compétences (spec §4.3-5). Module pur. `icon` est un slug simple-icons,
// `salesforce` pour le pictogramme maison, null pour les langues.

export const SKILL_GROUPS = [
    {
        name: "Frontend",
        skills: [
            { name: "React", icon: "react", level: "quotidien" },
            { name: "Next.js", icon: "nextdotjs", inverted: true, level: "quotidien" },
            { name: "JavaScript", icon: "javascript" },
            { name: "Tailwind CSS", icon: "tailwindcss" },
            { name: "HTML & CSS", icon: "html5" },
            { name: "Bootstrap", icon: "bootstrap" },
        ],
    },
    {
        name: "Backend",
        skills: [
            { name: "PHP", icon: "php", level: "quotidien" },
            { name: "Symfony", icon: "symfony", inverted: true },
            { name: "Node.js", icon: "nodedotjs" },
            { name: "Python", icon: "python" },
            { name: "Java", icon: "openjdk" },
            { name: "C#", icon: "dotnet" },
        ],
    },
    {
        name: "Salesforce",
        skills: [
            { name: "Apex", icon: "salesforce", level: "quotidien" },
            { name: "Flow", icon: "salesforce", level: "quotidien" },
            { name: "SOQL", icon: "salesforce" },
        ],
    },
    {
        name: "Mobile & données",
        skills: [
            { name: "React Native", icon: "react" },
            { name: "Expo", icon: "expo", inverted: true },
            { name: "PostgreSQL", icon: "postgresql" },
            { name: "MySQL", icon: "mysql" },
            { name: "NoSQL", icon: "mongodb" },
        ],
    },
    {
        name: "Outils & langues",
        skills: [
            { name: "Git", icon: "git", level: "quotidien" },
            { name: "Docker", icon: "docker" },
            { name: "Ansible", icon: "ansible" },
            { name: "Grafana", icon: "grafana" },
            { name: "Français", icon: null, level: "natif" },
            { name: "Anglais", icon: null, level: "professionnel" },
        ],
    },
];
