import "./style.css";

const repo = "https://github.com/B-Divyesh/sf-vault-cross-search";
const manifestUrl = `${repo}/releases/latest/download/latest.json`;
type Asset = { url: string; name: string };
type Manifest = { version: string; platforms: Record<string, Asset> };

function platform(): "macos-arm64" | "macos-x64" | "windows-x64" | "linux-x64" {
  const value = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (value.includes("win")) return "windows-x64";
  if (value.includes("mac")) return value.includes("arm") ? "macos-arm64" : "macos-x64";
  return "linux-x64";
}

const names = { "macos-arm64": "Download for Mac (Apple silicon)", "macos-x64": "Download for Mac (Intel)", "windows-x64": "Download for Windows", "linux-x64": "Download for Linux" };
async function resolveDownload() {
  const button = document.querySelector<HTMLAnchorElement>("#download-button")!;
  const label = document.querySelector("#download-label")!;
  const detail = document.querySelector("#download-detail")!;
  const status = document.querySelector("#release-status")!;
  const target = platform();
  label.textContent = names[target];
  detail.textContent = target === "linux-x64" ? "AppImage · x86_64" : target.startsWith("macos") ? "DMG · unsigned" : "MSI · unsigned";
  try {
    const response = await fetch(manifestUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("release unavailable");
    const manifest = await response.json() as Manifest;
    const asset = manifest.platforms[target];
    if (!asset?.url) throw new Error("asset unavailable");
    button.href = asset.url;
    status.textContent = `Latest ${manifest.version} · SHA256 published`;
  } catch {
    status.textContent = "Release assets are being prepared · view GitHub";
    button.href = `${repo}/releases/latest`;
  }
}

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(button.dataset.copy!); button.querySelector("b")!.textContent = "Copied"; }
  catch { button.querySelector("b")!.textContent = "Select to copy"; }
}));
resolveDownload();
