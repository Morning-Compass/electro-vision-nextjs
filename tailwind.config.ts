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
      },
      colors: {
        "mc-blue": "#0b3945",
        "mc-cyan": "#087e8b",
        "mc-lightblue": "#bfd7ea",
        "mc-softred": "#ff5a5f",
        "mc-red": "#c81d25",
        "mc-brown": "#220901",
        "mc-darkred": "#621708",
        "mc-lightred": "#941B0C",
        "mc-orange": "#BC3908",
        "mc-yellow": "#F6AA1C",
        "mc-darkgrey": "#212121",
        "mc-white": "#f5f5f5",
        "mc-darkwhite": "#f9f9f9",
        "mc-primary": "var(--color-primary)",
        "mc-secondary": "var(--color-secondary)",
        "mc-text": "var(--color-text)",
        "mc-text-secondary": "var(--color-secondary-text)",
        "mc-bg-primary": "var(--color-primary-bg)",
      },
    },
  },
  plugins: [],
};
export default config;
