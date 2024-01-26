import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import bundlesize from "vite-plugin-bundlesize"

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  return {
    base: "",
    build: { sourcemap: "hidden" },
    plugins: [
      react(),
      configEnv.command === "build"
        ? bundlesize({ limits: [{ name: "**/*", limit: "500 kB" }], stats: "all" })
        : null,
    ],
    esbuild: { legalComments: "none" },
  }
})
