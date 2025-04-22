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
          "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(23,158,255,1) 100%);",
      },
      colors: {
        "mc-blue": "#0C44FF",
        "mc-cyan": "#087e8b",
        "mc-lightblue": "#bfd7ea",
        "mc-softred": "#ff5a5f",
        "mc-red": "#c81d25",
        "mc-brown": "#220901",
        "mc-darkred": "#621708",
        "mc-lightred": "#941B0C",
        "mc-orange": "#BC3908",
        "mc-yellow": "#F6AA1C",
        "mc-soft-yellow": "#FFEDBE",
        "mc-darkgrey": "#212121",
        "mc-white": "#f5f5f5",
        "mc-darkwhite": "#f9f9f9",
        "ev-darkblue": "#252C58",
        "ev-border-blue": "#0C41FF",
        "ev-blue-fill": "#0C44FF",
        "ev-gray": "#F1F2F6",
        "ev-gray-button": "#D7D7D7",
        "ev-dark-gray": "#717171",
        "ev-green": "#54C854",
        "ev-ice": "#E6EFFC",
        "ev-red": "#FF5050",
        "ev-pink": "#FFC3D8",
        "mc-primary": "var(--color-primary)",
        "mc-secondary": "var(--color-secondary)",
        "mc-text": "var(--color-text)",
        "mc-text-secondary": "var(--color-secondary-text)",
        "mc-bg-primary": "var(--color-primary-bg)",
        "overlay": "rgba(0,0,0,0.5)",
      },
      margin: {
        "128": "64rem",
      },
      width: {
        "7/10": "70%",
      },
      maxWidth: {
        "200": "50rem",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};
export default config;
