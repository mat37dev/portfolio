"use client";
import { useState } from "react";
import Link from "next/link";
import { PROFILE } from "@/app/data/profile";
import { ARTISANS } from "@/app/data/artisans";

const { contact } = ARTISANS;

/**
 * Formulaire de la page artisans : même Formspree que l'accueil, mais avec le
 * nom de l'entreprise et un moyen de contact libre (email ou téléphone), car
 * un artisan préfère souvent être rappelé.
 */
export default function ArtisanContact() {
    const [status, setStatus] = useState("idle");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === "sending" || status === "success") return;
        setStatus("sending");
        try {
            const response = await fetch(PROFILE.contact.formspree, {
                method: "POST",
                body: new FormData(e.currentTarget),
                headers: { Accept: "application/json" },
            });
            setStatus(response.ok ? "success" : "error");
        } catch {
            setStatus("error");
        }
    };

    const done = status === "success";
    const label = done ? "Merci, je vous recontacte vite ✓" : status === "sending" ? "Envoi en cours…" : "Être recontacté";

    return (
        <section id="contact" className="contact">
            <div className="cglow" aria-hidden="true" />
            <div className="wrap rv">
                <div className="eyebrow">{contact.eyebrow}</div>
                <h2 className="serif">{contact.title}</h2>
                <p>{contact.text}</p>
                <form className="art-form" onSubmit={handleSubmit}>
                    <input type="hidden" name="_subject" value={contact.subject} />
                    <input type="hidden" name="page" value={ARTISANS.path} />
                    <div className="art-field">
                        <label htmlFor="art-company">Votre entreprise</label>
                        <input
                            id="art-company"
                            name="entreprise"
                            required
                            placeholder="Ex. : Boulangerie du Centre"
                            autoComplete="organization"
                            disabled={done}
                        />
                    </div>
                    <div className="art-field">
                        <label htmlFor="art-reach">Email ou téléphone</label>
                        <input
                            id="art-reach"
                            name="contact"
                            required
                            placeholder="Pour vous répondre"
                            autoComplete="email"
                            disabled={done}
                        />
                    </div>
                    <div className="art-field art-field-wide">
                        <label htmlFor="art-message">
                            Votre message <small>(facultatif)</small>
                        </label>
                        <textarea
                            id="art-message"
                            name="message"
                            rows={3}
                            placeholder="Votre métier, votre site actuel s'il existe, ce que vous aimeriez…"
                            disabled={done}
                        />
                    </div>
                    <button type="submit" className="pill pill-acc focus-ring" disabled={status === "sending" || done}>
                        {label}
                        {!done && <span className="ar">→</span>}
                    </button>
                </form>
                <p className="form-status" role="status" aria-live="polite">
                    {status === "error" && "Une erreur est survenue, appelez-moi ou écrivez-moi directement."}
                </p>
                <p className="form-note">
                    Ces informations servent uniquement à vous recontacter.{" "}
                    <Link href={PROFILE.legalPath} className="focus-ring">
                        Confidentialité
                    </Link>
                </p>
                <div className="checks">
                    {contact.checks.map((c) => (
                        <span key={c}>✓ {c}</span>
                    ))}
                </div>
                <p className="alt2">
                    ou directement :{" "}
                    <a href={PROFILE.phone.href} className="focus-ring">
                        {PROFILE.phone.display}
                    </a>{" "}
                    ·{" "}
                    <a href={`mailto:${PROFILE.email}`} className="focus-ring">
                        {PROFILE.email}
                    </a>
                </p>
            </div>
        </section>
    );
}
