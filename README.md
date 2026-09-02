# Vault Cross Search

Vault Cross Search is a desktop utility for people who keep credentials in several KeePass vaults (`.kdbx` files). Unlock chosen vaults for one session. Search title, username, URL, and group metadata together. Then open the owning vault in the password app set to handle it. Vaults are never merged or uploaded.

Live download site: <https://vault-cross-search.sociobot.in>

## Try the demo

Open <https://vault-cross-search.sociobot.in/?demo=1> or choose **Try it with sample data** on the first screen. It loads six bundled records across Personal.kdbx, Work.kdbx, and Archive.kdbx; try searching acme, river, or operations.

The installed desktop app also starts with **Load sample project**. It opens a fake bundled vault in a separate session and searches `acme` immediately. Lock the sample before adding your own vault. The sample has no real credentials and does not use a file picker.

The demo stores its sample data separately in this browser. **Reset demo** restores the bundled records. **Start for real** discards the sample and returns to the download page. The demo never opens a local file or calls the desktop app. It contacts only vault-cross-search.sociobot.in.

## What it does

- Reads chosen KDBX 4 vaults on your device, with optional key files.
- Builds an in-memory index of only title, username, URL, and group path.
- Searches every unlocked vault with keyboard navigation (`Ctrl/⌘ K`, arrows, Enter).
- Opens the result's owning vault in the password app set to handle it.
- Clears the metadata index when you lock a vault, lock all, quit, or wait 15 minutes.
- Ships with no telemetry, cloud account, autofill, sync, or desktop clipboard writes. Website buttons copy their displayed command after you press **Copy install command**.

The free plan supports two simultaneous vaults. The planned unlimited-vault license is $19 once, with no subscription. Purchases are not open yet. Existing tokens can still be restored. Safety and accessibility behavior is identical in both plans.

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

After you choose **Download**, the landing page asks GitHub for the latest macOS, Windows, or Linux release. The installers are not signed by a verified publisher. Releases contain `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` bundles plus `SHA256SUMS`.

Release asset names are normalized before upload, so the downloaded names and `SHA256SUMS` agree. After downloading an installer and `SHA256SUMS` into the same directory, verify them with `sha256sum -c SHA256SUMS`.

```sh
# macOS / Linux (downloads and verifies SHA256 first)
curl -fsSL https://vault-cross-search.sociobot.in/install.sh | sh

# Windows PowerShell
irm https://vault-cross-search.sociobot.in/install.ps1 | iex
```

To publish the repaired v0.1.6 release after verification:

```sh
git tag v0.1.6
git push origin main v0.1.6
```

The tag triggers [the release workflow](.github/workflows/release.yml). Platform runners create installers; the publish job generates checksums and `latest.json` before attaching everything to one GitHub Release.

## Security model

The Rust core receives the unlock credential and clears its password buffer immediately after key derivation. The unlocked vault is discarded after metadata extraction. The desktop window receives only the four searchable fields and random local IDs. The search index exists only while the app is open and is never saved.

This initial version is not yet independently audited. It opens the owning vault because KeePassXC cannot select an exact entry through a documented cross-platform interface. The matching title and group remain visible in Vault Cross Search so you can finish navigation without copying secrets.

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
