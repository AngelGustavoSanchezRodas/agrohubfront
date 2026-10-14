import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          dark: "#0f172a", // slate-900
          darker: "#020617", // slate-950
          border: "#1e293b", // slate-800
          green: "#10b981", // emerald-500
          orange: "#f59e0b", // amber-500
        }
      }
    },
  },
  plugins: [],
};
export default config;