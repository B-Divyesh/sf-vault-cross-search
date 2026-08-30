import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@claim:demo-search searches bundled metadata across three separate sample vaults", async ({ page }) => {
  await page.goto("/demo/");
  await expect(page.getByRole("heading", { name: "Find an entry across separate vaults" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Three separate vaults" })).toBeVisible();
  await page.getByLabel("Search sample vault metadata").fill("acme");
  await expect(page.locator("#demo-status")).toHaveText("2 matches across three sample vaults");
  await expect(page.locator("#demo-results")).toContainText("Acme VPN");
  await expect(page.locator("#demo-results")).toContainText("Acme status");
  await expect(page.locator("#demo-results")).toContainText("Work.kdbx");
});

test("@claim:demo-isolation keeps sample data in its own storage namespace", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("vault-cross-search:real-vault-list", "do-not-touch"));
  await page.goto("/demo/");
  expect(await page.evaluate(() => localStorage.getItem("vault-cross-search:real-vault-list"))).toBe("do-not-touch");
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain("demo:vault-cross-search:sample-v1");
  expect(keys.filter((key) => key.startsWith("demo:"))).toEqual(["demo:vault-cross-search:sample-v1"]);
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => localStorage.getItem("demo:vault-cross-search:sample-v1"))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("vault-cross-search:real-vault-list"))).toBe("do-not-touch");
});

test("@claim:demo-reset restores the realistic sample from a clean query", async ({ page }) => {
  await page.goto("/demo/");
  const input = page.getByLabel("Search sample vault metadata");
  await input.fill("northstar");
  await expect(page.locator("#demo-results")).toContainText("Northstar credit union");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(input).toHaveValue("");
  await expect(page.locator("#demo-status")).toHaveText("6 sample entries across three separate vaults");
  await expect(page.locator("#demo-results")).toContainText("Acme VPN");
});

test("@claim:demo-privacy sends no third-party requests during the complete sample flow", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173")) externalRequests.push(request.url());
  });
  await page.goto("/demo/");
  await page.getByLabel("Search sample vault metadata").fill("river");
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect(externalRequests).toEqual([]);
});

test("@claim:download-on-demand avoids GitHub until a visitor explicitly asks for a download", async ({ page }) => {
  let githubRequests = 0;
  await page.route("https://api.github.com/**", async (route) => {
    githubRequests += 1;
    await route.fulfill({ json: { assets: [{ name: "linux-x64-Vault.AppImage", browser_download_url: "https://example.test/Vault.AppImage" }] } });
  });
  await page.goto("/");
  expect(githubRequests).toBe(0);
  await page.getByRole("link", { name: "Download the desktop app" }).click();
  await expect.poll(() => githubRequests).toBe(1);
});

test("landing and legal pages have no serious accessibility violations", async ({ page }) => {
  for (const path of ["/", "/demo/", "/privacy/", "/terms/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((issue) => ["serious", "critical"].includes(issue.impact ?? ""))).toEqual([]);
  }
});

test("desktop and mobile routes load without browser console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const path of ["/", "/demo/", "/privacy/", "/terms/"]) await page.goto(path);
  expect(errors).toEqual([]);
});

test("demo is operable by keyboard", async ({ page }) => {
  await page.goto("/demo/");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await expect(page.getByLabel("Search sample vault metadata")).toBeFocused();
  await page.keyboard.type("operations");
  await expect(page.locator("#demo-results")).toContainText("Cloud console");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeFocused();
});

test("mobile demo keeps its primary controls and results within 390px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/demo/");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});

test("site build includes explicit static-host headers and a real 404 response", async ({ page }) => {
  await page.goto("/");
  const config = await (await page.request.get("/staticwebapp.config.json")).json();
  expect(config.globalHeaders["Referrer-Policy"]).toBe("no-referrer");
  expect(config.globalHeaders["Permissions-Policy"]).toContain("camera=()");
  expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
  const notFound = await page.request.get("/404.html");
  expect(notFound.status()).toBe(200);
  expect(await notFound.text()).toContain("<h1>Page not found</h1>");
});
