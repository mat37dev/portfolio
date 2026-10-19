"use client";
import { useState } from "react";
import { Mails, MapPinHouse } from "lucide-react";
import { GithubIcon } from "@/app/components/icons/BrandIcons";

const inputClasses =
    "w-full px-3.5 py-[11px] rounded-lg border border-anthracite-line bg-anthracite-3 text-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:border-accent";

const labelClasses = "block text-[13px] font-semibold text-[oklch(80%_0.006_235)] mb-1.5";

const FOCUS_RING_DARK =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite rounded-md";

const ContactSection = () => {
    const [status, setStatus] = useState("idle");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("sending");
        try {
            const response = await fetch("https://formspree.io/f/xjkgqzdr", {
                method: "POST",
                body: new FormData(e.target),
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                setStatus("success");
                e.target.reset();
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <section id="contact" className="px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24 bg-anthracite">
            <h2 className="font-heading font-extrabold text-white tracking-tight text-center text-[clamp(26px,3vw,34px)] mb-11">
                Contact
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 max-w-[1080px] mx-auto">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
                        <div>
                            <label htmlFor="firstName" className={labelClasses}>
                                Prénom
                            </label>
                            <input type="text" name="firstName" id="firstName" required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="lastName" className={labelClasses}>
                                Nom
                            </label>
                            <input type="text" name="lastName" id="lastName" required className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClasses}>
                            Email
                        </label>
                        <input type="email" name="email" id="email" required className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="message" className={labelClasses}>
                            Message
                        </label>
                        <textarea
                            name="message"
                            id="message"
                            rows="4"
                            required
                            className={`${inputClasses} resize-y`}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={status === "sending"}
                        className={`px-6 py-[13px] rounded-[9px] bg-accent text-white font-semibold text-[15px] hover:bg-accent-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${FOCUS_RING_DARK}`}
                    >
                        {status === "sending" ? "Envoi en cours…" : "Envoyer"}
                    </button>
                    {status === "success" && (
                        <p className="text-[13px] text-[oklch(65%_0.12_150)]">Message envoyé, merci !</p>
                    )}
                    {status === "error" && (
                        <p className="text-[13px] text-[oklch(65%_0.12_25)]">
                            Une erreur est survenue, contactez-moi directement par email.
                        </p>
                    )}
                </form>

                <div className="flex flex-col gap-[22px] justify-center">
                    <a
                        href="mailto:mathieu.crosnier15@outlook.fr"
                        className={`flex items-center gap-3.5 text-white hover:text-accent-soft transition-colors ${FOCUS_RING_DARK}`}
                    >
                        <span className="w-11 h-11 rounded-full bg-accent flex-none flex items-center justify-center">
                            <Mails size={20} />
                        </span>
                        <span className="text-[15px]">mathieu.crosnier15@outlook.fr</span>
                    </a>
                    <a
                        href="https://github.com/mat37dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3.5 text-white hover:text-accent-soft transition-colors ${FOCUS_RING_DARK}`}
                    >
                        <span className="w-11 h-11 rounded-full bg-accent flex-none flex items-center justify-center">
                            <GithubIcon size={20} />
                        </span>
                        <span className="text-[15px]">github.com/mat37dev</span>
                    </a>
                    <div className="flex items-center gap-3.5 text-white">
                        <span className="w-11 h-11 rounded-full bg-accent flex-none flex items-center justify-center">
                            <MapPinHouse size={20} />
                        </span>
                        <span className="text-[15px]">Nantes, France</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
