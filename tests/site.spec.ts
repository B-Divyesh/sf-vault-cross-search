import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, readFileSync, statSync } from "node:fs";

const DEMO_URL = "/?demo=1";

async function installDesktopFixture(page: import("@playwright/test").Page, options: { multiVault?: boolean } = {}) {
  await page.addInitScript((multiVault) => {
    const openedEntries: unknown[] = [];
    const vaults = multiVault
      ? [
          { id: "work", name: "Work.kdbx", entries: 1, unlocked: true },
          { id: "personal", name: "Personal.kdbx", entries: 1, unlocked: true }
        ]
      : [{ id: "work", name: "Work.kdbx", entries: 2, unlocked: true }];
    const entries = multiVault
      ? [
          { id: "vpn", vaultId: "work", vaultName: "Work.kdbx", title: "Acme VPN", username: "rchen", url: "https://vpn.acme.example", group: "Infrastructure / Access" },
          { id: "billing", vaultId: "personal", vaultName: "Personal.kdbx", title: "Personal billing", username: "acme", url: "https://billing.acme.example", group: "Money / Bills" }
        ]
      : [
          { id: "vpn", vaultId: "work", vaultName: "Work.kdbx", title: "Acme VPN", username: "rchen", url: "https://vpn.acme.example", group: "Infrastructure / Access" },
          { id: "status", vaultId: "work", vaultName: "Work.kdbx", title: "Acme status", username: "on-call", url: "https://status.acme.example", group: "Operations / On-call" }
        ];
    Object.assign(window, {
      __openedEntries: openedEntries,
      __TAURI_INTERNALS__: {
        invoke: async (command: string, args: Record<string, unknown> = {}) => {
          if (command === "session_state") return {
            vaults,
            locked: false,
            minutesRemaining: 15
          };
          if (command === "search_entries") return entries;
          if (command === "open_entry") { openedEntries.push(args); return null; }
          if (command === "lock_all") return null;
          throw new Error(`Unexpected desktop fixture command: ${command}`);
        }
      }
    });
  }, options.multiVault === true);
}

async function installFirstRunDesktopFixture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const vaults: Array<{ id: string; name: string; entries: number; unlocked: boolean }> = [];
    const sampleEntries = [
      { id: "sample-vpn", vaultId: "sample", vaultName: "Sample vault.kdbx", title: "Acme VPN", username: "sample.operator", url: "https://vpn.acme.example", group: "Infrastructure / Access" },
      { id: "sample-status", vaultId: "sample", vaultName: "Sample vault.kdbx", title: "Acme status", username: "sample.on-call", url: "https://status.acme.example", group: "Operations / On-call" }
    ];
    Object.assign(window, {
      __TAURI_INTERNALS__: {
        invoke: async (command: string) => {
          if (command === "session_state") return { vaults, locked: vaults.length === 0, minutesRemaining: 15 };
          if (command === "load_sample_project") {
            if (vaults.length) throw new Error("sample session already loaded");
            vaults.push({ id: "sample", name: "Sample vault.kdbx", entries: sampleEntries.length, unlocked: true });
            return vaults[0];
          }
          if (command === "search_entries") return sampleEntries;
          if (command === "lock_all") { vaults.splice(0); return null; }
          throw new Error(`Unexpected first-run fixture command: ${command}`);
        }
      }
    });
  });
}

test("@claim:demo-search searches bundled metadata across three separate sample vaults", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
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
  await page.goto(DEMO_URL);
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
  await page.goto(DEMO_URL);
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
  await page.goto(DEMO_URL);
  await page.getByLabel("Search sample vault metadata").fill("river");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(externalRequests).toEqual([]);
});

test("@claim:demo-boundary uses no native vault or file access", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, {
      __demoBoundaryCalls: [] as string[],
      showOpenFilePicker: () => { (window as unknown as { __demoBoundaryCalls: string[] }).__demoBoundaryCalls.push("file-picker"); },
      __TAURI_INTERNALS__: {
        invoke: (command: string) => { (window as unknown as { __demoBoundaryCalls: string[] }).__demoBoundaryCalls.push(`native:${command}`); }
      }
    });
  });
  await page.goto(DEMO_URL);
  await page.getByLabel("Search sample vault metadata").fill("river");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __demoBoundaryCalls: string[] }).__demoBoundaryCalls)).toEqual([]);
});

