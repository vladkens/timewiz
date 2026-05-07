import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  build: { sourcemap: "hidden" },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        short_name: "TimeWiz",
        name: "TimeWiz",
        icons: [{ src: "logo.svg", sizes: "any", type: "image/svg+xml" }],
      },
    }),
  ],
  optimizeDeps: { rolldownOptions: { output: { comments: false } } },
})
