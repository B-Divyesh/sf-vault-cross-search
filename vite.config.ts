import { defineConfig } from "vite";

export default defineConfig({
  build: { target: "es2022", outDir: "dist/app", emptyOutDir: true },
  server: { port: 1420, strictPort: true },
  clearScreen: false
});
