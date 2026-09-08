import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tsa: {
          bg: "var(--tsa-bg)",
          surface: "var(--tsa-surface)",
          card: "var(--tsa-card)",
          primary: "var(--tsa-primary)",
          accent: "var(--tsa-accent)",
          text: "var(--tsa-text)",
          muted: "var(--tsa-muted)",
          border: "var(--tsa-border)",
          darkNavy: "#081A2B",
          slateBlue: "#12263A",
          tsaBlue: "#1E5AA8",
          cyanAccent: "#4DA3FF",
          lightGray: "#F5F7FA",
          darkNavyText: "#0A2540",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(77, 163, 255, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.2)",
        cardLight: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
