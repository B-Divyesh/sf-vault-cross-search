# Vault Cross Search

Vault Cross Search is a local-first desktop utility for people who deliberately keep credentials in several KeePass-compatible (`.kdbx`) databases. Unlock selected vaults for one session, search title/username/URL/group metadata together, then open the owning database in its associated password app. Vaults are never merged or uploaded.

Live download site: <https://vault-cross-search.sociobot.in>

## Try the demo

Open <https://vault-cross-search.sociobot.in/demo/> or choose **Try it with sample data** on the first screen. It loads six bundled records across Personal.kdbx, Work.kdbx, and Archive.kdbx; try searching acme, river, or operations.

The demo uses the separate browser key demo:vault-cross-search:sample-v1. **Reset demo** restores the bundled records. **Start for real** discards the demo key and returns to the download page. The demo never reads a vault file or makes a product API request.

## What it does

- Reads explicitly selected KDBX 4 databases locally, with optional key files.
- Builds an in-memory index of only title, username, URL, and group path.
- Searches every unlocked vault with keyboard navigation (`Ctrl/⌘ K`, arrows, Enter).
- Opens the result's owning database with the operating system's associated app.
- Zeroes the metadata index on per-vault lock, lock-all, quit, or 15 minutes of inactivity.
- Ships with no telemetry, cloud account, autofill, sync, or clipboard writes.

The free edition supports two simultaneous vaults. A one-time license unlocks unlimited vaults through the Sociobot billing API. Safety and accessibility behavior is identical in both editions.

## Develop

Requirements: Node.js 22+, Rust stable, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS.

```sh
npm ci
npm run dev          # webview UI only
npm run tauri dev    # complete desktop app
npm test
npm run build        # dist/app and dist/site
```

The factory static deployment command is exactly `npm run build:site`; its output is `dist/site/`, with `index.html` at that root. Native installers are intentionally built only by GitHub Actions.

## Install and release

The landing page detects macOS, Windows, or Linux and resolves its main button from the release `latest.json` manifest. Releases contain unsigned `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` bundles plus `SHA256SUMS`.

```sh
# macOS / Linux (downloads and verifies SHA256 first)
curl -fsSL https://vault-cross-search.sociobot.in/install.sh | sh

# Windows PowerShell
irm https://vault-cross-search.sociobot.in/install.ps1 | iex
```

To publish the repaired v0.1.1 release after verification:

```sh
git tag v0.1.1
git push origin main v0.1.1
```

The tag triggers [the release workflow](.github/workflows/release.yml). Platform runners create installers; the publish job generates checksums and `latest.json` before attaching everything to one GitHub Release.

## Security model

The Rust core receives the unlock credential and clears its owned password buffer immediately after key derivation. The decrypted database object is dropped after metadata extraction. The webview receives only the allowed metadata fields and opaque local identifiers. Search data is wrapped in zeroizing buffers and never written to application storage or logs.

This initial version is not yet independently audited. It opens the owning database because KeePassXC does not expose a documented cross-platform interface for selecting an exact GUI entry. The matching title and group remain visible in Vault Cross Search so the user can finish navigation without copying secrets.

Please report security issues privately to `security@sociobot.in`.

## Project structure

- `src-tauri/` — Rust core, KDBX parser, session lifecycle, and native bundles.
- `src/` — compact TypeScript desktop interface.
- `site/` — static download, privacy, terms, and verified one-line installers.
- `.factory/design.md` — product-specific visual system and generated-art provenance.
- `.factory/claims.json` — executable, observable product claims.
- `.factory/demo.md` — demo data, storage isolation, and reset behavior.
- `.factory/handoff.md` — verification record and operator actions.

## License

[MIT](LICENSE)
