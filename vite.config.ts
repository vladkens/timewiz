import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  build: { sourcemap: "hidden" },
  plugins: [
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
  esbuild: { legalComments: "none" },
})
