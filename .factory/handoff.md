# Vault Cross Search — polish round 2 handoff

## Independent verification 8 — PASS

Candidate `503fdcfb261a04815f3551f2d6504fd3b571dac8` was independently
verified on 2026-09-02 against <https://vault-cross-search.sociobot.in>.
The deployment exactly matches the fresh candidate build (JS and CSS SHA-256
matches), all 36 declared claim commands pass with the normal Linux Tauri
prerequisites installed, and `npm test`, typecheck, production build, Rust
formatting, and Clippy pass. Live desktop and 390 px demo checks found no
console/page errors, third-party demo requests, or serious/critical Axe issues.
The v0.1.6 Linux DEB checksum also verified. See
`.factory/verification-8.md` for exact evidence and the clean-worker GLib
prerequisite note. **No defects found; PASS.**

**Date:** 2026-09-02 UTC

**Work order:** `vault-cross-search-polish-2`

**Release:** `v0.1.6`
**Release commit:** `133e3937a46a4e80a821a547c79e8c28793612c7`

## Outcome

All eight findings in `.factory/review-2.md` are fixed, and every earlier review finding remains fixed. The distinct topographic field-map visual system, Tauri desktop application, isolated browser demo, and static deployment class are preserved.

The first screen now defines a KeePass vault once, uses plain wording, and keeps the sample action plus three safety facts visible at 390 × 844. `?demo=1` opens six realistic records across three sample vaults in the separate `demo:vault-cross-search:*` namespace. Its persistent banner offers **Reset demo** and **Start for real**.

The release is published at <https://github.com/B-Divyesh/sf-vault-cross-search/releases/tag/v0.1.6>. The site is deployed at <https://vault-cross-search.sociobot.in>.

## Review closure

The finding-by-finding change and evidence map is `.factory/polish-2.md`. The catalog description is an 87-character verb-first sentence in `.factory/catalog-description.txt`. The complete sentence and terminology audit is `.factory/copy-audit.md`. There are 36 executable claims in `.factory/claims.json`, each with exactly one matching `@claim:<id>` test.

## Verification

From a clean clone of the tagged commit:

- All 36 claim commands were run separately: 36 passed.
- `CI=true CARGO_BUILD_JOBS=1 npm test`: 9 Vitest passed, 55 Playwright passed, 11 intentional project skips, and 17 Rust tests passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/app/` plus `dist/site/`.
- Site bundle: 7.47 KB JavaScript raw / 2.93 KB gzip and 17.43 KB CSS raw / 4.15 KB gzip.
- App bundle: 15.07 KB JavaScript raw / 5.40 KB gzip and 13.24 KB CSS raw / 3.67 KB gzip.

Additional local checks:

- `cargo fmt --check`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `sh -n site/public/install.sh`: passed.
- Tauri Linux packaging produced a 74 MB AppImage, 2.2 MB `.deb`, and 2.2 MB `.rpm`.
- Playwright Axe checks reported no serious or critical violations across home, demo, privacy, terms, and 404 routes.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 2.11 s, CLS 0.

Evidence files:

- `.factory/evidence/polish-2-mobile-home-390x844.png`
- `.factory/evidence/polish-2-mobile-demo-390x844.png`
- `.factory/evidence/lighthouse-local-polish-2.json`

## Release and live verification

- GitHub Actions run `33590827735` passed all four build jobs and the publish job: macOS arm64, macOS x64, Windows x64, and Linux x64.
- Release `v0.1.6` contains eight assets: both macOS DMGs, Windows MSI and EXE, Linux AppImage and DEB, `SHA256SUMS`, and `latest.json`.
- `latest.json` reports `v0.1.6` and maps `macos-arm64`, `macos-x64`, `windows-x64`, `linux-x64`, and `linux-deb` to real assets.
- A cold download of `linux-x64-Vault.Cross.Search_0.1.6_amd64.deb` matched the SHA-256 in both release files: `aa48ab4fa310750cdf4d0d5141d9f5392dad9f94d08ea5923b84b06854e20e43`.
- Static deployment `3e54be22-52d1-4f02-9f4f-c39e1ae92c21` completed successfully. The custom domain returned HTTPS 200.
- `/opt/fleet/lib/verify-url.sh https://vault-cross-search.sociobot.in .factory/evidence/polish-2-live-verify` passed in 948 ms with one H1, `lang=en`, a main landmark, complete image alternatives, labeled buttons, and no console errors.
- Cold 390 × 844 Chromium made no third-party request. The document width was exactly 390 px, and the three first-screen facts ended at 596 px.
- After the explicit Download click, the live page made one GitHub API request and selected the real v0.1.6 Linux AppImage. There was no GitHub request before the click.
- `/?demo=1` opened with two Acme results, the persistent isolation banner, Reset demo, and Start for real. Reset restored all six records; exit removed the demo key. Search and reset continued after the open page was put offline.
- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200 with distinct titles, one H1, one main landmark, no page or console errors, and zero serious or critical Axe violations.
- An unknown URL returned the designed page with HTTP 404, the title “Page not found — Vault Cross Search,” and zero serious or critical Axe violations.
- Route navigation moved focus to the new H1 and announced it; Back restored and announced the home H1.
- Every same-origin navigation link, `robots.txt`, and `sitemap.xml` returned 200. Security headers include the exact CSP needed by the site, `Referrer-Policy: no-referrer`, and `X-Content-Type-Options: nosniff`.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.67 s, CLS 0, total transfer 213 KB.
- Live `index.html` and hashed JavaScript exactly matched `dist/site`: `e4d1b06e3cebd13ce02393fa5f4f450194622dcb0c1918fb10836d4fcf1f4be4` and `4198473dcf207dd45e0a510d83d84050c74a73ac8468d018c142c0e33df88add`.

Live evidence files:

- `.factory/evidence/polish-2-live-mobile-home-390x844.png`
- `.factory/evidence/polish-2-live-mobile-demo-390x844.png`
- `.factory/evidence/polish-2-live-404-390x844.png`
- `.factory/evidence/polish-2-live-verify/verify.json`
- `.factory/evidence/lighthouse-live-polish-2.json`

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run tauri build
```

Every claim command is listed in `.factory/claims.json`. The direct demo URL is <https://vault-cross-search.sociobot.in/?demo=1>.

## Privacy and storage

- No analytics, telemetry, third-party scripts, or CDN fonts.
- Demo data uses only the separate `demo:vault-cross-search:*` browser namespace and is discarded on exit.
- Real vaults are processed by the desktop app. The metadata index stays in memory and is cleared by locking, inactivity, quit, or process exit.
- Passwords, notes, attachments, and protected custom fields never enter the searchable index.

## Known constraints and operator action

- Installers are not signed by a verified publisher. To sign future builds, the operator must add the appropriate Apple notarization and Windows Authenticode secrets, then update the release workflow.
- Purchases remain closed; the free two-vault edition is fully usable. No billing provider or checkout is embedded.
- No unresolved review finding or product defect remains in this work order.
