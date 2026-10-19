/** @type {import('tailwindcss').Config} */

const tailwindConfig = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        snow: "var(--snow)",
        "snow-alt": "var(--snow-alt)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        ink: "var(--ink)",
        body: "var(--body)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-dark": "var(--accent-dark)",
        "accent-soft": "var(--accent-soft)",
        wood: "var(--wood)",
        card: "var(--card)",
        header: "var(--header-bg)",
        "on-anthracite": "var(--on-anthracite)",
        "muted-anthracite": "var(--muted-on-anthracite)",
        chip1: "var(--chip-1)",
        chip2: "var(--chip-2)",
        chip3: "var(--chip-3)",
        anthracite: "var(--anthracite)",
        "anthracite-2": "var(--anthracite-2)",
        "anthracite-3": "var(--anthracite-3)",
        "anthracite-line": "var(--anthracite-line)",
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "sans-serif"],
        sans: ["var(--font-plex)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
