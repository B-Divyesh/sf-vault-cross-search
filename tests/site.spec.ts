import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page has one clear heading and working platform action", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("https://api.github.com/**", (route) => route.fulfill({ json: { tag_name: "v0.1.0", assets: [{ name: "latest.json", browser_download_url: "https://example.test/latest.json" }, { name: "SHA256SUMS", browser_download_url: "https://example.test/SHA256SUMS" }, { name: "linux-x64-app.AppImage", browser_download_url: "https://example.test/app.AppImage" }, { name: "windows-x64-app-setup.exe", browser_download_url: "https://example.test/app.exe" }, { name: "macos-x64-app.dmg", browser_download_url: "https://example.test/app.dmg" }, { name: "macos-arm64-app.dmg", browser_download_url: "https://example.test/app.dmg" }] } }));
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("#download-button")).toHaveAttribute("href", /example\.test/);
  await expect(page.locator("main")).toBeVisible();
  expect(errors).toEqual([]);
});

test("landing and legal pages have no serious accessibility violations", async ({ page }) => {
  for (const path of ["/", "/privacy/", "/terms/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((issue) => ["serious", "critical"].includes(issue.impact ?? ""))).toEqual([]);
  }
});

test("download resolves from the latest GitHub Release with checksum manifest", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.fulfill({ json: { tag_name: "v0.1.0", assets: [
    { name: "latest.json", browser_download_url: "https://example.test/latest.json" },
    { name: "SHA256SUMS", browser_download_url: "https://example.test/SHA256SUMS" },
    { name: "linux-x64-Vault.AppImage", browser_download_url: "https://example.test/Vault.AppImage" },
    { name: "windows-x64-Vault-setup.exe", browser_download_url: "https://example.test/Vault.AppImage" },
    { name: "macos-x64-Vault.dmg", browser_download_url: "https://example.test/Vault.AppImage" },
    { name: "macos-arm64-Vault.dmg", browser_download_url: "https://example.test/Vault.AppImage" }
  ] } }));
  await page.goto("/");
  await expect(page.locator("#download-button")).toHaveAttribute("href", "https://example.test/Vault.AppImage");
});

test("mobile layout keeps primary download visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/");
  await expect(page.locator("#download-button")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});
