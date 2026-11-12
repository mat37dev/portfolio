"use client";
import { useEffect, useState } from "react";
import { Clock, Croissant, MapPin, Phone, Scissors, Search, Trees, UtensilsCrossed, Wrench } from "lucide-react";

// Métiers illustrés : aucun nom d'entreprise inventé, seulement « Votre … ».
const TRADES = [
    { key: "plomberie", label: "Votre plomberie", query: "plombier nantes", Icon: Wrench, tint: "#136b94" },
    { key: "boulangerie", label: "Votre boulangerie", query: "boulangerie nantes", Icon: Croissant, tint: "#865448" },
    { key: "coiffure", label: "Votre salon de coiffure", query: "coiffeur nantes", Icon: Scissors, tint: "#7b4a8c" },
    { key: "paysage", label: "Votre entreprise de paysage", query: "paysagiste nantes", Icon: Trees, tint: "#3d7a4e" },
    { key: "restaurant", label: "Votre restaurant", query: "restaurant nantes", Icon: UtensilsCrossed, tint: "#b0532c" },
];

const BUILD_MS = 3600; // durée de la construction (CSS), avant le premier changement de métier
const CYCLE_MS = 3800;
const TYPE_MS = 55;

/**
 * Maquette animée du hero : un site d'artisan se construit (navigateur puis
 * téléphone), puis passe d'un métier à l'autre avec la recherche Google
 * correspondante. Purement décorative : masquée aux lecteurs d'écran.
 * Mouvement réduit : état final fixe, sans changement de métier.
 */
export default function HeroMock() {
    const [index, setIndex] = useState(0);
    const [typed, setTyped] = useState(TRADES[0].query.length);
    const [still, setStill] = useState(false);
    const trade = TRADES[index];

    // Changement de métier, en pause quand l'onglet est caché.
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            setStill(true);
            return;
        }
        let timer;
        const start = setTimeout(() => {
            timer = setInterval(() => {
                if (!document.hidden) setIndex((i) => (i + 1) % TRADES.length);
            }, CYCLE_MS);
        }, BUILD_MS);
        return () => {
            clearTimeout(start);
            clearInterval(timer);
        };
    }, []);

    // Frappe de la recherche à chaque métier (la première se tape pendant la construction).
    useEffect(() => {
        if (still) {
            setTyped(TRADES[index].query.length);
            return;
        }
        setTyped(0);
        const delay = index === 0 ? 900 : 0;
        let t;
        const begin = setTimeout(() => {
            t = setInterval(() => {
                setTyped((n) => {
                    if (n >= TRADES[index].query.length) {
                        clearInterval(t);
                        return n;
                    }
                    return n + 1;
                });
            }, TYPE_MS);
        }, delay);
        return () => {
            clearTimeout(begin);
            clearInterval(t);
        };
    }, [index, still]);

    const { Icon } = trade;
    const domain = `votre-${trade.key}.fr`;

    return (
        <div className="mk" aria-hidden="true" style={{ "--t": trade.tint }}>
            <div className="mk-search mk-b" style={{ "--d": "0.5s" }}>
                <Search size={15} />
                <span>{trade.query.slice(0, typed)}</span>
                <i className="mk-caret" />
            </div>

            <div className="mk-browser mk-b" style={{ "--d": "0s" }}>
                <div className="mk-bar">
                    <span />
                    <span />
                    <span />
                    <em key={domain} className="mk-swap">
                        {domain}
                    </em>
                </div>
                <div className="mk-site">
                    <div className="mk-nav mk-b" style={{ "--d": "0.7s" }}>
                        <b className="mk-logo">
                            <Icon size={13} />
                        </b>
                        <i />
                        <i />
                        <i />
                        <span className="mk-call">
                            <Phone size={11} /> Appeler
                        </span>
                    </div>
                    <div className="mk-hero mk-b" style={{ "--d": "1.1s" }}>
                        <div className="mk-photo">
                            <Icon key={trade.key} className="mk-swap" size={54} strokeWidth={1.4} />
                        </div>
                        <div className="mk-copy">
                            <strong key={trade.label} className="mk-swap">
                                {trade.label}
                            </strong>
                            <small>à Nantes et alentours</small>
                            <span className="mk-btn">Demander un devis</span>
                        </div>
                    </div>
                    <div className="mk-cards">
                        {[
                            { I: Clock, l: "Horaires", d: "1.6s" },
                            { I: MapPin, l: "Accès", d: "1.75s" },
                            { I: Phone, l: "Contact", d: "1.9s" },
                        ].map(({ I, l, d }) => (
                            <div key={l} className="mk-b" style={{ "--d": d }}>
                                <I size={13} />
                                {l}
                            </div>
                        ))}
                    </div>
                </div>
                <span className="mk-cursor" />
            </div>

            <div className="mk-phone mk-b" style={{ "--d": "2.3s" }}>
                <div className="mk-notch" />
                <div className="mk-p-hero">
                    <Icon key={trade.key} className="mk-swap" size={30} strokeWidth={1.5} />
                </div>
                <strong key={trade.label} className="mk-swap">
                    {trade.label}
                </strong>
                <small>à Nantes et alentours</small>
                <span className="mk-p-call">
                    <Phone size={12} /> Appeler
                </span>
                <i />
                <i />
            </div>
        </div>
    );
}
