import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";
import { initialLicenseState, mayAddVault, needsLicenseRefresh, readCachedLicenseVerdict } from "./license";
import { rankResults, safeDisplayUrl } from "./search";
import type { LicenseState, SearchResult, SessionState, VaultSummary } from "./types";
import "./style.css";

const SLUG = "vault-cross-search";
const API_BASE = "https://api.sociobot.in/api/v1";
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const isTauri = "__TAURI_INTERNALS__" in window;

let state: SessionState = { vaults: [], locked: true, minutesRemaining: 15 };
let results: SearchResult[] = [];
let selected = 0;
let query = "";
let cachedVerdict = readCachedLicenseVerdict(localStorage, VERDICT_KEY);
let licenseState: LicenseState = initialLicenseState(cachedVerdict);
let pendingPath = "";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <header class="app-header">
    <a class="brand" href="#main" aria-label="Vault Cross Search home"><span class="brand-mark" aria-hidden="true"></span><span>Vault Cross Search</span></a>
    <div class="header-actions">
      <span class="session-pill" id="session-pill">No vaults unlocked</span>
      <button class="icon-button" id="theme-button" type="button" aria-label="Toggle color theme" title="Toggle color theme">◐</button>
      <button class="lock-button" id="lock-button" type="button" disabled><span aria-hidden="true">⌘L</span> Lock all</button>
    </div>
  </header>
  <main id="main" class="workspace" tabindex="-1">
    <aside class="vault-rail" aria-labelledby="vault-heading">
      <div class="section-heading"><div><p class="eyebrow">Local vaults</p><h2 id="vault-heading">Vaults</h2></div><button id="add-vault" class="add-button" type="button"><span aria-hidden="true">＋</span> Add</button></div>
      <ul id="vault-list" class="vault-list"></ul>
      <div class="privacy-note"><span class="contour-dot" aria-hidden="true"></span><p><strong>Session only.</strong> Passwords and notes never enter this index.</p></div>
      <button class="license-row" id="license-button" type="button"><span>License options</span><strong id="license-label">Free · 2 vaults</strong></button>
    </aside>
    <section class="search-panel" aria-labelledby="search-heading">
      <p class="eyebrow">Search index · this device only</p>
      <h1 id="search-heading">Find an entry across unlocked vaults</h1>
      <div class="search-box">
        <span class="search-symbol" aria-hidden="true"></span>
        <label class="sr-only" for="search-input">Search unlocked vaults</label>
        <input id="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Search title, username, URL, or group" disabled />
        <kbd>⌘ K</kbd>
      </div>
      <div id="status" class="status" aria-live="polite"></div>
      <div id="results" class="results"></div>
    </section>
  </main>
  <dialog id="unlock-dialog" aria-labelledby="unlock-title">
    <form id="unlock-form" method="dialog">
      <button class="dialog-close" value="cancel" aria-label="Close unlock dialog" type="submit">×</button>
      <p class="eyebrow">Selected local file</p><h2 id="unlock-title">Unlock vault</h2>
      <p class="dialog-copy" id="vault-path"></p>
      <label for="vault-password">Master password</label><input id="vault-password" name="password" type="password" autocomplete="current-password" required />
      <label for="key-file">Key file <span>(optional)</span></label>
      <div class="key-row"><input id="key-file" name="keyFile" type="text" readonly placeholder="No key file selected" /><button id="choose-key" type="button">Choose…</button></div>
      <p class="form-error" id="unlock-error" role="alert"></p>
      <div class="dialog-actions"><button value="cancel" type="submit" class="quiet-button">Cancel</button><button id="unlock-submit" type="submit" value="default" class="primary-button">Unlock locally</button></div>
    </form>
  </dialog>
  <dialog id="license-dialog" aria-labelledby="license-title">
    <form id="license-form" method="dialog">
      <button class="dialog-close" value="cancel" aria-label="Close license dialog" type="submit">×</button>
      <p class="eyebrow">Unlimited vaults</p><h2 id="license-title">License options</h2>
      <p class="dialog-copy">The free app searches two vaults. The planned unlimited-vault license is $19 once, with no subscription.</p>
      <p class="purchase-unavailable" role="status"><strong>Purchase unavailable.</strong> Checkout registration is pending.</p>
      <div class="rule"><span>Restore an existing license</span></div>
      <label for="license-token">License token</label><input id="license-token" type="text" autocomplete="off" spellcheck="false" />
      <p class="form-error" id="license-error" role="alert"></p>
      <button id="verify-license" type="button" class="primary-button">Verify license</button>
      <p class="legal-small"><a href="https://vault-cross-search.sociobot.in/privacy/">Privacy</a> · <a href="https://vault-cross-search.sociobot.in/terms/">Terms</a></p>
    </form>
  </dialog>
