// Plan de construction de l'intro sur la page d'accueil (spec §5.1).
// Lit le DOM par les attributs `data-intro` posés par les composants.
// `helpers` sont les fabriques du moteur (elles enregistrent les tâches) ;
// `options = { snowEnabled, mistakes, eggs, copine, layout, scope, line }`.

// Easter egg « copine » sur la carte photo, en deux versions (voir eggs.js) :
// a : elle dépose la photo elle-même, de travers, et Design la redresse plus tard ;
// b : la photo est déposée de travers, elle la remet droite.
// `deps` doit couvrir le texte du hero : la scène ne commence qu'une fois la
// page prête à descendre jusqu'à la carte (`focus` : le défilement la suit).
// Renvoie la tâche de dépôt de l'image, dont dépend la suite du hero.
function copineScene({ T, image }, card, img, deps, variant) {
    if (variant === "a") {
        const im = image(img, deps, { guest: true });
        if (!im) return null;
        const egg = T({ kind: "egg-copine", variant: "a", el: card, focus: card, image: im, deps });
        T({ kind: "rotate", el: card, angle: 0, fixOf: "copine", deps: [egg] });
        return im;
    }
    const im = image(img, deps, { tilt: { card, angle: 10 } });
    if (im) {
        im.focus = card;
        T({ kind: "egg-copine", variant: "b", el: card, focus: card, deps: [im] });
    }
    return im;
}

// Hero mobile (< 860 px) : version compacte, construite de haut en bas.
// Les autres sections reprennent le plan desktop (sans erreurs : `mistakes`
// est vide sur mobile). Avec `scope: "hero"`, seul le hero est construit et le
// reste de la page arrive avec la révélation au défilement.
function buildMobileHero(root, helpers, options) {
    const { T, box, type, image, dupGroup, q, qa, isVisible } = helpers;
    const g = (name, r = root) => q(`[data-intro="${name}"]`, r);
    const eggs = new Set(options.eggs || []);
    const hero = g("hero");
    if (hero) {
        const sky = g("sky", hero);
        if (sky) T({ kind: "paint", el: sky, deps: [] });
        const badge = g("badge", hero);
        const bb = box(badge);
        type(badge, { deps: [bb] });
        const th1 = type(g("h1", hero), { grow: true, typo: "Développeur fullstak", deps: [bb] });
        const tl = type(g("lead", hero), { deps: [th1] });
        const cta = g("cta-contact", hero);
        const b0 = box(cta, [tl || th1]);
        if (b0) T({ kind: "color", el: cta, pick: 3, deps: [b0] });
        box(g("cta-cv", hero), [b0]);
        type(g("cta-projects", hero), { deps: [b0] });
        dupGroup(qa(":scope > span", g("checks", hero)), { many: true, deps: [b0] });
        const photo = g("card-photo", hero);
        let im = null;
        if (photo && isVisible(photo)) {
            const b = box(photo, [b0]);
            const img = q("img", photo);
            im = (eggs.has("copine") ? copineScene(helpers, photo, img, [b], options.copine) : image(img, [b])) || b;
        }
        dupGroup([g("tag-1", hero), g("tag-2", hero), g("tag-3", hero)], { many: true, deps: [im] });
        const snowBtn = g("snow-toggle");
        if (options.snowEnabled !== false && snowBtn && isVisible(snowBtn)) T({ kind: "toggle", el: snowBtn, hero, deps: [im || th1] });
    }
}

export function buildPlan(root, helpers, options = {}) {
    const mobile = options.layout === "mobile";
    if (mobile) {
        buildMobileHero(root, helpers, options);
        if (options.scope !== "hero") buildSections(root, helpers, options);
    } else {
        buildDesktopTop(root, helpers, options);
        buildSections(root, helpers, options);
    }
    // ---------- mise en ligne ----------
    helpers.T({ kind: "deploy", el: null, deps: [], final: true });
}

