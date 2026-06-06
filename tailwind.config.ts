import type { Config } from "tailwindcss";

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
      borderRadius: {
        sm: "10px",
        DEFAULT: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(36,28,24,0.05), 0 4px 16px rgba(36,28,24,0.04)",
        "card-hover": "0 2px 8px rgba(36,28,24,0.08), 0 8px 24px rgba(36,28,24,0.07)",
        apple: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.04)",
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
      borderColor: {
        DEFAULT: "#DACAB4",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
