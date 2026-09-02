import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1"], {
  stdio: "ignore",
  shell: process.platform === "win32"
});

async function waitForApp() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:1420/");
      if (response.ok) return;
    } catch { /* Vite is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the desktop webview.");
}

try {
  await waitForApp();
  await mkdir("site/public/assets", { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1180, height: 760 } });
  await page.addInitScript(() => {
    const vaults = [];
    const sampleEntries = [
      { id: "sample-vpn", vaultId: "sample", vaultName: "Sample project.kdbx", title: "Acme VPN", username: "sample.operator", url: "https://vpn.acme.example", group: "Infrastructure / Access" },
      { id: "sample-status", vaultId: "sample", vaultName: "Sample project.kdbx", title: "Acme status", username: "sample.on-call", url: "https://status.acme.example", group: "Operations / On-call" }
    ];
    Object.assign(window, {
      __TAURI_INTERNALS__: {
        invoke: async (command) => {
          if (command === "session_state") return { vaults, locked: vaults.length === 0, minutesRemaining: 15 };
          if (command === "load_sample_project") {
            vaults.push({ id: "sample", name: "Sample project.kdbx", entries: sampleEntries.length, unlocked: true });
            return vaults[0];
          }
          if (command === "search_entries") return sampleEntries;
          if (command === "lock_all") { vaults.splice(0); return null; }
          throw new Error(`Unexpected walkthrough command: ${command}`);
        }
      }
    });
  });
  await page.goto("http://127.0.0.1:1420/");
  await page.screenshot({ path: "site/public/assets/desktop-first-run.png" });
  await page.getByRole("button", { name: "Load sample project" }).click();
  await page.getByRole("option").first().waitFor();
  await page.screenshot({ path: "site/public/assets/desktop-sample-results.png" });
  await page.getByRole("button", { name: "Lock all" }).click();
  await page.getByRole("button", { name: "Load sample project" }).waitFor();
  await page.screenshot({ path: "site/public/assets/desktop-lock-sample.png" });
  await browser.close();
} finally {
  server.kill();
}
