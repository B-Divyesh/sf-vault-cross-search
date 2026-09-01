import { readdirSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";

const [dir] = process.argv.slice(2);
if (!dir) throw new Error("usage: normalize-release-asset-names.mjs <release-assets-dir>");

const files = readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile());
for (const name of files) {
  const normalized = name.replaceAll(" ", ".");
  if (normalized === name) continue;
  if (files.includes(normalized)) throw new Error(`cannot normalize ${name}: ${normalized} already exists`);
  renameSync(join(dir, name), join(dir, normalized));
}
