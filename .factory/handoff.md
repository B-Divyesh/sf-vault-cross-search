# Vault Cross Search — current handoff: FAIL

## Independent verification 6 — 2026-09-02 UTC

**Candidate:** `223e6864b5bfdef9181c5ba45a8f7abf1ae286c4`

**Live URL:** <https://vault-cross-search.sociobot.in>
**Verdict:** **FAIL — do not release.**

The independent report is [`.factory/verification-6.md`](verification-6.md). All 30 declared claims passed after documented Linux desktop prerequisites were installed; `npm test`, typecheck, format, Clippy, production build, live deployment parity, release checksum, Axe, and Lighthouse checks also passed.

Release-blocking defects remain:

1. The live landing claims **“No clipboard writes”**, but its two install-copy buttons call `navigator.clipboard.writeText`. The existing desktop-only claim does not cover the contradictory website behavior.
2. The Tauri desktop app has no bundled sample vault or first-run **Load sample project** action. The browser-only demo expressly has no desktop bridge and cannot replace the required desktop sample-project flow or walkthrough.

The report contains exact reproductions, evidence, remediation, and the rate-limit scope note. This section supersedes the historical builder handoff below.

---

# Vault Cross Search — historical builder perfection-loop handoff

**Date:** 2026-09-02 UTC

**Work order:** `vault-cross-search-polish-1-retry1`

**Product:** `vault-cross-search` (`desktop-app`, Tauri 2 + static download site)

## What changed

- Added the isolated one-click `/?demo=1` entry with a persistent banner, reset/exit controls, separate `demo:vault-cross-search:*` storage, and a useful prefilled search.
- Reordered the 390px demo so its search field and two owned results appear before the vault list and within the first viewport.
- Put all three privacy/lock facts before the hero artwork on phones and restored Privacy to mobile navigation.
- Added route metadata checks, H1 focus plus polite announcement after navigation/Back, complete legal navigation, and a plain `Page not found` 404.
- Replaced pricing lore with `Pricing`, `Free`, and `Unlimited vaults` plus literal price copy.
- Removed the dead checkout link and every merchant/refund promise. Purchase is visibly unavailable until checkout registration exists; existing token restore remains available.
- Added demo-native-boundary and installer-signing claims, narrowed unsupported README statements, and updated all claim tests.
- Kept the product-specific topographic palette, typography, contours, locator mark, and generated artwork.
- Bumped the desktop release to v0.1.4 and updated the release checksum fixtures.
- Recovered the controller-reported native linker failure by clearing the Rust target, constraining Cargo to one build job in `.cargo/config.toml`, and completing a fresh native Tauri package build.

## Verification

- `npm test`: PASS — 9 Vitest, 50 Playwright passed with 10 intentional project skips, 16 Rust tests.
- `npm run typecheck`: PASS.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- `sh -n site/public/install.sh`: PASS.
- `npm run build`: PASS; outputs `dist/app` and `dist/site`.
- All 32 exact commands in `.factory/claims.json`: PASS from a clean clone of `c482929`.
- Clean-clone `npm test`: PASS — 9 Vitest, 50 Playwright passed with 10 intentional project skips, 16 Rust tests.
- Playwright axe coverage: zero serious or critical issues on home, both demo entries, Privacy, Terms, and 404 at desktop and mobile sizes.
- Local URL verifier: PASS; title, `lang=en`, one H1, main landmark, image alternatives, button labels, and no console errors.
- Local mobile Lighthouse: performance 97, accessibility 100, best practices 100, SEO 100; LCP 1.98 s, CLS 0.089, TBT 0 ms, transfer 186,589 bytes.
- Cold live mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.66 s, CLS 0, TBT 0 ms, transfer 185,157 bytes.
- Cold live URL verifier: PASS in 937 ms with no console errors, `lang=en`, one H1, main landmark, image alternatives, and button labels.
- Cold live 390×844 check: PASS — all three first-screen facts and Privacy visible; demo banner, controls, and both Work.kdbx results visible; Reset demo restored all six samples; Start for real cleared demo storage; navigation and Back focus the H1; no valid-route console errors; no serious/critical axe findings; unknown route returned HTTP 404 with `Page not found`.
- Built site payload: JS 7,441 bytes raw; CSS 15,975 bytes raw; self-hosted fonts 109,604 bytes; mobile AVIF hero 64,037 bytes.
- Retry 1 clean clone at `2c1f525c0dc85ad96150776e4fbb02ec0c1fb6e6`: all 32 exact claim commands passed; full suite passed (9 Vitest, 60 Playwright, 16 Rust), plus typecheck, format, Clippy `-D warnings`, installer shell syntax, and both builds.
- Retry 1 native package recovery: `cargo clean --manifest-path src-tauri/Cargo.toml`, then `CI=true CARGO_BUILD_JOBS=1 npm run tauri build`: PASS. Linux `.deb` and `.rpm` bundles completed after the native linker stage without a bus error.
- Retry 1 cold live verifier: PASS after deployment `518621e1-d44f-44a7-80af-f74540bdaf5a`; no console errors, valid title/lang/main/H1/alt/control checks. A fresh 390×844 browser check passed home facts, Privacy header navigation, isolated demo search plus owned result, Reset demo, navigation/Back heading focus, plain pricing with no checkout promise, and HTTP 404 recovery.

## Evidence

- `.factory/polish-1.md` maps every review finding to its fix and checks.
- `.factory/evidence/mobile-home-390x844.png`
- `.factory/evidence/mobile-demo-390x844.png`
- `.factory/evidence/desktop-home-1440x900.png`
- `.factory/evidence/verify-local/verify.json`
- `.factory/evidence/claims-clean-clone.log`
- `.factory/evidence/full-suite-clean-clone.log`
- `.factory/evidence/live-mobile-home-390x844.png`
- `.factory/evidence/live-mobile-demo-390x844.png`
- `.factory/evidence/live-desktop-home-1440x900.png`
- `.factory/evidence/live-404-390x844.png`
- `.factory/evidence/verify-live/verify.json`
- `.factory/evidence/verify-live-retry1/verify.json`
- `.factory/evidence/lighthouse-live.json`
- `.factory/evidence/lighthouse-local.json`

## Deployment and release

- Product commit: `c4829292c2e51ac344f694d85e82c5f766eb6dab`; pushed to `main`.
- Retry 1 native-build safeguard: `2c1f525c0dc85ad96150776e4fbb02ec0c1fb6e6`; pushed to `main` before deployment.
- Tag and release: [`v0.1.4`](https://github.com/B-Divyesh/sf-vault-cross-search/releases/tag/v0.1.4).
- Release workflow `33571441788`: PASS for macOS arm64, macOS x64, Windows x64, Linux x64, and publish.
- Published assets: both macOS DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`.
- Release verification: `latest.json` names all four platform targets; the downloaded Linux DEB passed its published SHA-256 checksum; a cold live Linux click resolved to the v0.1.4 AppImage with no console errors.
- Static deployment: `cd368634-4854-49f6-80a8-1a5bd1204d6e`.
- Retry 1 static deployment: `518621e1-d44f-44a7-80af-f74540bdaf5a`.
- Live URL: `https://vault-cross-search.sociobot.in` (HTTP 200 over managed TLS).

## Operator action

- Register the product-specific Sociobot checkout before enabling a buy link. The product intentionally exposes no purchase link until that registration exists.
- Add Apple and Windows publisher-signing certificates to the release workflow when available. Current installers clearly disclose that publisher signing is not configured.

## Known gaps

None in the shipped feature set. Checkout activation and publisher signing are explicitly unavailable operator-gated capabilities, not active product promises.
