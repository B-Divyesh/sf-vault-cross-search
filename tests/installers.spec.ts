import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const sha256 = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");

test("@claim:verified-installers verifies release checksums before installing", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "host installer fixture runs once");
  const root = mkdtempSync(join(tmpdir(), "vault-cross-search-installers-"));
  try {
    const releaseDir = join(root, "release-assets");
    mkdirSync(releaseDir);
    const releaseFiles = [
      "macos-arm64-Vault.Cross.Search_0.1.2_aarch64.dmg",
      "macos-x64-Vault.Cross.Search_0.1.2_x64.dmg",
      "windows-x64-Vault.Cross.Search_0.1.2_x64_en-US.msi",
      "linux-x64-Vault.Cross.Search_0.1.2_amd64.AppImage",
      "linux-x64-Vault.Cross.Search_0.1.2_amd64.deb"
    ];
    for (const name of releaseFiles) writeFileSync(join(releaseDir, name), `fixture:${name}`);
    const manifestRun = spawnSync(process.execPath, ["scripts/release-manifest.mjs", "v0.1.2", "B-Divyesh/sf-vault-cross-search", releaseDir], { cwd: process.cwd(), encoding: "utf8" });
    expect(manifestRun.status, manifestRun.stderr).toBe(0);
    const manifest = JSON.parse(readFileSync(join(releaseDir, "latest.json"), "utf8")) as { version: string; platforms: Record<string, { name: string; url: string; sha256: string }> };
    expect(manifest.version).toBe("v0.1.2");
    expect(Object.keys(manifest.platforms).sort()).toEqual(["linux-deb", "linux-x64", "macos-arm64", "macos-x64", "windows-x64"]);
    for (const asset of Object.values(manifest.platforms)) {
      expect(asset.sha256).toBe(sha256(readFileSync(join(releaseDir, asset.name))));
      expect(asset.url).toContain("/B-Divyesh/sf-vault-cross-search/releases/download/v0.1.2/");
    }

    const fixtureDir = join(root, "fixture");
    const fakeBin = join(root, "fake-bin");
    const home = join(root, "home");
    mkdirSync(fixtureDir);
    mkdirSync(fakeBin);
    mkdirSync(home);
    const appImage = Buffer.from("verified appimage fixture");
    writeFileSync(join(fixtureDir, "app.AppImage"), appImage);
    writeFileSync(join(fixtureDir, "latest.json"), JSON.stringify({ platforms: { "linux-x64": { url: "https://example.invalid/linux-x64-Vault.AppImage", sha256: sha256(appImage) } } }));
    writeFileSync(join(fakeBin, "uname"), "#!/bin/sh\nif [ \"${1:-}\" = \"-s\" ]; then echo Linux; else echo x86_64; fi\n");
    writeFileSync(join(fakeBin, "curl"), "#!/bin/sh\nout=\"\"\nwhile [ \"$#\" -gt 0 ]; do\n  if [ \"$1\" = \"-o\" ]; then shift; out=\"$1\"; fi\n  shift\ndone\ncase \"$out\" in\n  *latest.json) cp \"$VCS_FIXTURE_DIR/latest.json\" \"$out\" ;;\n  *) cp \"$VCS_FIXTURE_DIR/app.AppImage\" \"$out\" ;;\nesac\n");
    chmodSync(join(fakeBin, "uname"), 0o755);
    chmodSync(join(fakeBin, "curl"), 0o755);
    const env = { ...process.env, HOME: home, VCS_FIXTURE_DIR: fixtureDir, PATH: `${fakeBin}:/usr/bin:/bin` };
    const installRun = spawnSync("sh", ["site/public/install.sh"], { cwd: process.cwd(), env, encoding: "utf8" });
    expect(installRun.status, installRun.stderr).toBe(0);
    const installed = join(home, ".local/bin/vault-cross-search.AppImage");
    expect(readFileSync(installed)).toEqual(appImage);
    expect(installRun.stdout).toContain("Installed verified AppImage");

    writeFileSync(join(fixtureDir, "latest.json"), JSON.stringify({ platforms: { "linux-x64": { url: "https://example.invalid/linux-x64-Vault.AppImage", sha256: "0".repeat(64) } } }));
    rmSync(installed);
    const rejectedRun = spawnSync("sh", ["site/public/install.sh"], { cwd: process.cwd(), env, encoding: "utf8" });
    expect(rejectedRun.status).not.toBe(0);
    expect(rejectedRun.stderr).toContain("Checksum verification failed; nothing was installed.");

    const powershell = readFileSync("site/public/install.ps1", "utf8");
    expect(powershell.indexOf("Get-FileHash")).toBeGreaterThan(-1);
    expect(powershell.indexOf("Get-FileHash")).toBeLessThan(powershell.indexOf("Start-Process"));
    expect(powershell).toContain("Checksum verification failed; nothing was installed.");
    const workflow = readFileSync(".github/workflows/release.yml", "utf8");
    expect(workflow).toContain("sha256sum * > SHA256SUMS");
    expect(workflow).toContain("release-assets/*");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