// Nav et hero desktop : crêtes au stylo, guides, scène à trois cartes.
function buildDesktopTop(root, helpers, options) {
    const { T, box, type, image, dupGroup, q, qa, isVisible, rectW } = helpers;
    const snowEnabled = options.snowEnabled !== false;
    const mistakes = new Set(options.mistakes || []);
    const has = (id) => mistakes.has(id);
    const eggs = new Set(options.eggs || []);
    const hasEgg = (id) => eggs.has(id);
    const g = (name, r = root) => q(`[data-intro="${name}"]`, r);

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
        const tl = type(g("lead", hero), { deps: [th1] });
        if (tl && hasEgg("console")) {
            const e1 = T({ kind: "egg-console", el: tl.el, deps: [tl] });
            T({ kind: "egg-console-fix", el: tl.el, deps: [e1] });
        }

        // Ordre du hero : pastille → titre → paragraphe → boutons → lien et coches.
        const ctaContact = g("cta-contact", hero);
        const b0 = box(ctaContact, [tl || th1]);
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
        const tp = type(g("cta-projects", hero), { deps: [b0] });
        dupGroup(qa(":scope > span", g("checks", hero)), { many: true, deps: [b0] });
        // Fin du texte du hero : l'easter egg copine attend ce point.
        const heroText = tp || b0 || tl || th1;

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
                const img = q("img", c.el);
                if (c.angle === 0 && hasEgg("copine")) { copineScene(helpers, c.el, img, [b, heroText], options.copine); continue; }
                const im = image(img, [b]);
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
        if (hasEgg("theme") && themeBtn && isVisible(themeBtn)) T({ kind: "egg-theme", el: themeBtn, deps: heroTail.filter(Boolean) });
    }
}

// Sections sous le hero : projets, parcours, compétences, contact, pied de page.
function buildSections(root, helpers, options) {
    const { T, box, type, title, image, dupGroup, q, qa, isVisible } = helpers;
    const mistakes = new Set(options.mistakes || []);
    const has = (id) => mistakes.has(id);
    const eggs = new Set(options.eggs || []);
    const hasEgg = (id) => eggs.has(id);
    const g = (name, r = root) => q(`[data-intro="${name}"]`, r);
    const ga = (name, r = root) => qa(`[data-intro="${name}"]`, r);
    // Mobile : tout est empilé, chaque copie ferait défiler la page. Les groupes
    // sont dupliqués en rafale (cartes, cellules, compétences), sans réédition.
    const compact = options.layout === "mobile";

    // ---------- projets ----------
    const proj = g("projets");
    if (proj) {
        type(g("projets-eyebrow", proj));
        const t0 = title(g("projets-h2", proj));
        type(g("projets-sub", proj), { deps: [t0] });
        dupGroup(qa("button", g("filters", proj)), { many: true, deps: [t0] });
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
        if (compact) {
            const [first] = dupGroup(cards, { many: true });
            if (first) image(q("img", cards[0]), [first]);
        }
        const ts = compact ? [] : dupGroup(cards, { edit: "h3" });
        if (!compact) cards.forEach((card, i) => {
            const img = q("img", card);
            let it;
            if (i === 1 && has("wrong-image") && cards[0]) {
                const other = q("img", cards[0]);
                it = image(img, [ts[i]], { wrong: other });
                if (it) it = T({ kind: "fix-image", el: img, file: it.file, deps: [it] });
            } else it = image(img, [ts[i]]);
            if (hasEgg("prod") && card.dataset.category === "DevOps") T({ kind: "egg-prod", el: card, deps: [it || ts[i]] });
        });
    }

    // ---------- parcours ----------
    const parcours = g("parcours");
    if (parcours) {
        type(g("parcours-eyebrow", parcours));
        const t0 = title(g("parcours-h2", parcours), [], { caps: has("caps") });
        type(g("parcours-sub", parcours), { deps: [t0] });
        if (compact) dupGroup(ga("cell", parcours), { many: true, deps: [t0] });
        else dupGroup(ga("cell", parcours), { edit: "h3", deps: [t0], oops: has("misaligned") ? 2 : undefined });
        dupGroup(ga("edu", parcours), { many: compact, deps: [t0] });
    }

    // ---------- compétences ----------
    const comp = g("competences");
    if (comp) {
        type(g("competences-eyebrow", comp));
        const t0 = title(g("competences-h2", comp));
        const groups = ga("grp", comp);
        if (compact) {
            // Mobile : un groupe posé avec ses pilules, les autres en rafale.
            const [first] = dupGroup(groups, { many: true, deps: [t0] });
            if (groups[0]) dupGroup(ga("tile", groups[0]), { many: true, deps: [first] });
        } else {
            const gts = dupGroup(groups, { edit: "h3", deps: [t0] });
            // Pilules dupliquées sans réédition du nom : chaque pilule garde son texte.
            groups.forEach((grp, i) => dupGroup(ga("tile", grp), { many: true, deps: [gts[i]] }));
        }
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
        dupGroup(qa(":scope > span", g("contact-checks", contact)), { many: true, deps: [t0] });
        type(q(".alt2", contact), { deps: [t0] });
    }

    // ---------- pied de page ----------
    const footer = g("footer");
    if (footer) {
        const fb = box(footer);
        const ft = type(q(".footer-brand", footer), { deps: [fb] });
        const cv = g("cta-cv");
        if (hasEgg("recruiter") && cv) T({ kind: "egg-recruiter", el: cv, deps: [ft || fb] });
    }
}
