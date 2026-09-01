import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

async function installDesktopFixture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const openedEntries: unknown[] = [];
    Object.assign(window, {
      __openedEntries: openedEntries,
      __TAURI_INTERNALS__: {
        invoke: async (command: string, args: Record<string, unknown> = {}) => {
          if (command === "session_state") return {
            vaults: [{ id: "work", name: "Work.kdbx", entries: 2, unlocked: true }],
            locked: false,
            minutesRemaining: 15
          };
          if (command === "search_entries") return [
            { id: "vpn", vaultId: "work", vaultName: "Work.kdbx", title: "Acme VPN", username: "rchen", url: "https://vpn.acme.example", group: "Infrastructure / Access" },
            { id: "status", vaultId: "work", vaultName: "Work.kdbx", title: "Acme status", username: "on-call", url: "https://status.acme.example", group: "Operations / On-call" }
          ];
          if (command === "open_entry") { openedEntries.push(args); return null; }
          if (command === "lock_all") return null;
          throw new Error(`Unexpected desktop fixture command: ${command}`);
        }
      }
    });
  });
}

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
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
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

test("@claim:site-resource-privacy loads site and policy pages without third-party resources", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173")) externalRequests.push(request.url());
  });
  for (const path of ["/", "/privacy/", "/terms/", "/404.html"]) await page.goto(path);
  expect(externalRequests).toEqual([]);
});

test("@claim:desktop-no-observation makes no analytics, telemetry, advertising, crash-reporting, or sync request", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop webview claim");
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:1420")) externalRequests.push(request.url());
  });
  await installDesktopFixture(page);
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await page.getByRole("button", { name: "Field license" }).click();
  await expect(page.getByRole("dialog", { name: "Search without borders" })).toBeVisible();
  await page.getByRole("button", { name: "Close license dialog" }).click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await page.getByLabel("Search unlocked vaults").fill("acme");
  await expect(page.getByRole("option")).toHaveCount(2);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __openedEntries: unknown[] }).__openedEntries.length)).toBe(1);
  expect(externalRequests).toEqual([]);
});

test("@claim:desktop-keyboard-search focuses, moves through, and opens desktop results", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop webview claim");
  await installDesktopFixture(page);
  await page.goto("http://127.0.0.1:1420/");
  const search = page.getByLabel("Search unlocked vaults");
  await expect(search).toBeEnabled();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await expect(search).toBeFocused();
  await search.fill("acme");
  await expect(page.getByRole("option")).toHaveCount(2);
  await page.keyboard.press("ArrowDown");
  const selectedOption = page.getByRole("option").nth(1);
  await expect(selectedOption).toHaveAttribute("aria-selected", "true");
  const expectedEntryId = (await selectedOption.textContent())?.includes("Acme VPN") ? "vpn" : "status";
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __openedEntries: Array<Record<string, string>> }).__openedEntries[0])).toEqual({ vaultId: "work", entryId: expectedEntryId });
});

test("@claim:one-time-pricing protects the price, terms, and checkout target", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop license dialog claim");
  const checkout = "https://api.sociobot.in/api/v1/products/vault-cross-search/checkout";
  await page.goto("/");
  await expect(page.getByText("$19 once", { exact: true })).toBeVisible();
  await expect(page.getByText("One-time purchase", { exact: true })).toBeVisible();
  await expect(page.getByText("Unlimited vaults on this device. No subscription.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buy a license" })).toHaveAttribute("href", checkout);
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Field license" }).click();
  await expect(page.getByRole("dialog", { name: "Search without borders" })).toContainText("$19 one-time license");
  await expect(page.getByRole("dialog", { name: "Search without borders" })).toContainText("No subscription.");
  await expect(page.getByRole("link", { name: "Buy a license" })).toHaveAttribute("href", checkout);
  await page.goto("/terms/");
  await expect(page.locator("main")).toContainText("A $19 one-time purchase enables unlimited vaults");
  await expect(page.locator("main")).toContainText("There is no subscription.");
  const readme = readFileSync("README.md", "utf8");
  expect(readme).toContain("A $19 one-time license enables unlimited vaults");
  expect(readme).toContain("There is no subscription.");
});

test("@claim:license-verdict-storage stores a verified token verdict locally", async ({ page }) => {
  let requests = 0;
  await page.route("https://api.sociobot.in/api/v1/products/vault-cross-search/verify?license=fixture-token", async (route) => {
    requests += 1;
    await route.fulfill({ json: { valid: true, reason: "ok" } });
  });
  await page.goto("http://127.0.0.1:1420/?license=fixture-token");
  await expect.poll(() => requests).toBe(1);
  await expect(page).toHaveURL("http://127.0.0.1:1420/");
  const stored = await page.evaluate(() => ({
    token: localStorage.getItem("sb_license:vault-cross-search"),
    verdict: JSON.parse(localStorage.getItem("sb_license:vault-cross-search:verdict") || "null")
  }));
  expect(stored.token).toBe("fixture-token");
  expect(stored.verdict.valid).toBe(true);
  expect(stored.verdict.checkedAt).toEqual(expect.any(Number));
});

