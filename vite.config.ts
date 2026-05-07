import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const shortDescription =
  "Compare cities, spot timezone overlap, and pick a sensible time window with a visual timezone board."

export const siteConfig = {
  name: "TimeWiz.cc",
  shortName: "TimeWiz",
  title: "TimeWiz.cc - Visual Timezone Board",
  description: `${shortDescription} Share setups and export selected ranges when needed.`,
  shortDescription,
  url: "https://timewiz.cc/",
  domain: "timewiz.cc",
  themeColor: "#202020",
  backgroundColor: "#202020",
  twitterCard: "summary",
} as const

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  build: { sourcemap: "hidden" },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "site-meta",
      transformIndexHtml(html) {
        return html
          .replace(/%SITE_NAME%/g, siteConfig.name)
          .replace(/%SITE_TITLE%/g, siteConfig.title)
          .replace(/%SITE_DESCRIPTION%/g, siteConfig.description)
          .replace(/%SITE_SHORT_DESCRIPTION%/g, siteConfig.shortDescription)
          .replace(/%SITE_URL%/g, siteConfig.url)
          .replace(/%SITE_DOMAIN%/g, siteConfig.domain)
          .replace(/%SITE_THEME_COLOR%/g, siteConfig.themeColor)
          .replace(/%SITE_TWITTER_CARD%/g, siteConfig.twitterCard)
      },
    },
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        short_name: siteConfig.shortName,
        name: siteConfig.name,
        description: siteConfig.shortDescription,
        theme_color: siteConfig.themeColor,
        background_color: siteConfig.backgroundColor,
        icons: [{ src: "logo.svg", sizes: "any", type: "image/svg+xml" }],
      },
    }),
  ],
  optimizeDeps: { rolldownOptions: { output: { comments: false } } },
})