test("@claim:download-on-demand asks GitHub only after a click and chooses the visitor's platform", async ({ browser }) => {
  const cases = [
    { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", asset: "macos-x64-Vault.dmg" },
    { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", asset: "windows-x64-Vault-setup.exe" },
    { userAgent: "Mozilla/5.0 (X11; Linux x86_64)", asset: "linux-x64-Vault.AppImage" }
  ];
  const assets = cases.map(({ asset }) => ({ name: asset, browser_download_url: `https://downloads.example/${asset}` }));
  for (const downloadCase of cases) {
    const context = await browser.newContext({ userAgent: downloadCase.userAgent });
    const downloadPage = await context.newPage();
    let githubRequests = 0;
    let selectedAsset = "";
    await downloadPage.route("https://api.github.com/**", async (route) => {
      githubRequests += 1;
      await route.fulfill({ json: { assets } });
    });
    await downloadPage.route("https://downloads.example/**", async (route) => {
      selectedAsset = new URL(route.request().url()).pathname.slice(1);
      await route.fulfill({ contentType: "application/octet-stream", body: "fixture" });
    });
    await downloadPage.goto("http://127.0.0.1:4173/");
    expect(githubRequests).toBe(0);
    await downloadPage.getByRole("link", { name: "Download the desktop app" }).click();
    await expect.poll(() => selectedAsset).toBe(downloadCase.asset);
    expect(githubRequests).toBe(1);
    await context.close();
  }
});

test("@claim:site-resource-privacy loads site and policy pages without third-party resources", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173")) externalRequests.push(request.url());
  });
  for (const path of ["/", "/privacy/", "/terms/", "/404.html"]) await page.goto(path);
  expect(externalRequests).toEqual([]);
});

test("@claim:website-install-copy copies only the displayed public install command after an explicit click", async ({ page }) => {
  await page.addInitScript(() => {
    const writes: string[] = [];
    Object.assign(window, { __clipboardWrites: writes });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value: string) => { writes.push(value); } }
    });
  });
  await page.goto("/");
  await expect(page.getByText("The desktop app never copies secret values", { exact: true })).toBeVisible();
  await expect(page.getByText("No clipboard writes", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __clipboardWrites: string[] }).__clipboardWrites)).toEqual([]);
  const command = page.locator("button[data-copy]").first();
  const visibleCommand = await command.locator("code").innerText();
  await command.click();
  expect(await page.evaluate(() => (window as unknown as { __clipboardWrites: string[] }).__clipboardWrites)).toEqual([visibleCommand]);
  await expect(command).toContainText("Install command copied");
});

test("@claim:original-artwork verifies the generated hero source, prompt, derivatives, and disclosure", async ({ page }) => {
  const source = "assets/src/topographic-vaults.png";
  const sidecars = ["assets/src/topographic-vaults.json", "assets/src/topographic-vaults.png.json"];
  expect(existsSync(source)).toBe(true);
  expect(statSync(source).size).toBeGreaterThan(100_000);
  for (const sidecar of sidecars) {
    const provenance = JSON.parse(readFileSync(sidecar, "utf8")) as { prompt: string; model?: string; deployment?: string };
    expect(provenance.prompt).toContain("topographic field map");
    expect(provenance.model ?? provenance.deployment).toMatch(/factory-image/);
  }
  const design = readFileSync(".factory/design.md", "utf8");
  expect(design).toContain("generated specifically for this product");
  expect(design).toContain("2026-08-28");
  await page.goto("/");
  await expect(page.getByText("Hero artwork was generated for this product.", { exact: true })).toBeVisible();
  const image = page.locator(".hero-art img");
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("width", "1280");
  await expect(image).toHaveAttribute("height", "853");
  expect(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  for (const derivative of ["site/public/assets/topographic-vaults-768.avif", "site/public/assets/topographic-vaults-1280.avif", "site/public/assets/topographic-vaults-768.webp", "site/public/assets/topographic-vaults-1280.webp"]) {
    expect(existsSync(derivative)).toBe(true);
    expect(statSync(derivative).size).toBeGreaterThan(10_000);
  }
  await expect(page.locator('.hero-art source[type="image/avif"]')).toHaveAttribute("srcset", /topographic-vaults-768\.avif.+topographic-vaults-1280\.avif/);
  await expect(page.locator('.hero-art source[type="image/webp"]')).toHaveAttribute("srcset", /topographic-vaults-768\.webp.+topographic-vaults-1280\.webp/);
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
  await page.getByRole("button", { name: "License options" }).click();
  await expect(page.getByRole("dialog", { name: "License options" })).toBeVisible();
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

test("@claim:desktop-multi-vault-search searches two unlocked desktop vaults and opens the selected owner", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop webview claim");
  await installDesktopFixture(page, { multiVault: true });
  await page.goto("http://127.0.0.1:1420/");
  const search = page.getByLabel("Search unlocked vaults");
  await search.fill("acme");
  const options = page.getByRole("option");
  await expect(options).toHaveCount(2);
  await expect(page.locator("#status")).toHaveText("2 matches across 2 vaults");
  await expect(options.nth(0)).toContainText("Work.kdbx");
  await expect(options.nth(1)).toContainText("Personal.kdbx");
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __openedEntries: Array<Record<string, string>> }).__openedEntries[0])).toEqual({ vaultId: "personal", entryId: "billing" });
});

