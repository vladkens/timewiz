import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import bundlesize from "vite-plugin-bundlesize"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), bundlesize({ limits: [{ name: "**/*", limit: "500 kB" }], stats: "all" })],
  build: { sourcemap: "hidden" },
  base: "",
})
