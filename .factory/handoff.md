# Vault Cross Search — verification 5 handoff

**Status: PASS — independently verified and accepted.**

- Verified candidate: `fe8ee6aee897628c073cc1ec37c3cd5292d3e83f`
- Live URL: <https://vault-cross-search.sociobot.in>
- Release: [`v0.1.3`](https://github.com/B-Divyesh/sf-vault-cross-search/releases/tag/v0.1.3)
- Full evidence: [`.factory/verification-5.md`](verification-5.md)

Confirmed and checked that the live files match the candidate production build, all 30 declared claim commands pass, the complete test/build/type/format/lint gates pass, and the desktop release plus checksum manifest work.

## How to verify

```sh
npm ci
npm test
npm run typecheck
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build
```

Open <https://vault-cross-search.sociobot.in/demo/> or choose **Try it with sample data**. Search `acme`, `river`, or `operations`; **Reset demo** restores the six bundled records and **Start for real** removes demo storage.

## Results

- Confirmed and checked that `npm test` passes: Vitest 9/9, Playwright 43 passed with 7 explicit project skips, and Rust 16/16.
- Confirmed and checked that all 30 `.factory/claims.json` commands pass independently.
- Confirmed and checked that the live site has no console/page errors, no non-site requests during the complete demo flow, zero Axe serious/critical findings, no 390px overflow, and visible keyboard focus.
- Confirmed and checked that mobile Lighthouse reports performance 99, accessibility 100, best practices 100, and SEO 100.
- Confirmed and checked that the released Linux DEB verifies against `SHA256SUMS` and opens for the desktop smoke interval.

## Known gaps and operator action

No release-blocking gaps were found. v0.1.3 installers are intentionally unsigned. If signed installers are required later, provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` through the factory secret process and add the corresponding release workflow steps.

The product has no product-owned server endpoint, sign-in flow, PWA service worker, or backend health endpoint. The external Sociobot billing endpoint remains outside this work order scope, so no request allowance check applies.

## Earlier repair record

# Vault Cross Search — repair 4 handoff

**Status: PASS — repaired, released, and deployed.**

- Work order: `vault-cross-search-repair-4`
- Base candidate: `62074c03b0a2652d4d646856eafc477e5d8e61d4`
- Repair commit: `ae04ea5c2296a92f1afb640b2f431adf31a0caae`
- Release: [`v0.1.3`](https://github.com/B-Divyesh/sf-vault-cross-search/releases/tag/v0.1.3)
- Release workflow: [run 33560337316](https://github.com/B-Divyesh/sf-vault-cross-search/actions/runs/33560337316), all macOS arm64/x64, Windows x64, Linux x64, and publish jobs passed
- Live URL: <https://vault-cross-search.sociobot.in>
- Static deployment: production deploy to `sf-vault-cross-search` completed at 2026-09-01 21:19 UTC.

## Repaired release blockers

1. Added the declared `desktop-multi-vault-search` claim. Its desktop-webview regression seeds Work.kdbx and Personal.kdbx, searches `acme`, verifies both owners, selects Personal with ArrowDown, and verifies Enter sends `{ vaultId: "personal", entryId: "billing" }` to the production open command.
2. Normalized release asset names before generating `SHA256SUMS` and `latest.json`. The release manifest now rejects a name containing spaces. The release-shape test starts from six original space-containing filenames, normalizes them, and requires `sha256sum -c SHA256SUMS` to pass.
3. At 840px and below, the demo vault rail moves above results before text gets squeezed. Result metadata now wraps at safe boundaries instead of using ellipses. Regression coverage asserts no clipping or horizontal overflow at 720px and at the 195px 200%-zoom proxy.

## Verification

Performed after `npm ci` and the Linux Tauri prerequisites from the release workflow:

```sh
npm test
npm run typecheck
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
sh -n site/public/install.sh
npm run build
```

Results:

- `npm test`: Vitest 9/9; Playwright 43 passed with 7 intentional project skips; Rust 16/16.
- All 30 exact commands in `.factory/claims.json` passed independently.
- The production build emits `dist/app` and `dist/site`; desktop UI is 14.04 kB JS / 5.16 kB gzip and 11.99 kB CSS / 3.43 kB gzip; site JS is 6.37 kB / 2.66 kB gzip and CSS 13.53 kB / 3.45 kB gzip.
- Playwright axe integration passed with no serious or critical findings on public routes in both projects. The standalone axe CLI could not find a system Chrome in this container; the repository’s Playwright Chromium/axe check is the recorded accessibility gate.
- `/opt/fleet/lib/verify-url.sh` passed against the live domain: HTTP 200, correct title/lang/H1/main/image alternatives, and no console or page errors.
- Live mobile checks at 390px passed for home, demo, privacy, terms, and 404: one H1/main each and no horizontal overflow. Live demo keyboard `Ctrl+K` focused search.
- Live regression checks: at 720px and 195px, `body.scrollWidth === viewport width`, zero metadata nodes clipped, and zero browser console errors.

## Published installer evidence

Release v0.1.3 contains the exact dotted upload names in `SHA256SUMS`:

- `linux-x64-Vault.Cross.Search_0.1.3_amd64.AppImage`
- `linux-x64-Vault.Cross.Search_0.1.3_amd64.deb`
- `macos-arm64-Vault.Cross.Search_0.1.3_aarch64.dmg`
- `macos-x64-Vault.Cross.Search_0.1.3_x64.dmg`
- `windows-x64-Vault.Cross.Search_0.1.3_x64-setup.exe`
- `windows-x64-Vault.Cross.Search_0.1.3_x64_en-US.msi`

Downloaded all six files plus `SHA256SUMS` into one directory and ran `sha256sum -c SHA256SUMS`; all six lines returned `OK`. `latest.json` is valid for `v0.1.3` and references the released platform download names. The released DEB reports package `vault-cross-search`, version `0.1.3`, architecture `amd64`.

The shipped `install.sh` was run against the real release with an isolated temporary `HOME`; it printed `Installed verified AppImage`. The released DEB was extracted and opened under `xvfb-run`; it remained alive through the expected 8-second smoke timeout. The only output was expected virtual-display/session-bus warnings.

## Known gaps and operator action

No release-blocking gaps remain. v0.1.3 installers are intentionally unsigned, as stated on the landing page. No signing secrets are currently expected by the workflow. If signed releases are later required, add workflow support and provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` through the factory secret process.

## Scope

Only this repository, the `sf-vault-cross-search` Static Web App, its GitHub release, and `vault-cross-search.sociobot.in` were changed or read. No other product resources, services, settings, secrets, databases, staging slots, DNS, or billing resources were accessed.
