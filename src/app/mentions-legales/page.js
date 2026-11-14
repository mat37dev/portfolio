import Link from "next/link";
import { PROFILE } from "@/app/data/profile";
import "./legal.css";

const url = `https://mathieucrosnier.fr${PROFILE.legalPath}`;

export const metadata = {
    title: "Mentions légales et confidentialité | Mathieu Crosnier",
    description:
        "Mentions légales du site mathieucrosnier.fr, hébergement, données personnelles collectées par les formulaires de contact et mesure d'audience.",
    alternates: { canonical: url },
};

// SIRET volontairement absent en attendant l'accord des RH (voir data/artisans.js).
// À ajouter ensuite dans « Éditeur du site ».

export default function LegalPage() {
    const mail = (
        <a href={`mailto:${PROFILE.email}`} className="focus-ring">
            {PROFILE.email}
        </a>
    );

    return (
        <main className="sec legal">
            <div className="wrap">
                <div className="eyebrow">Informations légales</div>
                <h1 className="serif">Mentions légales et confidentialité</h1>

                <section aria-labelledby="editeur">
                    <h2 id="editeur" className="serif">
                        Éditeur du site
                    </h2>
                    <p>
                        {PROFILE.name}, entrepreneur individuel (EI)
                        <br />
                        {PROFILE.city} (44000), France
                        <br />
                        Téléphone :{" "}
                        <a href={PROFILE.phone.href} className="focus-ring">
                            {PROFILE.phone.display}
                        </a>
                        <br />
                        E-mail : {mail}
                    </p>
                    <p>Directeur de la publication : {PROFILE.name}.</p>
                </section>

                <section aria-labelledby="hebergement">
                    <h2 id="hebergement" className="serif">
                        Hébergement
                    </h2>
                    <p>
                        Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.{" "}
                        <a href="https://vercel.com" className="focus-ring" target="_blank" rel="noopener noreferrer">
                            vercel.com
                        </a>
                    </p>
                </section>

                <section aria-labelledby="donnees">
                    <h2 id="donnees" className="serif">
                        Données personnelles
                    </h2>
                    <p>
                        Le responsable du traitement est {PROFILE.name}. Les seules données collectées sont celles que
                        vous envoyez vous-même :
                    </p>
                    <ul>
                        <li>
                            le formulaire de l&apos;accueil : votre adresse e-mail ;
                        </li>
                        <li>
                            le formulaire de la page « Création de site » : le nom de votre entreprise, votre e-mail ou
                            votre téléphone et, si vous le souhaitez, un message ;
                        </li>
                        <li>un e-mail ou un appel direct : ce que vous choisissez de me transmettre.</li>
                    </ul>
                    <p>
                        Elles servent uniquement à vous répondre et à échanger sur votre projet (maquette, devis). Elles ne
                        sont ni vendues, ni cédées, ni utilisées pour une newsletter. Le traitement repose sur votre
                        demande de contact.
                    </p>
                    <p>
                        Les formulaires sont transmis par Formspree (Formspree, Inc.), qui me les envoie par e-mail et les
                        conserve sur ses serveurs. Formspree et l&apos;hébergeur Vercel sont situés aux États-Unis : vos
                        données peuvent donc y être transférées.
                    </p>
                    <p>
                        Je conserve ces données le temps de nos échanges, puis au maximum trois ans après notre dernier
                        contact.
                    </p>
                    <p>
                        Vous pouvez à tout moment demander à y accéder, à les corriger ou à les supprimer, ou vous opposer à
                        leur utilisation, en m&apos;écrivant à {mail}. Si vous estimez que vos droits ne sont pas
                        respectés, vous pouvez adresser une réclamation à la{" "}
                        <a href="https://www.cnil.fr" className="focus-ring" target="_blank" rel="noopener noreferrer">
                            CNIL
                        </a>
                        .
                    </p>
                </section>

                <section aria-labelledby="cookies">
                    <h2 id="cookies" className="serif">
                        Cookies et mesure d&apos;audience
                    </h2>
                    <p>
                        Ce site ne dépose aucun cookie publicitaire ni traceur. La fréquentation est mesurée avec Vercel
                        Web Analytics, qui fonctionne sans cookie et ne conserve que des données anonymisées.
                    </p>
                    <p>
                        Votre navigateur garde seulement vos préférences d&apos;affichage : thème clair ou sombre, neige
                        activée ou non, et le fait d&apos;avoir déjà vu l&apos;animation d&apos;accueil.
                    </p>
                </section>

                <section aria-labelledby="propriete">
                    <h2 id="propriete" className="serif">
                        Propriété intellectuelle
                    </h2>
                    <p>
                        Les textes, photos et visuels de ce site appartiennent à {PROFILE.name}, sauf les logos des
                        technologies citées, qui restent la propriété de leurs détenteurs. Merci de me demander avant de
                        les réutiliser.
                    </p>
                </section>

                <p className="legal-back">
                    <Link href="/" className="more focus-ring">
                        Retour à l&apos;accueil <span className="ar">→</span>
                    </Link>
                </p>
            </div>
        </main>
    );
}
