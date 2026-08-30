import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  publicDir: "public",
  build: {
    target: "es2022",
    outDir: "../dist/site",
    emptyOutDir: true,
    rollupOptions: { input: { home: "site/index.html", demo: "site/demo/index.html" } }
  },
  server: { port: 4173 }
});
