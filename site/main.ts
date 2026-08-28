import "./style.css";

const repo = "https://github.com/B-Divyesh/sf-vault-cross-search";
const releaseApiUrl = "https://api.github.com/repos/B-Divyesh/sf-vault-cross-search/releases/latest";

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
    // GitHub's release asset redirect does not expose CORS headers, so read the
    // same latest Release through its documented API and require its manifest.
    const response = await fetch(releaseApiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("release unavailable");
    const release = await response.json() as { tag_name: string; assets: Array<{ name: string; browser_download_url: string }> };
    if (!release.assets.some(({ name }) => name === "latest.json") || !release.assets.some(({ name }) => name === "SHA256SUMS")) throw new Error("manifest unavailable");
    const prefix = `${target}-`;
    const asset = release.assets.find(({ name }) => name.startsWith(prefix) && (target === "windows-x64" ? /-setup\.exe$|\.msi$/i.test(name) : target === "linux-x64" ? /\.AppImage$/i.test(name) : /\.dmg$/i.test(name)));
    if (!asset) throw new Error("asset unavailable");
    button.href = asset.browser_download_url;
    status.textContent = `Latest ${release.tag_name} · SHA256 published`;
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
