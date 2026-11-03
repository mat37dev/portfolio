"use client";
import { useEffect, useRef } from "react";
import { RIDGE_POLYGONS, TOPO_PATHS } from "./ridge";

const RIDGE_FILLS = ["url(#ridge-g1)", "url(#ridge-g2)", "url(#ridge-g3)", "var(--r4)"];

/**
 * Fond du hero (spec §4.4) : ciel, étoiles (nuit), halo, lignes de niveau,
 * crêtes SVG et canvas de neige.
 *
 * La neige ne dessine pas si `html[data-snow="off"]`, si le hero porte
 * `data-bi~="nosnow"` (moteur d'intro), si l'utilisateur préfère moins de
 * mouvement, ou si l'onglet est caché. La boucle rAF s'arrête alors.
 */
export default function HeroBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const hero = canvas?.closest('[data-intro="hero"]');
        if (!canvas || !hero) return;
        const ctx = canvas.getContext("2d");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

        let flakes = [];
        let raf = 0;
        let running = false;

        const resize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            flakes = Array.from({ length: Math.round(canvas.width / 11) }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2.2 + 0.9,
                s: Math.random() * 0.55 + 0.25,
                w: Math.random() * 6.28,
                o: Math.random() * 0.5 + 0.5,
            }));
        };

        const shouldDraw = () =>
            document.documentElement.dataset.snow !== "off" &&
            !(hero.getAttribute("data-bi") || "").split(/\s+/).includes("nosnow") &&
            !reduce.matches &&
            !document.hidden;

        const frame = () => {
            if (!shouldDraw()) {
                running = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            const cs = getComputedStyle(document.documentElement);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.shadowColor = cs.getPropertyValue("--flakeglow");
            ctx.shadowBlur = 6;
            ctx.fillStyle = cs.getPropertyValue("--flake");
            for (const p of flakes) {
                p.y += p.s;
                p.w += 0.008;
                p.x += Math.sin(p.w) * 0.4;
                if (p.y > canvas.height) {
                    p.y = -6;
                    p.x = Math.random() * canvas.width;
                }
                ctx.globalAlpha = p.o;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, 6.28);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(frame);
        };

        const sync = () => {
            if (shouldDraw()) {
                if (!running) {
                    running = true;
                    raf = requestAnimationFrame(frame);
                }
            } else if (running) {
                cancelAnimationFrame(raf);
                running = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        resize();
        sync();

        const onResize = () => {
            resize();
            sync();
        };
        const mo = new MutationObserver(sync);
        mo.observe(hero, { attributes: true, attributeFilter: ["data-bi"] });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-snow"] });
        window.addEventListener("resize", onResize);
        window.addEventListener("snow:change", sync);
        document.addEventListener("visibilitychange", sync);
        reduce.addEventListener?.("change", sync);

        return () => {
            cancelAnimationFrame(raf);
            mo.disconnect();
            window.removeEventListener("resize", onResize);
            window.removeEventListener("snow:change", sync);
            document.removeEventListener("visibilitychange", sync);
            reduce.removeEventListener?.("change", sync);
        };
    }, []);

    return (
        <div className="hero-bg" data-intro="hero-bg" aria-hidden="true">
            <div className="sky" data-intro="sky" />
            <div className="stars" />
            <div className="sun" />
            <svg className="topo" data-intro="topo" viewBox="0 0 1440 900" preserveAspectRatio="none">
                {TOPO_PATHS.map((p) => (
                    <path key={p.d} d={p.d} className={p.bold ? "bold" : undefined} />
                ))}
            </svg>
            <svg className="ridge" data-intro="ridge" viewBox="0 0 1440 400" preserveAspectRatio="none">
                <defs>
                    {[1, 2, 3].map((i) => (
                        <linearGradient key={i} id={`ridge-g${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={`var(--r${i}a)`} />
                            <stop offset="1" stopColor={`var(--r${i}b)`} />
                        </linearGradient>
                    ))}
                </defs>
                {RIDGE_POLYGONS.map((points, i) => (
                    <polygon key={i} data-intro={`ridge-${i + 1}`} fill={RIDGE_FILLS[i]} points={points} />
                ))}
            </svg>
            <canvas ref={canvasRef} className="snow" data-intro="snow" />
        </div>
    );
}
