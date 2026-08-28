import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page has one clear heading and working platform action", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("**/latest.json", (route) => route.fulfill({ json: { version: "v0.1.0", platforms: { "linux-x64": { name: "app.AppImage", url: "https://example.test/app.AppImage", sha256: "abc" }, "windows-x64": { name: "app.msi", url: "https://example.test/app.msi", sha256: "abc" }, "macos-x64": { name: "app.dmg", url: "https://example.test/app.dmg", sha256: "abc" }, "macos-arm64": { name: "app.dmg", url: "https://example.test/app.dmg", sha256: "abc" } } } }));
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

test("download resolves from GitHub API when release manifest is blocked by CORS", async ({ page }) => {
  await page.route("**/latest.json", (route) => route.abort());
  await page.route("https://api.github.com/**", (route) => route.fulfill({ json: { tag_name: "v0.1.0", assets: [
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
