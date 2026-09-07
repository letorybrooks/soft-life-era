import type { Config } from "tailwindcss";

// Colors ported directly from the prototype's :root custom properties
// (soft-life-era-cleaned.html) so the rebuild matches pixel-for-pixel
// instead of drifting the way the prototype's own CSS drifted.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#FEEEE8",
        mist: "#C7BDBD",
        petal: "#F9D3D0",
        rose: "#F2A7A2",
        clay: "#C98685",
        terra: "#C16B62",
        ink: "#563D3B",
        cream: "#FFF9F7",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Italiana", "serif"],
        script: ["Parisienne", "cursive"],
      },
      borderRadius: {
        soft: "24px",
      },
      boxShadow: {
        soft: "0 26px 70px rgba(124,78,74,.13)",
      },
    },
  },
  plugins: [],
};

export default config;
