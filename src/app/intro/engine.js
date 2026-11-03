/*
 * Moteur de l'intro "le site se construit" (page d'accueil).
 *
 * Principe : le vrai site est rendu normalement par React. Le moteur masque
 * ses éléments, puis trois curseurs les "construisent" un par un (tracé à la
 * croix, frappe au clavier, duplication, dépôt d'images, pot de peinture...).
 * Il ne crée ni ne supprime aucun nœud dans l'arbre React : il ne fait que
 * poser des attributs data-bi, modifier temporairement des nœuds texte et
 * quelques styles inline, et tout est restauré à l'identique à la fin ou au
 * skip. L'overlay (curseurs, règles, mesures) vit dans des nœuds ajoutés à
 * <body>, hors de React.
 *
 * Mouvement des curseurs inspiré de github.com/DhvanilPatel/swarm-cursors
 * (réimplémenté, pas copié) : trajets en arc avec easing, orbite au repos,
 * inertie, rotation dans le sens du mouvement.
 */

import { charDelay, typingPlan } from "./typing.js";
import { bendFor, settleOffset, preClickPause, dragSpeed, approachEase, IDLE } from "./motion.js";
import { buildPlan as buildPlanSections } from "./plan.js";

const ACC = "oklch(50% 0.1 235)";
const WOOD = "oklch(50% 0.07 35)";
const VIOLET = "oklch(52% 0.13 300)";
const RED = "#e5484d";
const GREEN = "oklch(58% 0.12 150)";
const SVGNS = "http://www.w3.org/2000/svg";

// Source aléatoire : remplacée par le générateur seedable reçu en option.
let RNG = Math.random;
const rand = (a, b) => a + RNG() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const W = () => document.documentElement.clientWidth;
const H = () => window.innerHeight;
const ST = () => window.scrollY;

const rectW = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
};
const ptW = (el, dx, dy) => {
    const r = rectW(el);
    return { x: r.x + r.w * dx, y: r.y + r.h * dy };
};
const isVisible = (el) => !!el && el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0;

const textNodesOf = (el) => {
    const out = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
            n.data.trim() && !(n.parentElement && n.parentElement.closest("svg"))
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP,
    });
    let n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
};

const fileNameOf = (img) => {
    try {
        const u = new URL(img.currentSrc || img.src, location.href);
        const inner = u.searchParams.get("url") || u.pathname;
        const base = decodeURIComponent(inner).split("/").pop() || "image.jpg";
        return base.replace(/\.[0-9a-f]{6,}(?=\.)/i, "");
    } catch {
        return "image.jpg";
    }
};

