# Vault Cross Search v0.1.0 — handoff

## What was built

- Tauri 2 desktop tray app with a Rust core and compact TypeScript UI.
- Local `.kdbx` unlock with password and optional key file using the `keepass` Rust crate.
- Session-only federated index containing only title, username, URL, and group path. The webview never receives passwords, notes, attachments, custom protected fields, or full vault paths.
- Search ranking, URL redaction to hostname, keyboard flow (`Ctrl/⌘ K`, arrows, Enter, Escape, `Ctrl/⌘ L`), per-vault lock, global lock, tray lock, and 15-minute automatic timeout.
- Result action validates the opaque entry ID and opens the owning vault through the OS-associated password app without touching the clipboard.
- Free tier for two simultaneous vaults and a one-time Sociobot license for unlimited vaults. Includes hosted checkout, daily cached verification, optimistic offline state, returned-token storage, and paste-to-restore.
- Product-specific topographic cartography system with light/dark desktop themes, original generated hero art, app icons, reduced-motion handling, empty/error/offline states, and responsive 390px layouts.
- Static download site in `dist/site`, OS detection, Release `latest.json` resolution, SHA256-verifying shell/PowerShell installers, privacy and terms pages, local fonts, and restrictive caching/security headers.
- GitHub Actions release matrix for macOS arm64/x86_64, Windows x64, and Linux x64, producing DMG, MSI/EXE, AppImage, and DEB assets. The publish job adds `SHA256SUMS` and `latest.json` with `softprops/action-gh-release`.

## How to run

```sh
npm ci
npm run tauri dev
```

Static factory deployment:

```sh
npm run build:site
# output: dist/site/index.html
```

## Verification performed

- `npm test` — PASS
  - Vitest: 4/4 search, ranking, and safe-URL tests.
  - Playwright 1.58.2: 5 pass across desktop and 390px mobile; 1 expected project-specific skip.
  - Axe: no serious/critical issues on landing, privacy, or terms pages in either viewport.
  - Rust: 4/4 session/privacy tests, including an encrypted KDBX 4 save/open/index round trip and proof that password/notes never enter serialized results.
- `npm run typecheck` — PASS.
- `npm run build` — PASS; produces `dist/app` and `dist/site`.
- `cargo check --manifest-path src-tauri/Cargo.toml` — PASS.
- `npm audit` — 0 vulnerabilities.
- App webview smoke test at 1180×760 and 390×844: no console errors and no serious/critical axe findings.
- Release manifest generator was exercised with mock assets for all four required platform keys.
- Installer shell script passes `sh -n`.

Bundle budgets:

- Desktop UI: 13.74 KB JS / 11.84 KB CSS raw (5.05 / 3.40 KB gzip).
- Site: 2.12 KB JS / 7.58 KB CSS raw (1.03 / 2.42 KB gzip).
- Fonts: 108 KB total; mobile AVIF hero: 63 KB; WebP fallback: 85 KB.

Lighthouse 12.8.2 mobile against the production build:

- Performance 99
- Accessibility 100
- Best practices 96
- SEO 92
- LCP 2.0 s, CLS 0, TBT 0 ms

## Known gaps and honest deviations

- KeePassXC does not expose a documented cross-platform API for focusing an exact GUI entry. The app opens the owning `.kdbx` in its associated password manager and keeps the matched title/group visible for the final navigation step. It never falls back to scripting the UI or exposing a secret through `keepassxc-cli`.
- Version 0.1 has not had the independent security review required by the product brief. Do not represent it as audited until that review is complete.
- The billing product/launch price is registered by the factory later; no product ID or price is hardcoded. Checkout therefore shows the authoritative price.

## Needs operator action

1. Push the committed `v0.1.0` tag and wait for `.github/workflows/release.yml`; verify every asset listed in `latest.json` and download one asset against `SHA256SUMS` before public launch.
2. Register `vault-cross-search` with the Sociobot billing engine and set its return URL. Switch to the pilot API only if a staging registration is used.
3. Commission an independent review of KDBX parsing, memory handling, Tauri IPC boundaries, and release provenance.
4. Current installers are intentionally unsigned. For signed releases, provision `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, and `APPLE_SIGNING_IDENTITY` for macOS notarization, plus `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD` for Authenticode, then wire those names into the workflow and Tauri signing configuration. Never commit certificate material.
