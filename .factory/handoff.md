# Vault Cross Search — perfection loop 1 handoff

**Date:** 2026-09-01 UTC

**Work order:** `vault-cross-search-polish-1`

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

## Verification

- `npm test`: PASS — 9 Vitest, 50 Playwright passed with 10 intentional project skips, 16 Rust tests.
- `npm run typecheck`: PASS.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- `sh -n site/public/install.sh`: PASS.
- `npm run build`: PASS; outputs `dist/app` and `dist/site`.
- All 32 commands in `.factory/claims.json`: pending clean-clone rerun.
- Playwright axe coverage: zero serious or critical issues on home, both demo entries, Privacy, Terms, and 404 at desktop and mobile sizes.
- Local URL verifier: PASS; title, `lang=en`, one H1, main landmark, image alternatives, button labels, and no console errors.
- Local mobile Lighthouse: performance 97, accessibility 100, best practices 100, SEO 100; LCP 1.98 s, CLS 0.089, TBT 0 ms, transfer 186,589 bytes.
- Built site payload: JS 7,441 bytes raw; CSS 15,975 bytes raw; self-hosted fonts 109,604 bytes; mobile AVIF hero 64,037 bytes.

## Evidence

- `.factory/polish-1.md` maps every review finding to its fix and checks.
- `.factory/evidence/mobile-home-390x844.png`
- `.factory/evidence/mobile-demo-390x844.png`
- `.factory/evidence/desktop-home-1440x900.png`
- `.factory/evidence/verify-local/verify.json`
- `.factory/evidence/lighthouse-local.json`

## Deployment and release

Pending final commit, clean-clone claim run, v0.1.4 GitHub release, production deployment, and cold live verification.

## Operator action

- Register the product-specific Sociobot checkout before enabling a buy link. The product intentionally exposes no purchase link until that registration exists.
- Add Apple and Windows publisher-signing certificates to the release workflow when available. Current installers clearly disclose that publisher signing is not configured.

## Known gaps

None in the shipped feature set. Checkout activation and publisher signing are explicitly unavailable operator-gated capabilities, not active product promises.
