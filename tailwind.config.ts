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
        "ev-blue": "#0C44FF",
        "ev-cyan": "#087e8b",
        "ev-lightblue": "#bfd7ea",
        "ev-softred": "#ff5a5f",
        "ev-red": "#c81d25",
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
        "ev-border-blue": "#0C41FF",
        "ev-blue-fill": "#0C44FF",
        "ev-gray": "#F1F2F6",
        "ev-gray-button": "#D7D7D7",
        "ev-dark-gray": "#717171",
        "ev-accent-text": "var(--color-accent-text)",
        "ev-green": "#54C854",
        "ev-ice": "#E6EFFC",
        "ev-pink": "#FFC3D8",
        "ev-primary": "var(--color-primary)",
        "ev-secondary": "var(--color-secondary)",
        "ev-text": "var(--color-text)",
        "ev-text-secondary": "var(--color-secondary-text)",
        "ev-primary-bg": "var(--color-primary-bg)",
        "ev-main-bg": "var(--color-main-bg)",
        overlay: "rgba(0,0,0,0.5)",
      },
      margin: {
        "120": "40rem",
        "128": "64rem",
      },
      width: {
        "7/10": "70%",
        "9,5/10": "95%",
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
