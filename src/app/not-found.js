import Link from "next/link";
import { Mountain } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-snow flex flex-col items-center justify-center text-center px-6">
            <Mountain size={40} className="text-accent mb-5" aria-hidden="true" />
            <h1 className="font-heading text-8xl font-extrabold text-accent mb-4">404</h1>
            <h2 className="font-heading text-2xl font-bold text-ink mb-3">Piste introuvable</h2>
            <p className="text-muted mb-8 max-w-md">
                Cette page a dévié de la trace, ou peut-être qu&apos;elle est juste partie hors-piste.
                Redescendons ensemble à l&apos;accueil avant la fermeture des remontées.
            </p>
            <Link
                href="/"
                className="px-8 py-3 rounded-[9px] bg-anthracite text-on-anthracite font-semibold hover:bg-anthracite-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-snow"
            >
                Retour à l&apos;accueil
            </Link>
        </div>
    );
}
