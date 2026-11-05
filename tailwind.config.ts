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
        background: "var(--background)",
        foreground: "var(--foreground)",
        yatra: {
          50: "#fdf8f4",
          100: "#fbf0e8",
          200: "#f5decb",
          300: "#ecc4a4",
          400: "#e09f6e",
          500: "#d97736", // Warm terracotta / saffron accent
          600: "#cb5c26",
          700: "#a9441f",
          800: "#873720",
          900: "#6e301d",
          950: "#3b160c",
        },
        slate: {
          850: "#151e2e",
          950: "#090d16",
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px -5px rgba(217, 119, 54, 0.25)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;

