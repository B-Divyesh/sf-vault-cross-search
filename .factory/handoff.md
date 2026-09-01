# Vault Cross Search — independent verification 4 handoff

**Status: FAIL — do not release candidate `62074c03b0a2652d4d646856eafc477e5d8e61d4`.**

- Work order: `vault-cross-search-verify-4`
- Candidate: `62074c03b0a2652d4d646856eafc477e5d8e61d4`
- Live URL: <https://vault-cross-search.sociobot.in>
- Full report: [`.factory/verification-4.md`](verification-4.md)
- Product code changes: none

## What was checked

Confirmed the clean candidate identity, ran every `.factory/claims.json` command, installed from `package-lock.json`, and ran the full unit/browser/Rust suite, TypeScript check, Rust formatting, strict Rust lint, installer syntax, and exact production build.

Confirmed the live first-read gate and one-click sample demo. Exercised normal, empty, long, markup-like, reset, storage-isolation, recovery, keyboard, focus, light/dark, reduced-motion, 390-pixel mobile, 720-pixel, and 200%-zoom cases. Checked axe, console/page errors, request logs, response headers, caching, internal routes, bundle budgets, and Lighthouse.

Confirmed the live site matches the candidate's production output byte-for-byte. Confirmed the v0.1.2 GitHub release matrix and downloaded Linux DEB. The DEB starts under a virtual display and its content hash matches both published hash values.

## Passing evidence

- Claims: 29/29 declared commands pass after documented dependencies.
- Full suite: Vitest 9/9; Playwright 40 passed with 6 declared project skips; Rust 16/16.
- TypeScript, Rust formatting, strict Rust lint, shell syntax, and production build pass.
- Production output: `dist/app` and `dist/site`.
- Live matrix: zero serious/critical axe findings, no console/page errors, no 390-pixel overflow, no visible sub-44-pixel controls, and reduced motion respected.
- Complete demo request log: same-origin only. GitHub is contacted only after the explicit download action.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1,686 ms; CLS 0; TBT 0 ms.
- Live parity: home, demo, privacy, terms, 404, JS, and CSS match the candidate build.
- Release DEB: package `vault-cross-search` 0.1.2 amd64; SHA-256 `ced69d6ab4f6339cf7d899f9dcec76e810f04f2b029dbf74529854d586a774c6`.

## Release-blocking defects

1. **High:** The real desktop promise to search every unlocked vault has no declared multi-vault observable test. The three-vault check covers only the browser demo; the desktop fixture has one vault.
2. **High:** Published release filenames use dots where `SHA256SUMS` uses spaces. `sha256sum -c SHA256SUMS` exits 1 because all six listed filenames differ from the downloadable filenames.
3. **Medium:** At 720 CSS pixels, including 200% zoom from a 1440-pixel window, demo result metadata is constrained to 38 pixels and hidden with ellipses. At the 195-pixel zoom proxy, the page also overflows by 16 pixels.

## How to verify after repair

```sh
npm ci
npm test
npm run typecheck
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
sh -n site/public/install.sh
npm run build
```

Then run every command in `.factory/claims.json`, including a new real two-vault desktop search claim. Publish a release whose checksum-file names equal its downloadable asset names, run `sha256sum -c SHA256SUMS` beside those assets, and repeat live QA at 720 pixels and 200% zoom.

## Scope

Checked only the `sf-vault-cross-search` repository, its matching public GitHub release, and its product URL. No other service configuration, secret, database, or deployment resource was read or changed. The external billing endpoint was not contacted.
