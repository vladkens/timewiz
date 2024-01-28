import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  build: { sourcemap: "hidden" },
  plugins: [react()],
  esbuild: { legalComments: "none" },
})
