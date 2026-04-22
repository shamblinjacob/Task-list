import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0b",
        surface: "#141416",
        surfaceAlt: "#1c1c1f",
        border: "#27272a",
        fg: "#f5f5f5",
        muted: "#8b8b92",
        accent: "#7c5cff",
        accentSoft: "#5a3fd9",
        success: "#4ade80",
        danger: "#f87171",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
