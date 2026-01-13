import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // Penting: karena Anda menyimpan file di folder features
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#DC2626", // Primary Red (Posko Brand)
          dark: "#B91C1C",
          light: "#FCA5A5",
        },
        secondary: {
          DEFAULT: "#64748B", // Secondary Slate
          dark: "#475569",
          light: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"], // Agar font Inter dari layout.tsx terbaca
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;