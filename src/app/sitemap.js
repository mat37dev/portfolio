export default function sitemap() {
    return [
        {
            url: "https://mathieucrosnier.fr",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: "https://mathieucrosnier.fr/creation-site-internet-nantes",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
    ];
}
