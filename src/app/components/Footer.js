import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/app/components/icons/BrandIcons";

const Footer = () => {
    return (
        <footer className="px-5 sm:px-8 lg:px-12 py-6 text-center bg-anthracite border-t border-[oklch(30%_0.014_235)]">
            <div className="flex items-center justify-center gap-6 mb-3">
                <Link
                    href="https://github.com/mat37dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mon GitHub"
                    className="p-2.5 -m-2.5 text-muted-anthracite hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite rounded-md"
                >
                    <GithubIcon size={20} />
                </Link>
                <Link
                    href="https://www.linkedin.com/in/mathieu-crosnier-b78a16238/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mon LinkedIn"
                    className="p-2.5 -m-2.5 text-muted-anthracite hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite rounded-md"
                >
                    <LinkedinIcon size={20} />
                </Link>
            </div>
            <p className="text-[13px] text-muted-anthracite">© 2026 Mathieu Crosnier</p>
        </footer>
    );
};

export default Footer;
