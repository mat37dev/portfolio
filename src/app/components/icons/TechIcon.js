import { iconFor } from "./techIconData";

/** Logo d'une technologie (18 px par défaut). `inverted` : passe en blanc en thème nuit. */
export default function TechIcon({ slug, inverted = false, size = 18 }) {
    const icon = iconFor(slug);
    if (!icon) return null;
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill={`#${icon.hex}`}
            className={inverted ? "inv" : undefined}
            aria-hidden="true"
            focusable="false"
        >
            <path d={icon.path} />
        </svg>
    );
}
