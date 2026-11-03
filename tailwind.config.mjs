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
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        card: "var(--card)",
        ink: "var(--ink)",
        txt: "var(--txt)",
        mute: "var(--mute)",
        line: "var(--line)",
        line2: "var(--line2)",
        acc: "var(--acc)",
        "acc-soft": "var(--acc-soft)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        ease2: "var(--ease)",
      },
      screens: {
        md2: "860px",
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
