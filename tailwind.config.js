/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6fc",
          100: "#d6eaf8",
          200: "#b3d9f2",
          300: "#7fc0e9",
          400: "#4a9fdc",
          500: "#2E6DB4", // 메인 파란
          600: "#2563a8",
          700: "#1e5090"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

