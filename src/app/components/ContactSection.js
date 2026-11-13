"use client";
import { useState } from "react";
import Link from "next/link";
import { PROFILE } from "@/app/data/profile";

const { contact, email } = PROFILE;

export default function ContactSection() {
    const [status, setStatus] = useState("idle");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === "sending" || status === "success") return;
        setStatus("sending");
        try {
            const response = await fetch(contact.formspree, {
                method: "POST",
                body: new FormData(e.currentTarget),
                headers: { Accept: "application/json" },
            });
            setStatus(response.ok ? "success" : "error");
        } catch {
            setStatus("error");
        }
    };

    const label =
        status === "success" ? "Merci, à très vite ✓" : status === "sending" ? "Envoi en cours…" : "Être recontacté";

    return (
        <section id="contact" data-intro="contact" className="contact">
            <div className="cglow" aria-hidden="true" />
            <div className="wrap rv">
                <div className="eyebrow" data-intro="contact-eyebrow">
                    Contact
                </div>
                <h2 className="serif" data-intro="contact-h2">
                    {contact.title}
                </h2>
                <p data-intro="contact-text">{contact.text}</p>
                <form className="form" data-intro="contact-form" onSubmit={handleSubmit} noValidate={false}>
                    <label htmlFor="contact-email" className="sr-only">
                        Votre adresse e-mail
                    </label>
                    <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        placeholder="votre@email.fr"
                        autoComplete="email"
                        disabled={status === "success"}
                    />
                    <button
                        type="submit"
                        className="pill pill-acc focus-ring"
                        disabled={status === "sending" || status === "success"}
                    >
                        {label}
                        {status !== "success" && <span className="ar">→</span>}
                    </button>
                </form>
                <p className="form-status" role="status" aria-live="polite">
                    {status === "error" && "Une erreur est survenue, écrivez-moi directement par e-mail."}
                </p>
                <p className="form-note">
                    Votre adresse sert uniquement à vous répondre.{" "}
                    <Link href={PROFILE.legalPath} className="focus-ring">
                        Confidentialité
                    </Link>
                </p>
                <div className="checks" data-intro="contact-checks">
                    {contact.checks.map((c) => (
                        <span key={c}>✓ {c}</span>
                    ))}
                </div>
                <p className="alt2">
                    ou directement :{" "}
                    <a href={`mailto:${email}`} className="focus-ring">
                        {email}
                    </a>
                </p>
            </div>
        </section>
    );
}
