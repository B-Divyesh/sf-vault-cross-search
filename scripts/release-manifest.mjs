import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [tag, repo, dir] = process.argv.slice(2);
if (!tag || !repo || !dir) throw new Error("usage: release-manifest.mjs <tag> <repo> <dir>");
const files = readdirSync(dir).filter((name) => !["SHA256SUMS", "latest.json"].includes(name));
const find = (pattern) => files.find((name) => pattern.test(name));
const selected = {
  "macos-arm64": find(/^macos-arm64-.*\.dmg$/i),
  "macos-x64": find(/^macos-x64-.*\.dmg$/i),
  "windows-x64": find(/^windows-x64-.*(\.msi|setup\.exe)$/i),
  "linux-x64": find(/^linux-x64-.*\.AppImage$/i),
  "linux-deb": find(/^linux-x64-.*\.deb$/i)
};
const platforms = {};
for (const [platform, name] of Object.entries(selected)) {
  if (!name) continue;
  platforms[platform] = {
    name,
    url: `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(name)}`,
    sha256: createHash("sha256").update(readFileSync(join(dir, name))).digest("hex")
  };
}
for (const required of ["macos-arm64", "macos-x64", "windows-x64", "linux-x64"]) if (!platforms[required]) throw new Error(`missing ${required} release asset`);
writeFileSync(join(dir, "latest.json"), JSON.stringify({ version: tag, publishedAt: new Date().toISOString(), platforms }, null, 2) + "\n");
