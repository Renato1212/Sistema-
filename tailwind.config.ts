import type { Config } from "tailwindcss";

/**
 * "Estética Facial de Luxo" design system — deep espresso + champagne
 * gold + rosé, signature gold→rosé gradient.
 *
 * Legacy token names (marfim/cacau/champanhe/areia/terracota) are kept but
 * remapped to the dark-luxury palette so every existing usage site inverts
 * automatically: `bg-marfim` is now the espresso page background and
 * `text-cacau` the warm ivory text.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // page + surfaces
        marfim: "#140F0B",      // espresso page background
        espresso: "#19130D",    // bg-2
        surface: "#211913",     // cards
        "surface-2": "#2A2019", // raised cards / inputs
        // text
        cacau: "#F4ECDF",       // warm ivory — primary text
        muted: "#B6A48C",
        dim: "#6E5F4D",
        // accents
        champanhe: "#C9A368",   // gold
        areia: "#DDBE89",       // gold-2 (bright gold)
        rose: "#E0A89E",        // rosé
        terracota: "#E0A89E",   // legacy alias → rosé
        argila: "#A86B4A",      // burnt copper
      },
      fontFamily: {
        bodoni: ["'Space Grotesk'", "system-ui", "sans-serif"],   // display
        newsreader: ["'Fraunces'", "Georgia", "serif"],           // serif italic accents
        hanken: ["'Instrument Sans'", "system-ui", "sans-serif"], // body
      },
      borderRadius: {
        sm: "12px",
        DEFAULT: "14px",
        lg: "18px",
        xl: "22px",
        "2xl": "26px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3), 0 8px 28px -8px rgba(0,0,0,0.45)",
        "card-hover": "0 24px 50px -24px rgba(0,0,0,0.7)",
        apple: "0 24px 60px -20px rgba(0,0,0,0.75)",
        gold: "0 10px 34px -10px rgba(201,163,104,0.55)",
        "gold-lg": "0 16px 46px -10px rgba(201,163,104,0.8)",
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-lg": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      backgroundImage: {
        grad: "linear-gradient(100deg,#DDBE89 0%,#C9A368 38%,#E0A89E 100%)",
      },
      borderColor: {
        DEFAULT: "rgba(255,248,236,0.08)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