/* ------------------------------------------------------------------ */
/* Formes de curseur                                                    */
/* ------------------------------------------------------------------ */
const SHAPES = (c) => ({
    arrow: `<path d="M0 0L13 7.5L7.5 9L4.3 15.5Z" fill="${c}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>`,
    cross: `<path d="M-8 0H8M0 -8V8" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M-8 0H8M0 -8V8" stroke="${c}" stroke-width="1.8"/>`,
    ibeam: `<path d="M-4 -8h8M-4 8h8M0 -8v16" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M-4 -8h8M-4 8h8M0 -8v16" stroke="${c}" stroke-width="1.8"/>`,
    dup: `<path d="M0 0L13 7.5L7.5 9L4.3 15.5Z" fill="${c}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><circle cx="13" cy="14" r="5.5" fill="#fff" stroke="${c}" stroke-width="1.2"/><path d="M10.5 14h5M13 11.5v5" stroke="${c}" stroke-width="1.5"/>`,
    pen: `<path d="M0 0l3-8 7-6 4 4-6 7z" fill="${c}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>`,
    ew: `<path d="M-10 0h20M-6 -4l-4 4 4 4M6 -4l4 4-4 4" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-10 0h20M-6 -4l-4 4 4 4M6 -4l4 4-4 4" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    bucket: `<path d="M-1 -1l6-6 8 8-6 6z" fill="${c}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/><path d="M-1 -1l-4 4" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M-1 -1l-4 4" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/><path d="M12 6c2.5 3 2.5 5.5 0 7.5c-2.5-2-2.5-4.5 0-7.5z" fill="${c}" stroke="#fff" stroke-width=".8"/>`,
    comment: `<path d="M0 0l2-6h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6z" fill="${c}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/><circle cx="7" cy="1.5" r="1" fill="#fff"/><circle cx="10.5" cy="1.5" r="1" fill="#fff"/><circle cx="14" cy="1.5" r="1" fill="#fff"/>`,
    hand: `<path d="M0 0l2 10 3-2 3 7 3-1-3-7 4-.5z" fill="${c}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/>`,
    rotate: `<path d="M-8 -2a8 8 0 1 1 4 7" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><path d="M-8 -2a8 8 0 1 1 4 7" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><path d="M-11 -5l3 3 3-3" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M-11 -5l3 3 3-3" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
});

class Cursor {
    constructor(layer, name, color, skills, short) {
        Object.assign(this, { name, color, skills, short });
        const fast = RNG() < 0.25;
        this.speed = fast ? rand(1000, 1500) : rand(300, 750);
        this.force = fast ? rand(3500, 6000) : rand(700, 1800);
        this.spin = fast ? rand(2.2, 3.4) : rand(0.8, 1.8);
        this.orbit = rand(70, 170);
        const sh = SHAPES(color);
        this.el = document.createElement("div");
        this.el.className = "bi-cur";
        this.el.innerHTML =
            `<svg width="28" height="28" viewBox="-14 -14 28 28">${Object.keys(sh)
                .map((k) => `<g data-s="${k}">${sh[k]}</g>`)
                .join("")}</svg>` +
            `<span class="bi-tag" style="background:${color}">${esc(name)}</span>` +
            `<span class="bi-msg" style="background:${color}"></span>`;
        this.svg = this.el.firstChild;
        this.groups = [...this.svg.querySelectorAll("g")];
        this.msgEl = this.el.querySelector(".bi-msg");
        layer.appendChild(this.el);
        this.reset();
    }
    reset() {
        Object.assign(this, {
            x: 0, y: 0, vx: 0, vy: 0, angle: 0, press: 0, shape: "arrow",
            path: null, gen: null, task: null, drag: null, sel: null, pen: null,
            chip: null, prog: null, pop: null, key: null, flash: null, gdrag: null,
            caret: null, msgT: 0, rot: null, hold: false,
        });
        this.el.classList.remove("bi-talk");
    }
    say(msg, dur = 2.4) {
        this.msgEl.textContent = msg;
        this.msgT = dur;
        this.el.classList.add("bi-talk");
    }
    render(dt) {
        this.el.style.transform = `translate(${this.x.toFixed(1)}px,${this.y.toFixed(1)}px)`;
        this.svg.style.transform = `rotate(${this.angle}rad) scale(${1 - this.press * 0.12})`;
        if (this._shape !== this.shape) {
            for (const g of this.groups) g.style.display = g.dataset.s === this.shape ? "" : "none";
            this._shape = this.shape;
        }
        if (this.msgT > 0) {
            this.msgT -= dt;
            if (this.msgT <= 0) this.el.classList.remove("bi-talk");
        }
    }
}

/* ------------------------------------------------------------------ */
/* Moteur                                                              */
/* ------------------------------------------------------------------ */
export function startBuildIntro({
    autoplay = true,
    tempoScale = 1,
    rng = Math.random,
    seed = null,
    egg = null,
    mistakes = null,
    debug = false,
    onFinish = null,
} = {}) {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    RNG = rng;
    const events = [];
    const timeline = [];
    const log = (e) => { if (debug) { events.push(e); timeline.push([Number(elapsed.toFixed(2)), e]); } };

    // ---------- overlay ----------
    const world = document.createElement("div");
    world.className = "bi-world";
    const wov = document.createElementNS(SVGNS, "svg");
    world.appendChild(wov);
    const grid = document.createElement("div");
    grid.className = "bi-grid";
    const rul = document.createElementNS(SVGNS, "svg");
    rul.setAttribute("class", "bi-rulers");
    const hud = document.createElement("div");
    hud.className = "bi-hud";
    hud.innerHTML =
        `<span class="bi-pill" data-r="status">3 curseurs</span>` +
        `<button type="button" class="bi-pill bi-btn bi-golive" data-r="golive">🚀 Mettre en ligne</button>` +
        `<span class="bi-pill bi-deploy" data-r="deploy"><i></i><span data-r="dtxt">Build…</span></span>` +
        `<button type="button" class="bi-pill bi-btn" data-r="skip">Passer l'intro<span class="bi-hint"><kbd>clic</kbd><kbd>Espace</kbd><kbd>Échap</kbd></span></button>`;
    const status = hud.querySelector('[data-r="status"]');
    const golive = hud.querySelector('[data-r="golive"]');
    const deploy = hud.querySelector('[data-r="deploy"]');
    const deployTxt = hud.querySelector('[data-r="dtxt"]');
    const skipBtn = hud.querySelector('[data-r="skip"]');
    const replayBtn = document.createElement("button");
    replayBtn.type = "button";
    replayBtn.className = "bi-pill bi-btn bi-replay";
    replayBtn.textContent = "↻ Rejouer l'intro";

    const M = new Cursor(world, "Mathieu Crosnier", ACC, ["box", "dup", "fix", "resolve"], "M");
    const D = new Cursor(world, "Design", WOOD, ["guide", "paint", "line", "image", "color", "comment", "title", "rotate", "toggle"], "D");
    const S = new Cursor(world, "Stagiaire", VIOLET, ["type", "edit", "dupoops"], "S");
    const cursors = [M, D, S];

    // ---------- état restaurable ----------
    let texts = new Map(); // Text -> data d'origine
    let styles = new Map(); // Element -> attribut style d'origine (ou null)
    let tokEls = new Set(); // éléments portant data-bi
    const saveText = (n) => { if (!texts.has(n)) texts.set(n, n.data); };
    const saveStyle = (el) => { if (!styles.has(el)) styles.set(el, el.getAttribute("style")); };
    const toks = (el) => (el.getAttribute("data-bi") || "").split(" ").filter(Boolean);
    const hasTok = (el, t) => toks(el).includes(t);
    const addTok = (el, ...ts) => {
        const s = new Set(toks(el));
        ts.forEach((t) => s.add(t));
        el.setAttribute("data-bi", [...s].join(" "));
        tokEls.add(el);
    };
    const delTok = (el, ...ts) => {
        const s = toks(el).filter((t) => !ts.includes(t));
        if (s.length) el.setAttribute("data-bi", s.join(" "));
        else el.removeAttribute("data-bi");
    };
    function restoreDom() {
        for (const [n, d] of texts) n.data = d;
        for (const [el, s] of styles) {
            if (s === null) el.removeAttribute("style");
            else el.setAttribute("style", s);
        }
        for (const el of tokEls) el.removeAttribute("data-bi");
        root.removeAttribute("data-bi-theme");
        texts = new Map();
        styles = new Map();
        tokEls = new Set();
    }

    // ---------- plan de construction (lié au DOM réel du portfolio) ----------
    let tasks = [];
    let guides = [];
    let comments = [];
    let oops = new Map();
    let said = {};

    function buildPlan() {
        const L = [];
        const byEl = new Map();
        const q = (s, r = document) => (r ? r.querySelector(s) : null);
        const qa = (s, r = document) => (r ? [...r.querySelectorAll(s)] : []);
        const T = (o) => {
            const t = { state: "wait", deps: [], ...o };
            L.push(t);
            if (o.el && ["box", "type", "title", "dup", "dupoops", "paint"].includes(o.kind)) byEl.set(o.el, t);
            return t;
        };
        const box = (el, deps = []) => (isVisible(el) ? T({ kind: "box", el, deps }) : null);
        const type = (el, o = {}) =>
            isVisible(el) && textNodesOf(el).length ? T({ kind: "type", el, deps: o.deps || [], typo: o.typo, grow: o.grow }) : null;
        // Titres de section : tapés par "Design" pour soulager le Stagiaire.
        const title = (el, deps = []) => (isVisible(el) && textNodesOf(el).length ? T({ kind: "title", el, deps }) : null);
        const image = (img, deps = []) => (isVisible(img) ? T({ kind: "image", el: img, file: fileNameOf(img), deps: deps.filter(Boolean) }) : null);
        const dupGroup = (els, o = {}) => {
            els = els.filter(isVisible);
            if (!els.length) return [];
            const first = box(els[0], o.deps || []);
            const out = [first];
            els.slice(1).forEach((el, i) => {
                const kind = o.oops === i + 1 ? "dupoops" : "dup";
                const t = T({ kind, el, src: els[0], group: els, deps: [first, ...(o.deps || [])] });
                out.push(t);
                if (kind === "dupoops") T({ kind: "fix", el, deps: [t] });
                if (o.edit) {
                    const field = o.edit === true ? el : q(o.edit, el);
                    const srcField = o.edit === true ? els[0] : q(o.edit, els[0]);
                    const node = field && textNodesOf(field)[0];
                    const srcNode = srcField && textNodesOf(srcField)[0];
                    if (node && srcNode && node.data.trim() !== srcNode.data.trim()) {
                        t.copy = [{ node, from: srcNode.data }];
                        T({ kind: "edit", el: field, node, deps: [t] });
                    }
                }
            });
            return out;
        };

        // Sections et gestes : voir plan.js (lit les attributs data-intro).
        buildPlanSections(document, { T, box, type, title, image, dupGroup, q, qa, rectW, isVisible, textNodesOf }, {
            snowEnabled: document.documentElement.dataset.snow !== "off",
            mistakes,
        });

        // Dépendance implicite : un élément attend que son conteneur soit construit
        for (const t of L) {
            if (!t.el || t.kind === "guide" || t.kind === "paint") continue;
            let p = t.el.parentElement;
            while (p && p !== document.body) {
                const owner = byEl.get(p);
                if (owner && owner !== t && !t.deps.includes(owner)) { t.deps.push(owner); break; }
                p = p.parentElement;
            }
        }
        L.forEach((t) => (t.deps = t.deps.filter(Boolean)));
        return L;
    }

    function applyInitialState() {
        for (const t of tasks) {
            if (["box", "type", "title", "dup", "dupoops", "line"].includes(t.kind)) addTok(t.el, "hide");
            if (t.kind === "image") addTok(t.el, "noimg");
            if (t.kind === "color") addTok(t.el, "nocolor");
            if (t.kind === "paint") {
                addTok(t.el, "paint");
                saveStyle(t.el);
                t.el.style.setProperty("--bi-r", "0px");
            }
            if (t.kind === "rotate") {
                saveStyle(t.el);
                t.el.style.setProperty("--r", "0deg");
            }
            if (t.kind === "toggle" && t.hero) addTok(t.hero, "nosnow");
        }
    }

    // Débloqué quand l'élément est à l'écran (ou qu'on est déjà tout en bas de la page).
    const atBottom = () => ST() + H() >= document.documentElement.scrollHeight - 12;
    const unlocked = (t) => !t.el || rectW(t.el).y < ST() + H() - 40 || atBottom();
    const pick = (c) =>
        tasks.find((t) => t.state === "wait" && !t.final && c.skills.includes(t.kind) && t.deps.every((d) => d.state === "done") && unlocked(t));
    const doneRatio = () => (tasks.length ? tasks.filter((t) => t.state === "done").length / tasks.length : 0);
    const built = () => tasks.every((t) => t.final || t.state === "done");
    const tempo = () => (1.35 + 1.35 * doneRatio()) * tempoScale;

    // ---------- primitives (générateurs, yield renvoie un dt déjà accéléré) ----------
    function* wait(t) {
        let n = 0;
        while (n < t) n += yield;
    }
    // Attente en temps réel, indépendante du tempo (barre de déploiement).
    function* realWait(t) {
        const until = performance.now() + t * 1000;
        while (performance.now() < until) yield;
    }
    // Déplacement (spec §5.3) : arc à faible courbure, arrivée freinée, puis
    // micro-correction de 2–3 px en 150 ms vers la cible exacte (sauf drag).
    function* moveTo(c, target, o = {}) {
        const end = target();
        const dist = Math.hypot(end.x - c.x, end.y - c.y);
        const dur = clamp(0.12 + Math.sqrt(dist) * 0.021, 0.14, 0.9) / (o.speed || 1);
        const bend = o.bend !== undefined ? o.bend : o.drag ? 0 : bendFor(dist, RNG);
        const settle = !o.drag && o.settle !== false && dist > 24;
        const off = settle ? settleOffset(RNG) : null;
        const first = settle ? () => { const p = target(); return { x: p.x + off.dx, y: p.y + off.dy }; } : target;
        c.path = { sx: c.x, sy: c.y, target: first, t: 0, dur, bend, drag: !!o.drag };
        while (c.path) yield;
        if (settle) {
            c.path = { sx: c.x, sy: c.y, target, t: 0, dur: 0.15, bend: 0, drag: false, settle: true };
            while (c.path) yield;
        }
    }
    // Clic : courte pause après l'arrivée, puis enfoncement.
    function* click(c) {
        yield* wait(preClickPause(RNG));
        c.press = 1;
    }
    // Frappe (spec §5.2) : caractère par caractère sur les textes courts,
    // par rafales de 2 à 4 caractères au-delà de 80 caractères. Délais en ms
    // dans typing.js, en secondes ici.
    const step = (ch) => charDelay(ch, RNG) / 1000;
    function* typeNodes(c, el, nodes, finals, o = {}) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const full = finals[i];
            c.caret = { node, el };
            if (o.typo && i === 0) {
                for (let j = 1; j <= o.typo.length; j++) { node.data = o.typo.slice(0, j); yield* wait(step(o.typo[j - 1])); }
                yield* wait(0.35);
                if (!said.typo) { said.typo = true; D.say("typo 👀", 1.8); }
                yield* wait(0.5);
                node.data = o.typo.slice(0, -1);
                yield* wait(0.14);
                for (let j = o.typo.length; j <= full.length; j++) { node.data = full.slice(0, j); yield* wait(step(full[j - 1])); }
                c.say("corrigé 😅", 1.6);
            } else {
                const lead = full.match(/^\s*/)[0];
                const body = full.slice(lead.length);
                for (const st of typingPlan(body, RNG)) {
                    yield* wait(st.delay / 1000);
                    node.data = lead + body.slice(0, st.upTo);
                }
            }
        }
        c.caret = null;
    }
    const snapGuide = (x) => { for (const g of guides) if (Math.abs(g.x - x) < 9) g.flash = 1; };
    const inView = (p) => ({ x: clamp(p.x, 30, W() - 40), y: clamp(p.y, ST() + 90, ST() + H() - 60) });

    // ---------- tâches ----------
    const jobs = {
        *guide(c, t) {
            c.shape = "ew";
            const y0 = ST() + clamp(H() * 0.35, 140, 320) + rand(-20, 20);
            yield* moveTo(c, () => ({ x: 8, y: y0 }));
            yield* click(c);
            yield* wait(0.1);
            c.gdrag = true;
            const x = t.x();
            yield* moveTo(c, () => ({ x, y: y0 + rand(-14, 14) }), { drag: true, bend: 0, speed: dragSpeed(RNG) });
            c.gdrag = null;
            guides.push({ x, flash: 1 });
            c.press = 1;
            yield* wait(0.25);
            c.shape = "arrow";
        },
        *box(c, t) {
            const el = t.el;
            c.shape = "cross";
            yield* moveTo(c, () => ptW(el, 0, 0));
            yield* click(c);
            snapGuide(ptW(el, 0, 0).x);
            yield* wait(0.08);
            c.drag = { kind: "box", el };
            yield* moveTo(c, () => ptW(el, 1, 1), { drag: true, bend: 0, speed: dragSpeed(RNG) });
            c.drag = null;
            c.press = 1;
            addTok(el, "ph");
            delTok(el, "hide");
            yield* wait(rand(0.18, 0.3));
            delTok(el, "ph");
            c.shape = "arrow";
            yield* wait(0.15);
        },
        *type(c, t) {
            const el = t.el;
            const nodes = textNodesOf(el);
            const finals = nodes.map((n) => { saveText(n); return texts.get(n); });
            c.shape = "ibeam";
            yield* moveTo(c, () => ptW(el, 0, 0.5));
            yield* click(c);
            snapGuide(ptW(el, 0, 0.5).x);
            yield* wait(0.1);
            saveStyle(el);
            el.style.minHeight = `${el.getBoundingClientRect().height}px`;
            nodes.forEach((n) => (n.data = ""));
            if (t.grow) { el.style.transformOrigin = "left center"; el.style.transform = "scale(.55)"; }
            delTok(el, "hide");
            yield* typeNodes(c, el, nodes, finals, { typo: t.typo });
            if (t.grow) {
                for (const s of [0.68, 0.8, 0.9, 1]) { el.style.transform = `scale(${s})`; c.key = "⌘ +"; yield* wait(0.07); }
                c.key = null;
                el.style.transform = "";
                el.style.transformOrigin = "";
            }
            el.style.minHeight = "";
            c.shape = "arrow";
            yield* wait(0.12);
        },
        *title(c, t) { yield* jobs.type(c, t); },
        // Rotation par poignée : le curseur attrape un point au-dessus de la carte
        // et décrit un arc ; la carte suit (--r), un badge affiche l'angle.
        *rotate(c, t) {
            const el = t.el;
            c.shape = "rotate";
            const center = () => ptW(el, 0.5, 0.5);
            const radius = () => rectW(el).h / 2 + 28;
            const handleAt = (deg) => {
                const o = center();
                const a = (deg * Math.PI) / 180;
                return { x: o.x + Math.sin(a) * radius(), y: o.y - Math.cos(a) * radius() };
            };
            saveStyle(el);
            const from = parseFloat(el.style.getPropertyValue("--r")) || 0;
            yield* moveTo(c, () => handleAt(from));
            yield* click(c);
            c.rot = { el, angle: from };
            yield* wait(0.1);
            el.style.transition = "none";
            c.hold = true;
            let k = 0;
            while (k < 1) {
                k = Math.min(1, k + (yield) / 0.7);
                const a = from + (t.angle - from) * easeInOut(k);
                el.style.setProperty("--r", `${a.toFixed(2)}deg`);
                c.rot.angle = a;
                const p = handleAt(a);
                c.x = p.x;
                c.y = p.y;
            }
            el.style.setProperty("--r", `${t.angle}deg`);
            c.hold = false;
            c.press = 1;
            yield* wait(0.25);
            c.rot = null;
            el.style.transition = "";
            c.shape = "arrow";
            yield* wait(0.1);
        },
        // Interrupteur neige : clic animé sur le vrai bouton, sans déclencher React.
        *toggle(c, t) {
            const el = t.el;
            yield* moveTo(c, () => ptW(el, 0.5, 0.5));
            yield* click(c);
            addTok(el, "pressed");
            yield* wait(0.15);
            delTok(el, "pressed");
            if (t.hero) delTok(t.hero, "nosnow");
            c.say("et la neige ❄️", 1.8);
            yield* wait(0.3);
        },
        *dup(c, t) { yield* dupJob(c, t, false); },
        *dupoops(c, t) { yield* dupJob(c, t, true); },
        *edit(c, t) {
            const el = t.el;
            const node = t.node;
            saveText(node);
            const full = texts.get(node);
            c.shape = "ibeam";
            yield* moveTo(c, () => ptW(el, 0.3, 0.5));
            yield* click(c);
            yield* wait(0.09);
            c.press = 1;
            addTok(el, "sel");
            yield* wait(rand(0.2, 0.35));
            delTok(el, "sel");
            node.data = "";
            yield* typeNodes(c, el, [node], [full]);
            c.shape = "arrow";
            yield* wait(0.1);
        },
        *line(c, t) {
            const el = t.el;
            c.shape = "pen";
            const pts = t.pts();
            c.pen = [];
            for (const p of pts) {
                yield* moveTo(c, () => p, { bend: rand(-3, 3), speed: 1.2, settle: false });
                c.press = 1;
                c.pen.push(p);
                yield* wait(rand(0.04, 0.12));
            }
            addTok(el, "settle");
            delTok(el, "hide");
            c.pen = null;
            c.shape = "arrow";
            yield* wait(0.2);
            delTok(el, "settle");
        },
        *paint(c, t) {
            const sec = t.el;
            c.shape = "bucket";
            if (!said.paint) { said.paint = true; c.say("le ciel d'abord 🪣", 2); }
            yield* moveTo(c, () => inView(ptW(sec, 0.12, 0.2)));
            yield* click(c);
            const r = rectW(sec);
            const px = c.x - r.x;
            const py = c.y - r.y;
            const max = Math.hypot(Math.max(px, r.w - px), Math.max(py, r.h - py)) + 4;
            sec.style.setProperty("--bi-px", `${px}px`);
            sec.style.setProperty("--bi-py", `${py}px`);
            let k = 0;
            while (k < 1) {
                k = Math.min(1, k + (yield) / 0.8);
                sec.style.setProperty("--bi-r", `${easeOut(k) * max}px`);
            }
            delTok(sec, "paint");
            yield* wait(0.2);
            c.shape = "arrow";
        },
        *image(c, t) {
            const el = t.el;
            yield* moveTo(c, () => ({ x: W() - 40, y: clamp(ptW(el, 0.5, 0.5).y, ST() + 90, ST() + H() - 60) }), { speed: 1.1 });
            yield* click(c);
            c.shape = "hand";
            c.chip = t.file;
            yield* wait(0.15);
            yield* moveTo(c, () => ptW(el, 0.5, 0.5), { drag: true, speed: dragSpeed(RNG) });
            c.chip = null;
            c.shape = "arrow";
            c.press = 1;
            c.prog = { el, k: 0 };
            let k = 0;
            while (k < 1) { k = Math.min(1, k + (yield) / 0.45); c.prog.k = k; }
            c.prog = null;
            delTok(el, "noimg");
            yield* wait(0.15);
        },
        *color(c, t) {
            const el = t.el;
            yield* moveTo(c, () => ptW(el, 0.85, 0.5));
            yield* click(c);
            yield* wait(0.12);
            const o = ptW(el, 1, 0);
            c.pop = { x: o.x + 14, y: o.y - 6, pick: 4 };
            yield* wait(0.35);
            yield* moveTo(c, () => ({ x: c.pop.x + 10 + 4 * 18 + 6, y: c.pop.y + 14 }), { speed: 0.9 });
            yield* click(c);
            yield* wait(0.15);
            delTok(el, "nocolor");
            c.pop = null;
            yield* wait(0.25);
        },
        *comment(c, t) {
            const el = t.el;
            c.shape = "comment";
            const at = () => ptW(el, 0.5, 0.5);
            yield* moveTo(c, at);
            yield* click(c);
            const p = at();
            t.pin = { x: p.x, y: p.y, text: t.text, state: "open", who: c, k: 0 };
            comments.push(t.pin);
            yield* wait(0.6);
            c.shape = "arrow";
        },
        *resolve(c, t) {
            const pin = t.comment.pin;
            if (!pin) return;
            yield* moveTo(c, () => ({ x: pin.x, y: pin.y }));
            yield* click(c);
            pin.state = "done";
            yield* wait(0.55);
            comments = comments.filter((x) => x !== pin);
            yield* wait(0.1);
        },
        *fix(c, t) {
            const el = t.el;
            const o = oops.get(el);
            if (!o) return;
            c.say("je réaligne", 1.8);
            yield* moveTo(c, () => ptW(el, 0.5, 0.5));
            yield* click(c);
            c.sel = el;
            yield* wait(0.25);
            while (o.x > 0) { o.x = Math.max(0, o.x - 6.5); el.style.transform = `translate(${o.x}px,${o.y}px)`; c.key = "←"; yield* wait(0.075); }
            c.key = null;
            yield* wait(0.15);
            while (o.y > 0) { o.y = Math.max(0, o.y - 6); el.style.transform = `translate(${o.x}px,${o.y}px)`; c.key = "↑"; yield* wait(0.075); }
            c.key = null;
            el.style.transform = "";
            oops.delete(el);
            c.sel = null;
            c.flash = { el, k: 1 };
            yield* wait(0.35);
        },
    };
    function* dupJob(c, t, bad) {
        const s = t.src;
        const el = t.el;
        c.shape = "arrow";
        yield* moveTo(c, () => ptW(s, 0.5, 0.5));
        yield* click(c);
        c.sel = s;
        yield* wait(rand(0.15, 0.3));
        c.shape = "dup";
        c.drag = { kind: "dup", el, src: s, group: t.group };
        const off = bad ? { x: 28, y: 14 } : { x: 0, y: 0 };
        yield* moveTo(c, () => { const p = ptW(el, 0.5, 0.5); return { x: p.x + off.x, y: p.y + off.y }; }, { drag: true, bend: 0, speed: dragSpeed(RNG) });
        c.drag = null;
        c.sel = null;
        (t.copy || []).forEach(({ node, from }) => { saveText(node); node.data = from; });
        if (bad) {
            saveStyle(el);
            el.style.transform = `translate(${off.x}px,${off.y}px)`;
            oops.set(el, { x: off.x, y: off.y, group: t.group });
        }
        addTok(el, "settle");
        delTok(el, "hide");
        if (bad) c.say("oups 😬", 1.8);
        yield* wait(0.2);
        delTok(el, "settle");
        c.shape = "arrow";
        yield* wait(0.05);
    }

    let live = false;
    let destroyed = false;
    function* finalJob(c, i) {
        const spots = [{ x: -80, y: 0 }, { x: 80, y: -30 }, { x: 10, y: 60 }];
        golive.style.display = "inline-block";
        yield* moveTo(c, () => ({ x: W() / 2 + spots[i].x, y: ST() + H() / 2 + spots[i].y }));
        yield* wait(0.5 + i * 0.6);
        c.say(["Site prêt ✓", "on publie ? 🚀", "go go go 🎉"][i], 2.6);
        yield* wait(2.4 - i * 0.5);
        if (i === 0) {
            yield* moveTo(c, () => { const r = golive.getBoundingClientRect(); return { x: r.left + r.width / 2, y: ST() + r.top + r.height / 2 }; });
            yield* click(c);
            golive.classList.add("bi-pressed");
            yield* wait(0.15);
            golive.classList.remove("bi-pressed");
            golive.textContent = "✓ En ligne";
            tasks.filter((t) => t.final).forEach((t) => { t.state = "done"; log(`task:${t.kind}:`); });
            deploy.style.display = "inline-flex";
            deploy.classList.add("bi-building");
            deploy.classList.remove("bi-deployed");
            deployTxt.textContent = "Build…";
            yield* realWait(1.2);
            deploy.classList.remove("bi-building");
            deploy.classList.add("bi-deployed");
            deployTxt.textContent = "Déployé ✓";
            log("deployed");
            yield* realWait(0.8);
            live = true;
            guides = [];
            comments = [];
            grid.classList.add("bi-fadeout");
            rul.classList.add("bi-fadeout");
            yield* wait(0.9);
        } else {
            while (!live) yield;
            yield* wait(0.4 + i * 0.3);
        }
        const exits = [{ x: -80, y: ST() + 120 }, { x: W() + 80, y: ST() + 160 }, { x: W() / 2 + 60, y: ST() + H() + 80 }];
        yield* moveTo(c, () => exits[i], { speed: 0.7 });
    }

    // ---------- physique ----------
    let time = 0;
    let mouse = null;
    // Au repos, le curseur se pose près de sa prochaine tâche (40 px au-dessus)
    // ou reste où il est s'il n'en a plus.
    const home = (c) => {
        const nxt = tasks.find((t) => t.state === "wait" && c.skills.includes(t.kind) && t.el);
        if (!nxt) return { x: c.x, y: c.y };
        const p = ptW(nxt.el, 0.5, 0.5);
        return { x: clamp(p.x, 60, W() - 140), y: clamp(p.y - 40, ST() + 100, ST() + H() - 80) };
    };
    function physics(c, dt) {
        if (c.path) {
            const p = c.path;
            p.t = Math.min(1, p.t + (dt * tempo()) / p.dur);
            const e = p.drag ? easeInOut(p.t) : p.settle ? easeOut(p.t) : approachEase(p.t);
            const end = p.target();
            const dx = end.x - p.sx;
            const dy = end.y - p.sy;
            const L = Math.hypot(dx, dy) || 1;
            const b = Math.sin(Math.PI * e) * p.bend;
            const x = p.sx + dx * e + (-dy / L) * b;
            const y = p.sy + dy * e + (dx / L) * b;
            c.vx = (x - c.x) / dt;
            c.vy = (y - c.y) / dt;
            c.x = x;
            c.y = y;
            if (p.t >= 1) { c.path = null; c.vx *= 0.1; c.vy *= 0.1; }
        } else if (c.hold) {
            c.vx = 0;
            c.vy = 0;
        } else {
            const h = home(c);
            const R = IDLE.radius * (1 + 0.18 * Math.sin(time * 0.55));
            const swirl = Math.tanh(3 * Math.cos(time * 0.11));
            const dx = c.x - h.x;
            const dy = c.y - h.y;
            const d = Math.hypot(dx, dy) || 1;
            const nx = dx / d;
            const ny = dy / d;
            const ang = Math.atan2(dy, dx);
            const rr = R * (1 + 0.3 * Math.sin(3 * ang + 0.7 * time)) + (c.orbit - 120) * 0.1;
            const tang = IDLE.tangent * (0.7 + c.spin * 0.2) * swirl;
            const rad = clamp((rr - d) * 4, -900, 600);
            let wx = tang * -ny + rad * nx + Math.sin(time * 0.9 + c.orbit) * IDLE.drift;
            let wy = tang * nx + rad * ny + Math.cos(time * 0.7 + c.orbit) * IDLE.drift;
            for (const o of cursors) {
                if (o === c) continue;
                const ox = c.x - o.x;
                const oy = c.y - o.y;
                const od = Math.hypot(ox, oy);
                if (od < 70 && od > 0) { wx += (ox / od) * (70 - od) * 6; wy += (oy / od) * (70 - od) * 6; }
            }
            let ax = (wx - c.vx) * 6;
            let ay = (wy - c.vy) * 6;
            const am = Math.hypot(ax, ay);
            if (am > c.force) { ax *= c.force / am; ay *= c.force / am; }
            c.vx += ax * dt;
            c.vy += ay * dt;
            const vm = Math.hypot(c.vx, c.vy);
            const cap = c.speed * 0.5;
            if (vm > cap) { c.vx *= cap / vm; c.vy *= cap / vm; }
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            if (mouse) {
                const mx = c.x - mouse.x;
                const my = c.y - mouse.y;
                const md = Math.hypot(mx, my);
                if (md < 48 && md > 0) {
                    c.x = mouse.x + (mx / md) * 48;
                    c.y = mouse.y + (my / md) * 48;
                    c.vx += (mx / md) * 260;
                    c.vy += (my / md) * 260;
                }
            }
        }
        const tgt = clamp(c.vx * 0.0008, -0.45, 0.45);
        c.angle += (tgt - c.angle) * Math.min(1, dt * 8);
        c.press = Math.max(0, c.press - dt * 6);
        if (c.flash) { c.flash.k -= dt * 2.2; if (c.flash.k <= 0) c.flash = null; }
    }

    // ---------- dessin de l'overlay ----------
    let lastOv = "";
    let lastRul = "";
    const rectS = (x, y, w, h, col, dash, sw = 1.5) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${col}" stroke-width="${sw}"${dash ? ' stroke-dasharray="5 3"' : ""}/>`;
    const handles = (x, y, w, h, col) =>
        [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
            .map(([a, b]) => `<rect x="${a - 3}" y="${b - 3}" width="6" height="6" fill="#fff" stroke="${col}"/>`)
            .join("");
    const badge = (x, y, txt, col) => {
        const w = String(txt).length * 6.4 + 10;
        return `<g transform="translate(${x},${y})"><rect width="${w}" height="17" rx="3" fill="${col}"/><text x="${w / 2}" y="12.2" font-size="10.5" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif">${esc(txt)}</text></g>`;
    };
    const keycap = (x, y, txt, col) =>
        `<g transform="translate(${x},${y})"><rect width="30" height="24" rx="4" fill="#fff" stroke="${col}" stroke-width="1.2"/><rect x="2" y="2" width="26" height="18" rx="3" fill="#f3f4f6"/><text x="15" y="15" font-size="11" fill="${col}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700">${esc(txt)}</text></g>`;
    const lineS = (a, b, c2, d, col, sw = 1.2) => `<line x1="${a}" y1="${b}" x2="${c2}" y2="${d}" stroke="${col}" stroke-width="${sw}"/>`;
    const SW = ["#cfd4da", WOOD, GREEN, ACC, "oklch(20% 0.014 235)"];

    function measures(x, y, w, h, el, group) {
        let s = "";
        let left = null;
        let above = null;
        for (const sib of group || []) {
            if (sib === el || hasTok(sib, "hide")) continue;
            const r = rectW(sib);
            if (Math.abs(r.y - y) < 30 && r.x + r.w <= x + 4 && (!left || r.x > left.x)) left = r;
            if (Math.abs(r.x - x) < 34 && r.y + r.h <= y + 4 && (!above || r.y > above.y)) above = r;
        }
        if (left) {
            const yy = y + h / 2;
            const g = x - (left.x + left.w);
            s += lineS(left.x + left.w, yy, x, yy, RED) + badge((left.x + left.w + x) / 2 - 10, yy - 22, Math.round(g), RED);
        }
        if (above) {
            const xx = x + w / 2;
            const g = y - (above.y + above.h);
            s += lineS(xx, above.y + above.h, xx, y, RED) + badge(xx + 8, (above.y + above.h + y) / 2 - 8, Math.round(g), RED);
        }
        return s;
    }
    function caretRect(node, el) {
        try {
            const r = document.createRange();
            const len = node.data.length;
            r.setStart(node, len);
            r.setEnd(node, len);
            const rc = r.getClientRects()[0] || r.getBoundingClientRect();
            if (rc && rc.height) return { x: rc.left + window.scrollX, y: rc.top + window.scrollY, h: rc.height };
        } catch { /* nœud détaché */ }
        const er = rectW(el);
        return { x: er.x, y: er.y, h: Math.min(er.h, 24) || 16 };
    }

    function overlay(dt) {
        const PH = document.documentElement.scrollHeight;
        if (world._h !== PH) { world.style.height = `${PH}px`; world._h = PH; }
        let s = "";
        for (const g of guides) {
            g.flash = Math.max(0, g.flash - dt * 2.5);
            s += lineS(g.x, 0, g.x, PH, RED, g.flash > 0 ? 2.2 : 1);
            if (g.flash > 0) s += `<line x1="${g.x}" y1="0" x2="${g.x}" y2="${PH}" stroke="${RED}" stroke-width="8" opacity="${(g.flash * 0.25).toFixed(2)}"/>`;
        }
        for (const [el, o] of oops) {
            const r = rectW(el);
            s += rectS(r.x - 2, r.y - 2, r.w + 4, r.h + 4, RED, true, 1.2) + measures(r.x, r.y, r.w, r.h, el, o.group);
        }
        for (const c of cursors) {
            if (c.sel) { const r = rectW(c.sel); s += rectS(r.x - 2, r.y - 2, r.w + 4, r.h + 4, RED, false) + handles(r.x - 2, r.y - 2, r.w + 4, r.h + 4, RED); }
            if (c.flash) {
                const r = rectW(c.flash.el);
                s += rectS(r.x - 2, r.y - 2, r.w + 4, r.h + 4, GREEN, false, 2) +
                    `<rect x="${r.x - 2}" y="${r.y - 2}" width="${r.w + 4}" height="${r.h + 4}" fill="${GREEN}" opacity="${(c.flash.k * 0.18).toFixed(2)}"/>`;
            }
            if (c.gdrag) s += lineS(c.x, 0, c.x, PH, RED, 1.2) + badge(c.x + 10, c.y - 26, `x ${Math.round(c.x)}`, RED);
            if (c.drag && c.drag.kind === "box") {
                const o = ptW(c.drag.el, 0, 0);
                const x = Math.min(o.x, c.x);
                const y = Math.min(o.y, c.y);
                const w = Math.abs(c.x - o.x);
                const h = Math.abs(c.y - o.y);
                s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.color}" opacity=".08"/>` +
                    rectS(x, y, w, h, c.color, true) + handles(x, y, w, h, c.color) +
                    badge(x + w + 8, y + h + 8, `${Math.round(w)} × ${Math.round(h)}`, c.color);
            }
            if (c.drag && c.drag.kind === "dup") {
                const sr = rectW(c.drag.src);
                const x = c.x - sr.w / 2;
                const y = c.y - sr.h / 2;
                s += `<rect x="${x}" y="${y}" width="${sr.w}" height="${sr.h}" fill="${c.color}" opacity=".1"/>` +
                    rectS(x, y, sr.w, sr.h, c.color, true) + measures(x, y, sr.w, sr.h, c.drag.el, c.drag.group);
            }
            if (c.pen) {
                const pts = c.pen.map((p) => `${p.x},${p.y}`).join(" ");
                s += `<polyline points="${pts} ${c.x},${c.y}" fill="none" stroke="${c.color}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
                    c.pen.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="#fff" stroke="${c.color}"/>`).join("");
            }
            if (c.caret && Math.floor(time * 2.2) % 2 === 0) {
                const r = caretRect(c.caret.node, c.caret.el);
                s += `<rect x="${r.x + 1}" y="${r.y + 1}" width="1.6" height="${Math.max(10, r.h - 2)}" fill="${c.color}"/>`;
            }
            if (c.chip) {
                const w = c.chip.length * 6.6 + 36;
                s += `<g transform="translate(${c.x + 14},${c.y + 18})"><rect width="${w}" height="26" rx="6" fill="#fff" stroke="${c.color}" stroke-width="1.2"/><rect x="7" y="7" width="12" height="12" rx="2" fill="none" stroke="${c.color}" stroke-width="1.3"/><circle cx="10.5" cy="10.5" r="1.3" fill="${c.color}"/><path d="M7 17l4-4 3 3 2-2 3 3" fill="none" stroke="${c.color}" stroke-width="1.2"/><text x="26" y="17" font-size="11.5" fill="#333" font-family="system-ui,sans-serif">${esc(c.chip)}</text></g>`;
            }
            if (c.prog) {
                const r = rectW(c.prog.el);
                s += `<rect x="${r.x}" y="${r.y + r.h - 4}" width="${r.w}" height="4" fill="rgba(0,0,0,.15)"/><rect x="${r.x}" y="${r.y + r.h - 4}" width="${r.w * c.prog.k}" height="4" fill="${c.color}"/>` +
                    badge(r.x + r.w / 2 - 16, r.y + r.h / 2 - 8, `${Math.round(c.prog.k * 100)} %`, c.color);
            }
            if (c.pop) {
                const p = c.pop;
                s += `<g transform="translate(${p.x},${p.y})"><rect width="${10 + 5 * 18 + 4}" height="28" rx="6" fill="#fff" stroke="#d0d5dc"/>` +
                    SW.map((col, i) => `<rect x="${10 + i * 18 - 3}" y="7" width="14" height="14" rx="4" fill="${col}"${i === p.pick ? ` stroke="${ACC}" stroke-width="2"` : ""}/>`).join("") +
                    `</g>`;
            }
            if (c.key) s += keycap(c.x + 16, c.y - 32, c.key, c.color);
            if (c.rot) {
                const r = rectW(c.rot.el);
                s += lineS(r.x + r.w / 2, r.y + r.h / 2, c.x, c.y, c.color, 1.2) +
                    `<circle cx="${c.x}" cy="${c.y}" r="5" fill="#fff" stroke="${c.color}" stroke-width="1.5"/>` +
                    badge(c.x + 12, c.y - 26, `${Math.round(c.rot.angle)}°`, c.color);
            }
        }
        for (const pin of comments) {
            pin.k = Math.min(1, pin.k + dt * 4);
            const col = pin.state === "done" ? GREEN : pin.who.color;
            s += `<g transform="translate(${pin.x},${pin.y}) scale(${easeOut(pin.k).toFixed(3)})"><path d="M0 0L5 -11L12 -4Z" fill="${col}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="15" cy="-15" r="12" fill="${col}" stroke="#fff" stroke-width="1.5"/><text x="15" y="-11" font-size="11.5" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700">${pin.state === "done" ? "✓" : pin.who.short}</text></g>`;
            if (pin.state === "open" && pin.k >= 1) {
                const w = pin.text.length * 6.6 + 18;
                s += `<g transform="translate(${pin.x + 32},${pin.y - 28})"><rect width="${w}" height="26" rx="8" fill="#fff" stroke="#d0d5dc"/><text x="9" y="17" font-size="11.5" fill="#222" font-family="system-ui,sans-serif">${esc(pin.text)}</text></g>`;
            }
        }
        if (s !== lastOv) { wov.innerHTML = s; lastOv = s; }

        // Grille de points qui suit le scroll, règles graduées fixes
        grid.style.backgroundPosition = `0 ${-(ST() % 20)}px`;
        const w = W();
        const h = H();
        const st = ST();
        let r = `<rect x="0" y="0" width="${w}" height="16" fill="rgba(245,246,248,.94)"/><rect x="0" y="0" width="16" height="${h}" fill="rgba(245,246,248,.94)"/><line x1="0" y1="16" x2="${w}" y2="16" stroke="#cfd4da"/><line x1="16" y1="0" x2="16" y2="${h}" stroke="#cfd4da"/>`;
        for (let x = 0; x < w; x += 10) {
            const big = x % 50 === 0;
            r += `<line x1="${x}" y1="${big ? 8 : 12}" x2="${x}" y2="16" stroke="#8b939e" stroke-width=".8"/>`;
            if (big && x > 16) r += `<text x="${x + 2}" y="8" font-size="7" fill="#6b7280" font-family="system-ui,sans-serif">${x}</text>`;
        }
        for (let y = Math.floor(st / 10) * 10; y < st + h; y += 10) {
            const yy = y - st;
            if (yy < 16) continue;
            const big = y % 50 === 0;
            r += `<line x1="${big ? 8 : 12}" y1="${yy}" x2="16" y2="${yy}" stroke="#8b939e" stroke-width=".8"/>`;
            if (big) r += `<text transform="translate(7,${yy + 2}) rotate(-90)" font-size="7" fill="#6b7280" font-family="system-ui,sans-serif">${y}</text>`;
        }
        for (const c of cursors) {
            if (!c.el.classList.contains("bi-show")) continue;
            r += `<line x1="${c.x}" y1="0" x2="${c.x}" y2="16" stroke="${c.color}" stroke-width="1.5"/><line x1="0" y1="${c.y - st}" x2="16" y2="${c.y - st}" stroke="${c.color}" stroke-width="1.5"/>`;
        }
        if (r !== lastRul) { rul.innerHTML = r; lastRul = r; }
    }

    // ---------- scroll automatique ----------
    let expectedScroll = 0;
    function tour(dt) {
        let y = Infinity;
        for (const t of tasks) if (t.state === "run" && t.el) y = Math.min(y, rectW(t.el).y);
        const first = tasks.find((t) => t.state === "wait" && t.el && !t.final);
        if (first) y = Math.min(y, rectW(first.el).y);
        if (y === Infinity) return;
        const maxS = document.documentElement.scrollHeight - H();
        const desired = clamp(y - 190, 0, Math.max(0, maxS));
        const delta = desired - ST();
        if (Math.abs(delta) < 0.5) return;
        // Pas d'au moins 1 px : sinon l'arrondi du navigateur bloque la fin du trajet.
        const stepPx = Math.sign(delta) * Math.max(1, Math.abs(delta) * Math.min(1, dt * 2.5 * tempoScale));
        const next = Math.abs(stepPx) > Math.abs(delta) ? desired : ST() + stepPx;
        window.scrollTo({ top: next, behavior: "instant" });
        expectedScroll = ST();
    }

    // ---------- boucle ----------
    let running = false;
    let phase = "idle";
    let elapsed = 0;
    let last = 0;
    let finals = null;
    let raf = 0;
    let scriptI = 0;
    const script = [
        [0.4, M, "On construit le portfolio ?"],
        [1.4, D, "je pose les repères 📐"],
        [2.3, S, "je prends les textes ✍️"],
    ];

    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        if (!running) return;
        // L'utilisateur a fait défiler la page lui-même (barre de défilement...) : on arrête.
        if (phase === "build" && Math.abs(ST() - expectedScroll) > 40) { finish(true); return; }
        time += dt;
        elapsed += dt;
        status.textContent = `3 curseurs · ${elapsed.toFixed(1)} s`;
        while (scriptI < script.length && elapsed >= script[scriptI][0]) { script[scriptI][1].say(script[scriptI][2]); scriptI++; }
        if (phase === "build") {
            tour(dt);
            for (const c of cursors) {
                if (!c.gen) {
                    const t = pick(c);
                    if (t) { t.state = "run"; c.task = t; c.gen = jobs[t.kind](c, t); }
                }
                if (c.gen) {
                    const r = c.gen.next(dt * tempo());
                    if (r.done) { c.task.state = "done"; log(`task:${c.task.kind}:${(c.task.el && c.task.el.dataset && c.task.el.dataset.intro) || ""}`); c.task = null; c.gen = null; }
                }
            }
            if (built()) {
                phase = "final";
                finals = cursors.map((c, i) => finalJob(c, i));
            }
        } else if (phase === "final") {
            let left = 0;
            finals.forEach((g, i) => {
                if (!g) return;
                const r = g.next(dt * tempoScale);
                if (r.done) finals[i] = null;
                else left++;
            });
            if (!left) finish(false);
        }
        for (const c of cursors) { physics(c, dt); c.render(dt); }
        overlay(dt);
    }

    // ---------- interactions ----------
    const SKIP_KEYS = new Set([" ", "Escape", "Enter", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"]);
    const onKey = (e) => {
        if (!running || !SKIP_KEYS.has(e.key)) return;
        e.preventDefault();
        finish(true);
    };
    const onPointer = (e) => {
        if (!running) return;
        if (e.target instanceof Element && e.target.closest(".bi-golive")) return;
        if (e.cancelable && e.type !== "touchstart") e.preventDefault();
        finish(true);
    };
    const onWheel = () => { if (running) finish(true); };
    const onResize = () => { if (running) finish(true); };
    const onMove = (e) => { mouse = { x: e.pageX, y: e.pageY }; };
    const onLeave = () => { mouse = null; };

    function listen(on) {
        const m = on ? "addEventListener" : "removeEventListener";
        window[m]("keydown", onKey, true);
        window[m]("mousedown", onPointer, true);
        window[m]("touchstart", onPointer, { capture: true, passive: true });
        window[m]("wheel", onWheel, { passive: true });
        window[m]("resize", onResize);
        window[m]("mousemove", onMove, { passive: true });
        document.documentElement[m]("mouseleave", onLeave);
    }
    skipBtn.addEventListener("click", (e) => { e.stopPropagation(); finish(true); });
    replayBtn.addEventListener("click", () => play());

    // ---------- cycle de vie ----------
    function mount() {
        document.body.append(grid, world, rul, hud);
        replayBtn.remove();
    }
    function unmountOverlay() {
        grid.remove();
        world.remove();
        rul.remove();
        hud.remove();
    }

    async function play() {
        if (running) return;
        window.scrollTo({ top: 0, behavior: "instant" });
        expectedScroll = 0;
        root.classList.add("bi-pending");
        if (document.fonts && document.fonts.ready) {
            await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
        }
        if (destroyed || running) return;
        restoreDom();
        tasks = buildPlan();
        guides = [];
        comments = [];
        oops = new Map();
        said = {};
        scriptI = 0;
        elapsed = 0;
        time = 0;
        live = false;
        finals = null;
        lastOv = "";
        lastRul = "";
        world._h = 0;
        applyInitialState();
        root.classList.remove("bi-pending", "bi-skipped", "bi-done");
        root.classList.add("bi-live");
        grid.classList.remove("bi-fadeout");
        rul.classList.remove("bi-fadeout", "bi-in");
        golive.style.display = "none";
        golive.textContent = "🚀 Mettre en ligne";
        deploy.style.display = "none";
        skipBtn.style.display = "";
        mount();
        requestAnimationFrame(() => rul.classList.add("bi-in"));
        M.reset(); D.reset(); S.reset();
        M.x = -40; M.y = 220;
        D.x = W() + 40; D.y = 260;
        S.x = W() / 2; S.y = H() + 40;
        for (const c of cursors) { c.render(0); c.el.classList.add("bi-show"); }
        phase = "build";
        running = true;
        listen(true);
    }

    function finish(wasSkipped) {
        if (!running) return;
        running = false;
        phase = "idle";
        listen(false);
        restoreDom();
        tasks.forEach((t) => (t.state = "done"));
        guides = [];
        comments = [];
        oops = new Map();
        for (const c of cursors) { c.reset(); c.el.classList.remove("bi-show"); }
        wov.innerHTML = "";
        lastOv = "";
        unmountOverlay();
        root.classList.remove("bi-live");
        root.classList.add(wasSkipped ? "bi-skipped" : "bi-done");
        replayBtn.title = wasSkipped ? `Intro passée à ${elapsed.toFixed(1)} s` : `Construit par 3 curseurs en ${elapsed.toFixed(1)} s`;
        document.body.appendChild(replayBtn);
        if (!wasSkipped) window.scrollTo({ top: 0, behavior: "smooth" });
        log(wasSkipped ? "finish:skip" : "finish:done");
        if (onFinish) onFinish(wasSkipped);
    }

    function destroy() {
        destroyed = true;
        cancelAnimationFrame(raf);
        if (running) { running = false; listen(false); }
        restoreDom();
        unmountOverlay();
        replayBtn.remove();
        cursors.forEach((c) => c.el.remove());
        root.classList.remove("bi-pending", "bi-live");
        if (debug && window.__intro && window.__intro.destroy === destroy) delete window.__intro;
    }

    raf = requestAnimationFrame((t) => { last = t; frame(t); });
    if (debug) {
        window.__intro = {
            plan: () => tasks.map((t) => ({ kind: t.kind, intro: (t.el && t.el.dataset && t.el.dataset.intro) || null, state: t.state })),
            play,
            skip: () => finish(true),
            events,
            timeline,
            elapsed: () => elapsed,
            seed,
            egg,
            mistakes,
            destroy,
        };
    }
    if (autoplay && !reduced) play();
    else {
        root.classList.remove("bi-pending");
        document.body.appendChild(replayBtn);
    }

    return { play, skip: () => finish(true), destroy };
}
