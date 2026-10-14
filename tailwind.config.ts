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
        background: "#000000", // Fondo completamente negro como en el logo
        foreground: "#ffffff",
        agro: {
          orange: "#F58220", // El naranja exacto de la caja "Hub"
          green: "#70C243",  // El verde brillante de las hojas
          dark: "#121212",   // Un gris súper oscuro para el fondo de las tarjetas
          border: "#2A2A2A"  // Un gris sutil para separar elementos
        }
      },
    },
  },
  plugins: [],
};
export default config;