test("@claim:license-revocation returns refunded or charged-back licenses to the free limit", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sb_license:vault-cross-search", "revoked-fixture");
    localStorage.setItem("sb_license:vault-cross-search:verdict", JSON.stringify({ valid: true, checkedAt: 0 }));
  });
  await page.route("https://api.sociobot.in/api/v1/products/vault-cross-search/verify?license=revoked-fixture", (route) => route.fulfill({ json: { valid: false, reason: "revoked" } }));
  await page.goto("http://127.0.0.1:1420/");
  await expect(page.locator("#license-label")).toHaveText("Free · 2 vaults");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("sb_license:vault-cross-search:verdict") || "null").valid)).toBe(false);
});

test("@claim:offline-license-cache keeps a previously valid license active when verification is offline", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });
    localStorage.setItem("sb_license:vault-cross-search", "offline-fixture");
    localStorage.setItem("sb_license:vault-cross-search:verdict", JSON.stringify({ valid: true, checkedAt: 0 }));
  });
  await page.route("https://api.sociobot.in/**", (route) => route.abort("internetdisconnected"));
  await page.goto("http://127.0.0.1:1420/");
  await expect(page.locator("#license-label")).toHaveText("Licensed · unlimited");
});

test("@claim:license-scope keeps accessibility, session locking, and privacy code outside the paid gate", async ({ browser }) => {
  const snapshots: Array<{ controls: string[]; serious: number }> = [];
  for (const licensed of [false, true]) {
    const context = await browser.newContext();
    if (licensed) await context.addInitScript(() => localStorage.setItem("sb_license:vault-cross-search:verdict", JSON.stringify({ valid: true, checkedAt: Date.now() })));
    const appPage = await context.newPage();
    await appPage.goto("http://127.0.0.1:1420/");
    const controls = await appPage.locator("#search-input, #add-vault, #lock-button, #theme-button").evaluateAll((nodes) => nodes.map((node) => node.id));
    const axe = await new AxeBuilder({ page: appPage }).analyze();
    snapshots.push({ controls, serious: axe.violations.filter((issue) => ["serious", "critical"].includes(issue.impact ?? "")).length });
    await context.close();
  }
  expect(snapshots[0]).toEqual(snapshots[1]);
  expect(snapshots[0].serious).toBe(0);
  const productionCore = readFileSync("src-tauri/src/lib.rs", "utf8").split("#[cfg(test)]")[0].toLowerCase();
  expect(productionCore).not.toContain("license");
});

test("malformed cached license verdict is discarded without stopping initialization", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("sb_license:vault-cross-search:verdict", "{broken"));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", /light|dark/);
  expect(await page.evaluate(() => localStorage.getItem("sb_license:vault-cross-search:verdict"))).toBeNull();
  expect(errors).toEqual([]);
});

test("landing and legal pages have no serious accessibility violations", async ({ page }) => {
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((issue) => ["serious", "critical"].includes(issue.impact ?? ""))).toEqual([]);
  }
});

test("desktop and mobile routes load without browser console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) await page.goto(path);
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

test("demo keyboard focus has a visible three-pixel treatment", async ({ page }) => {
  await page.goto("/demo/");
  const input = page.getByLabel("Search sample vault metadata");
  const container = input.locator("..");
  const before = await container.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outline, borderColor: style.borderColor, boxShadow: style.boxShadow };
  });
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await expect(input).toBeFocused();
  const after = await container.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outline, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, borderColor: style.borderColor, boxShadow: style.boxShadow };
  });
  expect(after.outlineStyle).toBe("solid");
  expect(after.outlineWidth).toBe("3px");
  expect(after.outline).not.toBe(before.outline);
  expect(after.borderColor).not.toBe(before.borderColor);
  expect(after.boxShadow).not.toBe(before.boxShadow);
});

test("mobile demo keeps its primary controls and results within 390px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/demo/");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});

test("all public controls meet the 44px mobile target minimum", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    const undersized = await page.locator("a[href], button, input").evaluateAll((elements) => elements
      .filter((element) => (element as HTMLElement).checkVisibility())
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { label: element.getAttribute("aria-label") || element.textContent?.trim() || element.getAttribute("placeholder"), width: rect.width, height: rect.height };
      })
      .filter(({ width, height }) => width < 44 || height < 44));
    expect(undersized, `${path} contains undersized interactive targets`).toEqual([]);
  }
});

test("every public route uses the standard skip, header, footer, and build shell", async ({ page }) => {
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header.site-header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.getByText("Built by Param Factory · Build v0.1.2", { exact: true })).toBeVisible();
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#main");
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  }
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
