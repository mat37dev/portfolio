// Symbole « Cime en C » — voir branding/README.md.
// Les couleurs suivent les tokens du thème (--accent / --wood), qui s'éclaircissent déjà en mode sombre.
// `onDark` fige les teintes claires pour les fonds anthracite permanents (footer).
const RING = "M244 128 A116 116 0 1 1 186 27.54 A14 14 0 0 1 172 51.79 A88 88 0 1 0 216 128 A14 14 0 0 1 244 128 Z";
const PEAKS =
    "M90.81 174 L105.8 118.04 L128 165.62 L150.2 118.04 L165.19 174 L187.97 174 L155.8 53.96 L128 113.58 L100.2 53.96 L68.03 174 Z";

const Logo = ({ size = 36, onDark = false, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        className={className}
    >
        <path d={RING} className={onDark ? undefined : "fill-accent"} fill={onDark ? "#5da1c8" : undefined} />
        <path d={PEAKS} className={onDark ? undefined : "fill-wood"} fill={onDark ? "#ac776a" : undefined} />
    </svg>
);

export default Logo;
