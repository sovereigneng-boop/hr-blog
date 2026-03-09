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
          50: "#f3faf6",
          100: "#e0f2e7",
          200: "#b9e0cc",
          300: "#8fccae",
          400: "#5eaf88",
          500: "#3c8f68", // 메인 초록
          600: "#2f7053",
          700: "#245642"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

