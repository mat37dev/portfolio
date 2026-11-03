"use client";
import { useEffect } from "react";
import { startBuildIntro } from "./engine";
import { shouldAutoplay } from "./gating";
import { readParams } from "./params";
import { createRng } from "./rng";
import { installSecrets, logBanner } from "./secrets";
import "./intro.css";

const sessionSeen = () => {
    try {
        return sessionStorage.getItem("introSeen") === "1";
    } catch {
        return false;
    }
};

/** Monte l'intro « le site se construit » sur l'accueil et la nettoie au démontage. */
export default function BuildIntro() {
    useEffect(() => {
        const params = readParams(location.search);
        const autoplay = shouldAutoplay({
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
            width: innerWidth,
            webdriver: !!navigator.webdriver,
            search: location.search,
            sessionSeen: sessionSeen(),
        });
        const seed = params.seed ?? Math.floor(Math.random() * 2 ** 31);
        const intro = startBuildIntro({
            autoplay,
            tempoScale: params.mode === "fast" ? 6 : 1,
            rng: createRng(seed),
            seed,
            egg: params.egg,
            mistakes: params.mistakes,
            debug: params.debug,
            onFinish: () => {
                try {
                    sessionStorage.setItem("introSeen", "1");
                } catch {}
            },
        });
        logBanner();
        const uninstall = installSecrets({ onSki: () => intro.runSkier() });
        return () => {
            uninstall();
            intro.destroy();
        };
    }, []);
    return null;
}
