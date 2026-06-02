import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Include js/jsx too: the (site) layout chrome (e.g. app/(site)/SiteShell.jsx)
    // is JSX, and its classes would otherwise be purged.
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    // Public music site, migrated from the old Vite app (kept as JS/JSX).
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#1A1A2E",
          elevated: "#22223D",
          muted: "#2C2C4A",
        },
        // primary keeps the publisher-side DEFAULT/hover/muted aliases and adds
        // the numeric 50–900 scale the migrated music-site components use.
        primary: {
          DEFAULT: "#FF6B35",
          hover: "#FF8659",
          muted: "#FF6B35",
          50: "#fff4f0",
          100: "#ffe8de",
          200: "#ffd0bd",
          300: "#FFB4A2",
          400: "#FF8C61",
          500: "#FF6B35",
          600: "#E55A2B",
          700: "#CC4D22",
          800: "#B3401A",
          900: "#1A1A2E",
        },
        // Brand gold. DEFAULT lets bare `bg-accent`/`text-accent` resolve.
        accent: {
          DEFAULT: "#FFD700",
          300: "#FFD700",
          400: "#FFE44D",
          500: "#FFD700",
          600: "#E6C200",
          900: "#2E2A1A",
        },
        // Translucent white surfaces used by the music-site glass UI.
        surface: {
          50: "rgba(255, 255, 255, 0.05)",
          100: "rgba(255, 255, 255, 0.08)",
          200: "rgba(255, 255, 255, 0.12)",
          300: "rgba(255, 255, 255, 0.16)",
        },
        status: {
          incomplete: "#6B7280",
          pending: "#F59E0B",
          active: "#10B981",
          suspended: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        // Poppins is loaded in the (site) layout; falls back until then.
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
