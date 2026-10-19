import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Portfolio de Mathieu Crosnier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Palette alignée sur les tokens du site (globals.css) — thème clair "montagne".
const SNOW = "#F6F8FA";
const SNOW_ALT = "#EDF1F4";
const INK = "#1C2024";
const MUTED = "#5B6570";
const ACCENT = "#3E7CA6";
const ACCENT_DARK = "#2F6284";
const ACCENT_SOFT = "#DCE9F0";
const ANTHRACITE = "#23262B";

const Pill = ({ children }) => (
    <span
        style={{
            display: "flex",
            background: ACCENT_SOFT,
            color: ACCENT_DARK,
            padding: "10px 24px",
            borderRadius: "9999px",
            fontSize: 22,
            fontWeight: 600,
        }}
    >
        {children}
    </span>
);

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    background: `linear-gradient(180deg, ${SNOW} 0%, ${SNOW_ALT} 100%)`,
                    fontFamily: "sans-serif",
                    padding: "60px",
                }}
            >
                <p
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: ACCENT,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        margin: "0 0 22px 0",
                    }}
                >
                    Développeur Fullstack
                </p>
                <h1
                    style={{
                        fontSize: 84,
                        fontWeight: 800,
                        color: INK,
                        margin: "0 0 18px 0",
                        textAlign: "center",
                        lineHeight: 1.05,
                        letterSpacing: "-0.02em",
                    }}
                >
                    Mathieu Crosnier
                </h1>
                <p
                    style={{
                        fontSize: 30,
                        color: MUTED,
                        margin: "0 0 38px 0",
                    }}
                >
                    Nantes, France
                </p>
                <div style={{ display: "flex", gap: "16px" }}>
                    <Pill>React · Next.js</Pill>
                    <Pill>Symfony · PHP</Pill>
                    <Pill>Salesforce</Pill>
                </div>

                {/* Crête de montagne — même motif que le hero du site */}
                <svg
                    viewBox="0 0 1440 180"
                    width="1200"
                    height="90"
                    style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
                >
                    <polygon
                        points="0,180 0,120 180,40 360,100 520,20 700,90 880,30 1080,110 1260,50 1440,100 1440,180"
                        fill={ANTHRACITE}
                        opacity="0.9"
                    />
                    <polygon
                        points="0,180 0,150 220,90 460,140 660,70 900,130 1120,80 1440,140 1440,180"
                        fill={ACCENT}
                        opacity="0.3"
                    />
                </svg>
            </div>
        ),
        { ...size }
    );
}
