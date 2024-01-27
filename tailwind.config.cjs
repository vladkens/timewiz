const fromVar = (name) => {
  return `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        body: {
          // DEFAULT: "rgb(from var(--body) r g b / <alpha-value>)",
          DEFAULT: fromVar("body"),
          content: fromVar("body-content"),
        },
        card: {
          DEFAULT: fromVar("card"),
          content: fromVar("card-content"),
        },
      },
    },
  },
}