test("@claim:desktop-sample-project loads the bundled project from the Tauri first-run screen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop webview claim");
  await installFirstRunDesktopFixture(page);
  await page.goto("http://127.0.0.1:1420/");
  await expect(page.getByRole("button", { name: "Load sample project" })).toBeVisible();
  await expect(page.getByText("First-run walkthrough", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load sample project" }).click();
  await expect(page.getByLabel("Search unlocked vaults")).toHaveValue("acme");
  await expect(page.locator("#status")).toHaveText("2 matches across 1 vault");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(page.locator("#vault-list")).toContainText("Sample vault.kdbx");
  await expect(page.locator("#results")).toContainText("Acme VPN");
});

test("@claim:one-time-pricing shows literal pricing while purchase remains unavailable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop license dialog claim");
  await page.goto("/");
  await expect(page.getByText("$19 once", { exact: true })).toBeVisible();
  await expect(page.getByText("No subscription. Purchases are not open yet.", { exact: true })).toBeVisible();
  await expect(page.getByText("Purchase unavailable", { exact: true })).toBeVisible();
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "License options" }).click();
  const dialog = page.getByRole("dialog", { name: "License options" });
  await expect(dialog).toContainText("$19 once, with no subscription");
  await expect(dialog).toContainText("Purchase unavailable");
  await expect(dialog.locator('a[href*="/checkout"]')).toHaveCount(0);
  await page.goto("/terms/");
  await expect(page.locator("main")).toContainText("The planned unlimited-vault license is $19 once, with no subscription.");
  await expect(page.locator("main")).toContainText("Purchases are not open yet.");
  const readme = readFileSync("README.md", "utf8");
  expect(readme).toContain("The planned unlimited-vault license is $19 once, with no subscription.");
  expect(readme).toContain("Purchases are not open yet.");
  expect(readFileSync("site/index.html", "utf8") + readFileSync("src/main.ts", "utf8")).not.toContain("/checkout");
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

test("@claim:license-revocation returns revoked licenses to the free limit", async ({ page }) => {
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
  for (const path of ["/", DEMO_URL, "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((issue) => ["serious", "critical"].includes(issue.impact ?? ""))).toEqual([]);
  }
});

test("desktop and mobile routes load without browser console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const path of ["/", DEMO_URL, "/demo/", "/privacy/", "/terms/", "/404.html"]) await page.goto(path);
  expect(errors).toEqual([]);
});

test("demo is operable by keyboard", async ({ page }) => {
  await page.goto(DEMO_URL);
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await expect(page.getByLabel("Search sample vault metadata")).toBeFocused();
  await page.getByLabel("Search sample vault metadata").fill("operations");
  await expect(page.locator("#demo-results")).toContainText("Cloud console");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeFocused();
});

test("demo keyboard focus has a visible three-pixel treatment", async ({ page }) => {
  await page.goto(DEMO_URL);
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
  await page.goto(DEMO_URL);
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.getByLabel("Search sample vault metadata")).toBeInViewport();
  for (const result of [page.locator("#demo-results li").nth(0), page.locator("#demo-results li").nth(1)]) {
    await expect(result).toBeInViewport();
    await expect(result).toContainText("Acme");
    await expect(result).toContainText("Work.kdbx");
  }
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
});