`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const searchInput = $("#search-input") as HTMLInputElement;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
}

function vaultRow(vault: VaultSummary): string {
  return `<li class="vault-item"><span class="vault-glyph" aria-hidden="true">${escapeHtml(vault.name.slice(0, 1).toUpperCase())}</span><span class="vault-copy"><strong>${escapeHtml(vault.name)}</strong><small>${vault.entries.toLocaleString()} entries · Unlocked</small></span><button class="row-menu" data-lock-vault="${escapeHtml(vault.id)}" aria-label="Lock ${escapeHtml(vault.name)}" title="Lock vault">×</button></li>`;
}

function render() {
  $("#vault-list").innerHTML = state.vaults.length ? state.vaults.map(vaultRow).join("") : `<li class="rail-empty"><span class="empty-rings" aria-hidden="true"></span><strong>No vaults in this session</strong><small>Add a .kdbx file to begin.</small></li>`;
  const entryCount = state.vaults.reduce((sum, vault) => sum + vault.entries, 0);
  $("#session-pill").textContent = state.vaults.length ? `${state.vaults.length} vault${state.vaults.length === 1 ? "" : "s"} · ${entryCount.toLocaleString()} entries · locks in ${state.minutesRemaining}m` : "No vaults unlocked";
  ($("#lock-button") as HTMLButtonElement).disabled = !state.vaults.length;
  searchInput.disabled = !state.vaults.length;
  $("#license-label").textContent = licenseState === "licensed" ? "Licensed · unlimited" : licenseState === "checking" ? "Checking…" : "Free · 2 vaults";
  renderResults();
}

function renderResults() {
  const host = $("#results");
  if (!state.vaults.length) {
    $("#status").textContent = "";
    host.innerHTML = `<div class="map-empty"><div class="map-art" aria-hidden="true"><span></span></div><p class="eyebrow">Index clear</p><h2>Your vaults remain separate.</h2><p>Add and unlock local KeePass vaults. Only titles, usernames, URLs, and group paths are indexed for this session.</p><button class="primary-button" data-add-empty type="button">Add your first vault</button><small>Nothing is uploaded. Nothing is written to disk.</small></div>`;
    return;
  }
  if (!query) {
    $("#status").textContent = `${state.vaults.length} unlocked vault${state.vaults.length === 1 ? "" : "s"} ready`;
    host.innerHTML = `<div class="ready-state"><span class="locator" aria-hidden="true"></span><h2>Vaults are ready to search.</h2><p>Start typing to search metadata across all unlocked vaults. Try a site, username, or group.</p><div class="shortcut-grid"><span><kbd>↑</kbd><kbd>↓</kbd> Move</span><span><kbd>Enter</kbd> Open vault</span><span><kbd>Esc</kbd> Clear</span></div></div>`;
    return;
  }
  $("#status").textContent = `${results.length} ${results.length === 1 ? "match" : "matches"} across ${state.vaults.length} vault${state.vaults.length === 1 ? "" : "s"}`;
  if (!results.length) {
    host.innerHTML = `<div class="no-results"><span aria-hidden="true">⌁</span><h2>No matching entry</h2><p>Try fewer terms, a username, or a domain. Secret values are intentionally not searchable.</p></div>`;
    return;
  }
  host.innerHTML = `<ol class="result-list" role="listbox" aria-label="Search results">${results.map((entry, index) => `<li><button class="result-row${index === selected ? " selected" : ""}" role="option" aria-selected="${index === selected}" data-result="${index}"><span class="result-pin" aria-hidden="true"></span><span class="result-main"><strong>${escapeHtml(entry.title || "Untitled entry")}</strong><small>${escapeHtml(entry.username || "No username")} · ${escapeHtml(safeDisplayUrl(entry.url))}</small></span><span class="result-vault"><small>${escapeHtml(entry.group || "Root")}</small><strong>${escapeHtml(entry.vaultName)}</strong></span><span class="result-open" aria-hidden="true">↗</span></button></li>`).join("")}</ol>`;
}

async function refreshState() {
  if (!isTauri) return render();
  state = await invoke<SessionState>("session_state");
  render();
}

async function chooseVault() {
  if (!isTauri) {
    $("#status").textContent = "Install the desktop app to open local vaults.";
    return;
  }
  if (!mayAddVault(state.vaults.length, licenseState)) {
    ($("#license-dialog") as HTMLDialogElement).showModal();
    return;
  }
  const picked = await open({ multiple: false, filters: [{ name: "KeePass vault", extensions: ["kdbx"] }] });
  if (typeof picked !== "string") return;
  pendingPath = picked;
  $("#vault-path").textContent = picked.split(/[\\/]/).pop() ?? picked;
  ($("#vault-password") as HTMLInputElement).value = "";
  ($("#key-file") as HTMLInputElement).value = "";
  $("#unlock-error").textContent = "";
  ($("#unlock-dialog") as HTMLDialogElement).showModal();
  requestAnimationFrame(() => ($("#vault-password") as HTMLInputElement).focus());
}

async function runSearch() {
  query = searchInput.value.trim();
  selected = 0;
  if (!query || !isTauri) {
    results = [];
    renderResults();
    return;
  }
  try {
    results = rankResults(await invoke<SearchResult[]>("search_entries", { query }), query);
  } catch (error) {
    $("#status").textContent = String(error);
    results = [];
  }
  renderResults();
}

async function openResult(index = selected) {
  const result = results[index];
  if (!result) return;
  try {
    await invoke("open_entry", { vaultId: result.vaultId, entryId: result.id });
    $("#status").textContent = `Opened ${result.vaultName}. Entry path: ${result.group} / ${result.title}`;
  } catch (error) { $("#status").textContent = String(error); }
}

async function lockAll() {
  if (isTauri) await invoke("lock_all");
  state = { vaults: [], locked: true, minutesRemaining: 15 };
  results = []; query = ""; searchInput.value = ""; render();
}

async function verifyLicense(token: string, quiet = false) {
  if (!token) return;
  licenseState = "checking"; render();
  try {
    const response = await fetch(`${API_BASE}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    const data = await response.json() as { valid: boolean; reason: string };
    cachedVerdict = { valid: data.valid, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(cachedVerdict));
    if (!data.valid) throw new Error(data.reason === "revoked" ? "This license was revoked." : "That license is not active for this product.");
    localStorage.setItem(LICENSE_KEY, token); licenseState = "licensed";
    ($("#license-dialog") as HTMLDialogElement).close();
  } catch (error) {
    const cachedOfflineLicense = !navigator.onLine && cachedVerdict?.valid === true;
    licenseState = cachedOfflineLicense ? "licensed" : navigator.onLine ? "invalid" : "offline";
    if (!quiet) $("#license-error").textContent = navigator.onLine ? String(error) : "You appear offline. Your cached license will keep working.";
  }
  render();
}

