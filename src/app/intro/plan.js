// Plan de construction de l'intro sur la page d'accueil (spec §5.1).
// Lit le DOM par les attributs `data-intro` posés par les composants.
// `helpers` sont les fabriques du moteur (elles enregistrent les tâches) ;
// `options = { snowEnabled, mistakes }`.

export function buildPlan(root, helpers, options = {}) {
    const { T, box, type, title, image, dupGroup, q, qa, rectW, isVisible } = helpers;
    const snowEnabled = options.snowEnabled !== false;
    const mistakes = new Set(options.mistakes || []);
    const has = (id) => mistakes.has(id);
    const g = (name, r = root) => q(`[data-intro="${name}"]`, r);
    const ga = (name, r = root) => qa(`[data-intro="${name}"]`, r);

    // ---------- nav ----------
    const nav = box(g("nav"));

    // ---------- hero ----------
    const hero = g("hero");
    if (hero) {
        const h1 = g("h1", hero);
        const sky = g("sky", hero);
        if (sky) T({ kind: "paint", el: sky, deps: [] });

        // Crêtes : trois couches tracées au stylo, de l'arrière vers l'avant.
        const ridgeSvg = q("svg.ridge", hero);
        for (const n of [1, 2, 3]) {
            const poly = g(`ridge-${n}`, hero);
            if (!poly || !ridgeSvg || !isVisible(ridgeSvg)) continue;
            const raw = poly.getAttribute("points").trim().split(/\s+/).map((p) => p.split(",").map(Number));
            const pts = raw.filter(([, y]) => y < 400);
            T({
                kind: "line",
                el: poly,
                deps: [],
                pts: () => {
                    const r = rectW(ridgeSvg);
                    return pts.map(([x, y]) => ({ x: r.x + (x / 1440) * r.w, y: r.y + (y / 400) * r.h }));
                },
            });
        }

        if (h1) {
            const wrap = h1.parentElement;
            T({ kind: "guide", el: hero, x: () => rectW(h1).x });
            if (wrap) T({ kind: "guide", el: hero, x: () => { const r = rectW(wrap); return r.x + r.w; } });
        }
        const badge = g("badge", hero);
        const bb = box(badge, nav ? [nav] : []);
        type(badge, { deps: [bb] });
        const th1 = type(h1, { grow: true, big: has("title-too-big"), typo: "Développeur fullstak", deps: [bb] });
        if (th1 && has("title-too-big")) {
            const cm = T({ kind: "comment", el: h1, text: options.line("titleBig"), deps: [th1] });
            const sh = T({ kind: "shrink", el: h1, deps: [cm] });
            T({ kind: "resolve", el: h1, comment: cm, deps: [sh] });
        }
        const tl = type(g("lead", hero));
        if (tl && options.egg === "console") {
            const e1 = T({ kind: "egg-console", el: tl.el, deps: [tl] });
            T({ kind: "egg-console-fix", el: tl.el, deps: [e1] });
        }

        const ctaContact = g("cta-contact", hero);
        const b0 = box(ctaContact);
        if (b0 && has("wrong-color")) {
            const c1 = T({ kind: "color", el: ctaContact, pick: 2, mistake: "wrong-color", deps: [b0] });
            T({ kind: "color", el: ctaContact, pick: 3, fixOf: "wrong-color", deps: [c1] });
        } else if (b0) T({ kind: "color", el: ctaContact, pick: 3, deps: [b0] });
        const ctaCv = g("cta-cv", hero);
        if (ctaCv) {
            const cm = T({ kind: "comment", el: ctaCv, text: "Et le CV ? 📄", deps: b0 ? [b0] : [] });
            const b1 = box(ctaCv, [cm]);
            if (b1) T({ kind: "resolve", el: ctaCv, comment: cm, deps: [b1] });
        }
        type(g("cta-projects", hero));
        dupGroup(qa(":scope > span", g("checks", hero)));

        // Scène : trois cartes posées, images déposées, cartes latérales tournées.
        const heroTail = [];
        const stage = g("stage", hero);
        if (stage) {
            const cards = [
                { el: g("card-left", stage), angle: -6 },
                { el: g("card-photo", stage), angle: 0 },
                { el: g("card-right", stage), angle: 6 },
            ];
            // Ordre de pose : photo d'abord (au centre), puis les côtés.
            for (const c of [cards[1], cards[0], cards[2]]) {
                if (!c.el || !isVisible(c.el)) continue;
                const b = box(c.el);
                const im = image(q("img", c.el), [b]);
                if (c.angle === 0 && options.egg === "copine") T({ kind: "egg-copine", el: c.el, deps: [im || b] });
                if (c.angle > 0 && has("tilted-card")) {
                    const r1 = T({ kind: "rotate", el: c.el, angle: 18, mistake: "tilted-card", deps: [im || b] });
                    T({ kind: "rotate", el: c.el, angle: c.angle, fixOf: "tilted-card", deps: [r1] });
                } else if (c.angle) T({ kind: "rotate", el: c.el, angle: c.angle, deps: [im || b] });
            }
            heroTail.push(...dupGroup([g("tag-1", stage), g("tag-2", stage), g("tag-3", stage)]));
        }
        const snowBtn = g("snow-toggle");
        if (snowEnabled && snowBtn && isVisible(snowBtn)) heroTail.push(T({ kind: "toggle", el: snowBtn, hero, deps: [] }));
        const themeBtn = g("theme-toggle");
        if (options.egg === "theme" && themeBtn && isVisible(themeBtn)) T({ kind: "egg-theme", el: themeBtn, deps: heroTail.filter(Boolean) });
    }

    // ---------- projets ----------
    const proj = g("projets");
    if (proj) {
        type(g("projets-eyebrow", proj));
        const t0 = title(g("projets-h2", proj));
        type(g("projets-sub", proj), { deps: [t0] });
        dupGroup(qa("button", g("filters", proj)), { deps: [t0] });
        const feat = g("featured", proj);
        if (feat) {
            const fb = box(feat, [t0]);
            title(q("h3", feat), [fb]);
            type(q("h3 + p", feat), { deps: [fb] });
            const link = g("featured-link", feat);
            const lb = box(link, [fb]);
            if (lb) T({ kind: "color", el: link, deps: [lb] });
            image(q("img", g("featured-image", feat)), [fb]);
        }
        const cards = ga("card", g("grid", proj));
        const ts = dupGroup(cards, { edit: "h3" });
        cards.forEach((card, i) => {
            const img = q("img", card);
            let it;
            if (i === 1 && has("wrong-image") && cards[0]) {
                const other = q("img", cards[0]);
                it = image(img, [ts[i]], { wrong: other });
                if (it) it = T({ kind: "fix-image", el: img, file: it.file, deps: [it] });
            } else it = image(img, [ts[i]]);
            if (options.egg === "prod" && card.dataset.category === "DevOps") T({ kind: "egg-prod", el: card, deps: [it || ts[i]] });
        });
    }

    // ---------- parcours ----------
    const parcours = g("parcours");
    if (parcours) {
        type(g("parcours-eyebrow", parcours));
        const t0 = title(g("parcours-h2", parcours), [], { caps: has("caps") });
        type(g("parcours-sub", parcours), { deps: [t0] });
        dupGroup(ga("cell", parcours), { edit: "h3", deps: [t0], oops: has("misaligned") ? 2 : undefined });
        dupGroup(ga("edu", parcours), { deps: [t0] });
    }

    // ---------- compétences ----------
    const comp = g("competences");
    if (comp) {
        type(g("competences-eyebrow", comp));
        const t0 = title(g("competences-h2", comp));
        const groups = ga("grp", comp);
        const gts = dupGroup(groups, { edit: "h4", deps: [t0] });
        // Pilules dupliquées sans réédition du nom : chaque pilule garde son texte.
        groups.forEach((grp, i) => dupGroup(ga("tile", grp), { deps: [gts[i]] }));
    }

    // ---------- contact ----------
    const contact = g("contact");
    if (contact) {
        type(g("contact-eyebrow", contact));
        const t0 = title(g("contact-h2", contact));
        type(g("contact-text", contact), { deps: [t0] });
        const form = g("contact-form", contact);
        const fb = box(form, [t0]);
        qa("input, button", form).forEach((el) => box(el, [fb]));
        dupGroup(qa(":scope > span", g("contact-checks", contact)), { deps: [t0] });
        type(q(".alt2", contact), { deps: [t0] });
    }

    // ---------- pied de page ----------
    const footer = g("footer");
    if (footer) {
        const fb = box(footer);
        const ft = type(q(".footer-brand", footer), { deps: [fb] });
        const cv = g("cta-cv");
        if (options.egg === "recruiter" && cv) T({ kind: "egg-recruiter", el: cv, deps: [ft || fb] });
    }

    // ---------- mise en ligne ----------
    T({ kind: "deploy", el: null, deps: [], final: true });
}
