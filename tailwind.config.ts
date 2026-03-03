import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "landing-gradient":
          "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(23,158,255,1) 100%)",
        "ev-glow-yellow":
          "radial-gradient(ellipse at center, rgba(246,170,28,0.12) 0%, transparent 70%)",
      },
      colors: {
        // legacy (kept for backward compat)
        "ev-blue": "#3b82f6",
        "ev-cyan": "#087e8b",
        "ev-lightblue": "#bfd7ea",
        "ev-softred": "#ff5a5f",
        "ev-red": "#ef4444",
        "ev-brown": "#220901",
        "ev-darkred": "#621708",
        "ev-lightred": "#941B0C",
        "ev-orange": "#BC3908",
        "ev-yellow": "#F6AA1C",
        "ev-soft-yellow": "#FFEDBE",
        "ev-darkgrey": "#212121",
        "ev-white": "#f5f5f5",
        "ev-darkwhite": "#f9f9f9",
        "ev-darkblue": "#252C58",
        "ev-border-blue": "#3b82f6",
        "ev-blue-fill": "#3b82f6",
        "ev-gray": "#F1F2F6",
        "ev-gray-button": "#D7D7D7",
        "ev-dark-gray": "#717171",
        "ev-accent-text": "var(--color-accent-text)",
        "ev-green": "#22c55e",
        "ev-ice": "#E6EFFC",
        "ev-pink": "#FFC3D8",
        // CSS-variable mapped (used throughout app)
        "ev-primary": "var(--color-primary)",
        "ev-secondary": "var(--color-secondary)",
        "ev-text": "var(--color-text)",
        "ev-text-secondary": "var(--color-secondary-text)",
        "ev-primary-bg": "var(--color-primary-bg)",
        "ev-main-bg": "var(--color-main-bg)",
        // new design tokens
        "ev-surface": "var(--color-surface)",
        "ev-surface-2": "var(--color-surface-2)",
        "ev-sidebar": "var(--color-sidebar)",
        "ev-stroke": "var(--color-stroke)",
        "ev-muted": "var(--color-muted)",
        overlay: "rgba(0,0,0,0.6)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.3s ease-in-out both",
        "slide-in": "slideIn 0.3s ease-out both",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "ev-card": "0 4px 24px rgba(0,0,0,0.4)",
        "ev-card-hover": "0 8px 40px rgba(0,0,0,0.55)",
        "ev-glow-yellow": "0 0 20px rgba(246,170,28,0.25)",
        "ev-glow-blue": "0 0 20px rgba(59,130,246,0.25)",
      },
      margin: { "120": "40rem", "128": "64rem" },
      width: { "7/10": "70%", "9,5/10": "95%" },
      maxWidth: { "200": "50rem" },
      borderWidth: { "3": "3px" },
    },
  },
  plugins: [],
};

export default config;
