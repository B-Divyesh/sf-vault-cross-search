import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  publicDir: "public",
  build: { target: "es2022", outDir: "../dist/site", emptyOutDir: true },
  server: { port: 4173 }
});
