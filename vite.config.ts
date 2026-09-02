import { defineConfig } from "vite";

export default defineConfig({
  build: { target: "es2022", outDir: "dist/app", emptyOutDir: true },
  // Rust's generated build output can contain thousands of files. It is never
  // application source, so excluding it keeps the browser test server below
  // the OS file-watcher limit after native tests/builds have run.
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/target/**"] }
  },
  clearScreen: false
});
