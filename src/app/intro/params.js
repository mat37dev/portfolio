// Paramètres d'URL de l'intro, réservés aux tests et à la mesure. Module pur.
//   intro=0 | fast | debug   (cumulables : intro=fast&intro=debug)
//   seed=<entier>             rend le passage reproductible
//   egg=<id>                  force un easter egg
//   mistakes=a,b              force les erreurs jouées

export function readParams(search = "") {
    const sp = new URLSearchParams(search || "");
    const intro = sp.getAll("intro");
    let mode = "auto";
    if (intro.includes("0")) mode = "off";
    else if (intro.includes("fast")) mode = "fast";
    else if (intro.includes("debug")) mode = "debug";
    const debug = intro.includes("debug");
    const seedRaw = sp.get("seed");
    const seed = seedRaw !== null && seedRaw !== "" && Number.isFinite(Number(seedRaw)) ? Number(seedRaw) : null;
    const egg = sp.get("egg") || null;
    const mistakesRaw = sp.get("mistakes");
    const mistakes = mistakesRaw ? mistakesRaw.split(",").map((s) => s.trim()).filter(Boolean) : null;
    return { mode, debug, seed, egg, mistakes };
}
