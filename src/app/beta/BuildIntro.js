"use client";
import { useEffect } from "react";
import { startBuildIntro } from "./buildIntroEngine";
import "./buildIntro.css";

/** Monte l'intro animée sur la page /beta et la nettoie au démontage. */
export default function BuildIntro() {
    useEffect(() => {
        const intro = startBuildIntro();
        return () => intro.destroy();
    }, []);
    return null;
}
