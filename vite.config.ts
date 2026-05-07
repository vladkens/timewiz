import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { siteConfig } from "./site.config"

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
