import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#1A1A2E",
          elevated: "#22223D",
          muted: "#2C2C4A",
        },
        primary: {
          DEFAULT: "#FF6B35",
          hover: "#FF8659",
          muted: "#FF6B35",
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
      },
    },
  },
  plugins: [],
};

export default config;