document.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  if (target.closest("#add-vault") || target.closest("[data-add-empty]")) await chooseVault();
  const lock = target.closest<HTMLButtonElement>("[data-lock-vault]");
  if (lock && isTauri) { await invoke("lock_vault", { vaultId: lock.dataset.lockVault }); await refreshState(); }
  const result = target.closest<HTMLButtonElement>("[data-result]");
  if (result) await openResult(Number(result.dataset.result));
});

$("#lock-button").addEventListener("click", lockAll);
$("#license-button").addEventListener("click", () => ($("#license-dialog") as HTMLDialogElement).showModal());
document.querySelectorAll<HTMLAnchorElement>(".legal-small a").forEach((link) => link.addEventListener("click", async (event) => {
  if (!isTauri) return;
  event.preventDefault();
  await openUrl(link.href);
}));
$("#theme-button").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  localStorage.setItem("vcs-theme", dark ? "light" : "dark");
});
$("#choose-key").addEventListener("click", async () => {
  const picked = await open({ multiple: false });
  if (typeof picked === "string") ($("#key-file") as HTMLInputElement).value = picked;
});
$("#unlock-form").addEventListener("submit", async (event) => {
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement;
  if (submitter?.value === "cancel") return;
  event.preventDefault();
  const password = ($("#vault-password") as HTMLInputElement).value;
  const keyFile = ($("#key-file") as HTMLInputElement).value || null;
  const button = $("#unlock-submit") as HTMLButtonElement;
  button.disabled = true; button.textContent = "Reading locally…"; $("#unlock-error").textContent = "";
  try {
    await invoke("unlock_vault", { path: pendingPath, password, keyFile });
    ($("#vault-password") as HTMLInputElement).value = "";
    ($("#unlock-dialog") as HTMLDialogElement).close();
    await refreshState(); searchInput.focus();
  } catch (error) { $("#unlock-error").textContent = String(error); }
  finally { button.disabled = false; button.textContent = "Unlock locally"; }
});
$("#verify-license").addEventListener("click", () => verifyLicense(($("#license-token") as HTMLInputElement).value.trim()));
searchInput.addEventListener("input", runSearch);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchInput.focus(); }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") { event.preventDefault(); lockAll(); }
  if (document.activeElement === searchInput && event.key === "ArrowDown") { event.preventDefault(); selected = Math.min(selected + 1, results.length - 1); renderResults(); }
  if (document.activeElement === searchInput && event.key === "ArrowUp") { event.preventDefault(); selected = Math.max(selected - 1, 0); renderResults(); }
  if (document.activeElement === searchInput && event.key === "Enter") { event.preventDefault(); openResult(); }
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) { query = ""; results = []; searchInput.value = ""; renderResults(); }
});

const savedTheme = localStorage.getItem("vcs-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
const returnedLicense = new URLSearchParams(location.search).get("license");
if (returnedLicense) { localStorage.setItem(LICENSE_KEY, returnedLicense); history.replaceState({}, "", location.pathname); verifyLicense(returnedLicense, true); }
else {
  const token = localStorage.getItem(LICENSE_KEY);
  if (token && needsLicenseRefresh(cachedVerdict)) verifyLicense(token, true);
}
refreshState();
window.setInterval(refreshState, 30_000);
