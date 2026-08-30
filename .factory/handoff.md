# Vault Cross Search — repair handoff

Status: repaired, released, and verified

- Work order: `vault-cross-search-repair-2`
- Verification report commit: `8afad340742bb0da1a1cff86f93a9764ea821214`
- Repaired candidate: `ddfd6122fc02efcdd50183fcdd418816e1ace380`
- Release: `v0.1.1`
- Live site: <https://vault-cross-search.sociobot.in>

## What changed

- Replaced unconditional license-verdict parsing with validated, defensive cache loading. Malformed or structurally invalid values are removed and startup continues in the free state.
- Kept a previously valid cached license active when the daily verification request cannot run offline.
- Added explicit Rust boundaries for password-buffer clearing, database-to-metadata extraction, per-vault clearing, exit clearing, and associated-app opening.
- Strengthened metadata coverage to assert title, username, URL, and group path inclusion and password, note, attachment, and custom protected-field exclusion.
- Expanded `.factory/claims.json` from 8 to 25 independently runnable claims covering every security, privacy, storage, opening, free-limit, paid-limit, revocation, and website-resource finding in the verifier report.
- Added browser regressions for malformed cache startup, valid verdict storage, revoked licenses, offline cached licenses, free/licensed accessibility parity, desktop request privacy, and site resource privacy.
- Added 1440 × 900 desktop and 390 × 844 mobile browser projects. Updated the complete landing-page copy audit.
- Bumped the desktop release to 0.1.1. The application remains Tauri 2 and the deployment remains static.

## Local verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run typecheck
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build
sh -n site/public/install.sh
```

Results on 2026-08-30 UTC:

- `npm ci`: pass; 0 vulnerabilities.
- `npm test`: pass; Vitest 9/9, Playwright 33 passed with one intentional mobile-only skip, Rust 15/15.
- Every command in `.factory/claims.json`: pass verbatim. The offline-license claim was rerun after its final change.
- TypeScript typecheck: pass.
- Rust format and strict Clippy: pass with `-D warnings`.
- Production build: pass; `dist/app` and `dist/site` produced.
- App JS: 14.07 kB raw / 5.18 kB gzip. App CSS: 11.84 kB raw / 3.40 kB gzip.
- Site JS: 6.24 kB raw / 2.59 kB gzip. Site CSS: 11.73 kB raw / 3.18 kB gzip.
- Installer shell syntax: pass.
- Worker `verify-url.sh`: pass locally and live; live load 658 ms, no console errors, one H1, `lang=en`, main landmark, no missing alt text, no unlabeled buttons.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 2.0 s, CLS 0, TBT 0 ms.

Native bundles were built only by GitHub Actions, as required for desktop products.

## Release and package evidence

- GitHub Actions run [33299972534](https://github.com/B-Divyesh/sf-vault-cross-search/actions/runs/33299972534): success.
- Release v0.1.1 contains macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`.
- `latest.json` reports `v0.1.1`.
- Downloaded Linux DEB: `linux-x64-Vault.Cross.Search_0.1.1_amd64.deb`.
- Verified SHA-256: `d7073eaea2c763e76ac517a7dbcd1fedfc0213dcf24be331663c0cf2a59fe41a`.
- The Linux platform download resolves to the v0.1.1 AppImage and returns HTTP 200.

## Live deployment evidence

Main was pushed using the work order's static deployment configuration. Verification at 2026-08-30 07:54 UTC:

- `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, `/robots.txt`, `/sitemap.xml`, `/install.sh`, and `/install.ps1`: HTTP 200.
- A nonexistent route: HTTP 404 with the designed page.
- Live JS and CSS hashes match the local production build:
  - JS: `a88ce6442d7b1c56091364a4e8266bf60ac72725b1d51ab9d5470925c4c9e73a`
  - CSS: `b23f13f41d2f9a2e55b5c2a9a853c9274e81882165243991e9407e0d6b5c19a6`
- HTML is short-cached. Hashed JS and generated art use `public, max-age=31536000, immutable`.
- CSP, HSTS, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `X-Content-Type-Options: nosniff` are present.
- Axe found zero serious or critical issues on home, demo, privacy, and terms at 1440 px and 390 px.
- Both viewports had no horizontal overflow, no console/page errors, working Ctrl+K focus, and reduced-motion behavior.
- The live demo load/search/reset flow made only same-origin requests.

## Known gaps and operator action

- macOS and Windows bundles are unsigned. Signing requires operator-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
- There is intentionally no auto-updater; releases and the download page provide updates.
- Billing verification was tested with intercepted fixture responses. The live billing endpoint was not probed because the work order forbids connecting to non-product resources.
- No release-blocking product gap remains.

No prohibited service, app setting, secret, database, or non-`sf-vault-cross-search` resource was read or changed.
