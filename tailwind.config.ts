import type { Config } from "tailwindcss";

const phi = 1.618;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        marfim: "#F4EDE2",
        areia: "#DACAB4",
        cacau: "#241C18",
        argila: "#BE8C76",
        terracota: "#9F6A53",
        champanhe: "#B5915E",
      },
      fontFamily: {
        bodoni: ["'Bodoni Moda'", "Georgia", "serif"],
        newsreader: ["'Newsreader'", "Georgia", "serif"],
        hanken: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
      },
      spacing: {
        "phi-1": "8px",
        "phi-2": "13px",
        "phi-3": "21px",
        "phi-4": "34px",
        "phi-5": "55px",
        "phi-6": "89px",
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-md": ["1.75rem", { lineHeight: "1.2" }],
      },
      backgroundImage: {
        "isolinhas": "url('/brand/isolinhas-pattern.svg')",
      },
      borderColor: {
        DEFAULT: "#DACAB4",
      },
    },
  },
  plugins: [],
};

export default config;
