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
        rest: {
          DEFAULT: fromVar("rest"),
          content: fromVar("rest-content"),
        },
        border: fromVar("border"),
        primary: fromVar("primary"),
      },
    },
    screens: {
      // https://tailwindcss.com/docs/screens#max-width-breakpoints
      xl: { max: "1279px" },
      lg: { max: "1023px" },
      md: { max: "767px" },
      sm: { max: "639px" },
    },
  },
}
