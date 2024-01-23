/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        body: {
          DEFAULT: "rgb(from var(--body) r g b / <alpha-value>)",
          content: "rgb(from var(--body-content) r g b / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(from var(--card) r g b / <alpha-value>)",
          content: "rgb(from var(--card-content) r g b / <alpha-value>)",
        },
      },
    },
  },
}
