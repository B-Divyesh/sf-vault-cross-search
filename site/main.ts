import "./style.css";

type SampleEntry = { vault: string; title: string; username: string; url: string; group: string };
const demoKey = "demo:vault-cross-search:sample-v1";
const samples: SampleEntry[] = [
  { vault: "Personal.kdbx", title: "Northstar credit union", username: "river.chen", url: "https://online.northstarcu.example", group: "Money / Daily" },
  { vault: "Work.kdbx", title: "Acme VPN", username: "rchen", url: "https://vpn.acme.example", group: "Infrastructure / Access" },
  { vault: "Archive.kdbx", title: "Cloud console", username: "ops-archive", url: "https://console.example", group: "Operations / Retired" },
  { vault: "Work.kdbx", title: "Acme status", username: "on-call", url: "https://status.acme.example", group: "Operations / On-call" },
  { vault: "Personal.kdbx", title: "Library card", username: "river", url: "https://catalog.example", group: "Home / Records" },
  { vault: "Archive.kdbx", title: "Travel insurance", username: "river.chen", url: "https://travel.example", group: "Records / 2025" }
];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function copyButtons() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(button.dataset.copy!); button.querySelector("b")!.textContent = "Copied"; }
    catch { button.querySelector("b")!.textContent = "Select to copy"; }
  }));
}

function setDownloadAction() {
  const button = document.querySelector<HTMLAnchorElement>("#download-button");
  if (!button) return;
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    button.textContent = "Finding your download…";
    const target = /win/i.test(navigator.userAgent) ? "windows-x64" : /mac/i.test(navigator.userAgent) ? "macos-x64" : "linux-x64";
    try {
      const response = await fetch("https://api.github.com/repos/B-Divyesh/sf-vault-cross-search/releases/latest", { cache: "no-store" });
      if (!response.ok) throw new Error("release unavailable");
      const release = await response.json() as { assets: Array<{ name: string; browser_download_url: string }> };
      const asset = release.assets.find(({ name }) => name.startsWith(`${target}-`) && (target === "windows-x64" ? /-setup\.exe$|\.msi$/i.test(name) : target === "linux-x64" ? /\.AppImage$/i.test(name) : /\.dmg$/i.test(name)));
      if (!asset) throw new Error("asset unavailable");
      window.location.assign(asset.browser_download_url);
    } catch {
      window.location.assign("https://github.com/B-Divyesh/sf-vault-cross-search/releases/latest");
    }
  });
}

function loadDemo(): SampleEntry[] {
  try {
    const saved = JSON.parse(localStorage.getItem(demoKey) || "null");
    if (Array.isArray(saved) && saved.every((entry) => typeof entry?.title === "string")) return saved;
  } catch { /* start from the bundled sample */ }
  localStorage.setItem(demoKey, JSON.stringify(samples));
  return samples;
}

function renderDemo() {
  const root = document.querySelector<HTMLDivElement>("#demo-root")!;
  let entries = loadDemo();
  root.innerHTML = `
    <header class="site-header demo-header"><a class="wordmark" href="/"><span class="mark" aria-hidden="true"></span>Vault Cross Search</a><nav aria-label="Primary"><a href="/">Home</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></header>
    <aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved to your real vaults</strong><span><button type="button" id="reset-demo">Reset demo</button><a href="/" id="start-real">Start for real</a></span></aside>
    <main id="main" class="demo-workspace" tabindex="-1"><section class="demo-rail" aria-labelledby="sample-vaults"><p class="eyebrow">Sample vaults</p><h2 id="sample-vaults">Three separate vaults</h2><ul>${["Personal.kdbx", "Work.kdbx", "Archive.kdbx"].map((vault) => `<li><span class="vault-glyph" aria-hidden="true">${vault[0]}</span><span><strong>${vault}</strong><small>${entries.filter((entry) => entry.vault === vault).length} sample entries · unlocked</small></span></li>`).join("")}</ul><p>These bundled records use no file picker or desktop connection.</p></section>
      <section class="demo-search" aria-labelledby="demo-heading"><p class="eyebrow">Sample search</p><h1 id="demo-heading" tabindex="-1">Find an entry across separate vaults</h1><p>Search the bundled metadata. Each result names its owning vault.</p><label class="sr-only" for="demo-search">Search sample vault metadata</label><div class="demo-input"><span aria-hidden="true">⌕</span><input id="demo-search" type="search" autocomplete="off" value="acme" placeholder="Try “acme”, “river”, or “operations”"><kbd>Ctrl K</kbd></div><p id="demo-status" class="demo-status" aria-live="polite"></p><ol id="demo-results" class="demo-results" aria-label="Sample search results"></ol></section></main>
    <footer><a class="wordmark" href="/"><span class="mark" aria-hidden="true"></span>Vault Cross Search</a><p>Bundled sample metadata is isolated in this browser only.<br><span class="build-id">Built by Param Factory · Build v0.1.4</span></p><nav aria-label="Legal"><a href="/?demo=1" aria-current="page">Demo</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></footer>`;
  const input = document.querySelector<HTMLInputElement>("#demo-search")!;
  const results = document.querySelector<HTMLOListElement>("#demo-results")!;
  const status = document.querySelector<HTMLParagraphElement>("#demo-status")!;
  const show = () => {
    const query = input.value.trim().toLowerCase();
    const matches = entries.filter((entry) => !query || `${entry.title} ${entry.username} ${entry.url} ${entry.group}`.toLowerCase().includes(query));
    status.textContent = query ? `${matches.length} ${matches.length === 1 ? "match" : "matches"} across three sample vaults` : "6 sample entries across three separate vaults";
    results.innerHTML = matches.length ? matches.map((entry) => `<li><span class="result-pin" aria-hidden="true"></span><span><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.username)} · ${escapeHtml(entry.url.replace(/^https:\/\//, ""))}</small></span><span><small>${escapeHtml(entry.group)}</small><strong>${escapeHtml(entry.vault)}</strong></span></li>`).join("") : `<li class="demo-empty"><strong>No sample match</strong><span>Try “acme”, “river”, or “operations”.</span></li>`;
  };
  input.addEventListener("input", show);
  document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); input.focus(); } });
  document.querySelector<HTMLButtonElement>("#reset-demo")!.addEventListener("click", () => { localStorage.removeItem(demoKey); entries = loadDemo(); input.value = ""; show(); input.focus(); });
  document.querySelector<HTMLAnchorElement>("#start-real")!.addEventListener("click", () => localStorage.removeItem(demoKey));
  show();
  document.dispatchEvent(new CustomEvent("vault-route-ready"));
}

const queryDemo = new URLSearchParams(location.search).get("demo") === "1";
if (queryDemo && document.body.dataset.page !== "demo") {
  document.title = "Demo — Vault Cross Search";
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", "Try Vault Cross Search with three isolated sample KeePass vaults.");
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://vault-cross-search.sociobot.in/demo/");
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", "Demo — Vault Cross Search");
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", "Search three isolated sample vaults.");
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", "Demo — Vault Cross Search");
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", "Search three isolated sample vaults.");
  document.body.dataset.page = "demo";
  document.body.innerHTML = '<a class="skip-link" href="#main">Skip to demo</a><div id="demo-root"></div>';
}

if (document.body.dataset.page === "demo") renderDemo();
else { copyButtons(); setDownloadAction(); }
