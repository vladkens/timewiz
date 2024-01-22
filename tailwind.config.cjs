/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: "var(--base-100)", txt: "var(--base-txt)" },
      },
    },
  },
}
