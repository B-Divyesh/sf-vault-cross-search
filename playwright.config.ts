import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: [
    { command: "npm run test:serve-site", port: 4173, reuseExistingServer: false },
    { command: "npm run dev -- --host 127.0.0.1", port: 1420, reuseExistingServer: true }
  ],
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36" } }
  ]
});