test("mobile first screen shows all three product facts and Privacy navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/");
  await expect(page.locator("header").getByRole("link", { name: "Privacy" })).toBeVisible();
  for (const fact of ["Sample data stays separate", "Passwords are not indexed", "Desktop app locks after inactivity"]) {
    await expect(page.getByText(fact, { exact: true })).toBeInViewport();
  }
});

test("demo keeps result metadata visible at 720px and the 200% zoom width proxy", async ({ page }) => {
  for (const width of [720, 195]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(DEMO_URL);
    const layout = await page.evaluate(() => {
      const clipped = [...document.querySelectorAll<HTMLElement>("#demo-results li > span:nth-child(2) strong, #demo-results li > span:nth-child(2) small, #demo-results li > span:nth-child(3) strong, #demo-results li > span:nth-child(3) small")]
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => element.textContent);
      return { bodyWidth: document.body.scrollWidth, viewportWidth: document.documentElement.clientWidth, clipped };
    });
    expect(layout.bodyWidth, `${width}px body width`).toBe(layout.viewportWidth);
    expect(layout.clipped, `${width}px result metadata is clipped`).toEqual([]);
  }
});

test("all public controls meet the 44px mobile target minimum", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  for (const path of ["/", DEMO_URL, "/demo/", "/privacy/", "/terms/", "/404.html"]) {
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
  for (const path of ["/", DEMO_URL, "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header.site-header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.getByText("Built by Param Factory · Build v0.1.6", { exact: true })).toBeVisible();
    const skip = page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#main");
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  }
});

test("real routes set distinct titles, metadata, and focus headings after navigation and Back", async ({ page }) => {
  const expected = [
    { path: "/", title: "Vault Cross Search — find entries across local vaults", h1: "Find an entry across separate vaults" },
    { path: DEMO_URL, title: "Demo — Vault Cross Search", h1: "Find an entry across separate vaults" },
    { path: "/privacy/", title: "Privacy — Vault Cross Search", h1: "Privacy" },
    { path: "/terms/", title: "Terms — Vault Cross Search", h1: "Terms" },
    { path: "/404.html", title: "Page not found — Vault Cross Search", h1: "Page not found" }
  ];
  for (const route of expected) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", route.title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", route.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.h1);
  }
  await page.goto("/");
  await page.locator("header").getByRole("link", { name: "Privacy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Privacy" })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: "Find an entry across separate vaults" })).toBeFocused();
  await expect(page.locator("#route-announcer")).toContainText("page loaded");
});

test("same-origin navigation and desktop legal links have real destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "link crawl runs once");
  const paths = ["/", DEMO_URL, "/demo/", "/privacy/", "/terms/", "/404.html"];
  const destinations = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    for (const href of await page.locator('a[href]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href))) {
      const url = new URL(href);
      if (url.origin === "http://127.0.0.1:4173") destinations.add(`${url.pathname}${url.search}`);
    }
  }
  for (const destination of destinations) {
    expect((await page.request.get(destination)).ok(), destination).toBe(true);
  }
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "License options" }).click();
  await expect(page.getByRole("dialog", { name: "License options" }).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "https://vault-cross-search.sociobot.in/privacy/");
  await expect(page.getByRole("dialog", { name: "License options" }).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "https://vault-cross-search.sociobot.in/terms/");
});

test("site build includes explicit static-host headers and a real 404 response", async ({ page }) => {
  await page.goto("/");
  const config = await (await page.request.get("/staticwebapp.config.json")).json();
  expect(config.globalHeaders["Referrer-Policy"]).toBe("no-referrer");
  expect(config.globalHeaders["Permissions-Policy"]).toContain("camera=()");
  expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html", statusCode: 404 });
  const notFound = await page.request.get("/404.html");
  expect(notFound.status()).toBe(200);
  const notFoundHtml = await notFound.text();
  expect(notFoundHtml).toContain('<h1 tabindex="-1">Page not found</h1>');
  expect(notFoundHtml).not.toContain("No marker at this coordinate");
});
