# Vault Cross Search — repair handoff v0.1.5

**Date:** 2026-09-02 UTC
**Work order:** `vault-cross-search-repair-5`
**Product:** `vault-cross-search` — Tauri 2 desktop app with static download site

## Repair delivered

This repair closes both release blockers in independent verification 6 (`.factory/verification-6.md`) for candidate `223e6864b5bfdef9181c5ba45a8f7abf1ae286c4`.

1. **Truthful clipboard copy.** I first reproduced the contradiction: the live site said “No clipboard writes” while clicking its install control wrote `curl -fsSL https://vault-cross-search.sociobot.in/install.sh | sh`. The landing page, privacy policy, and README now distinguish the desktop guarantee (“never copies secret values”) from the website behavior (“Copy buttons place only the visible public install command on your clipboard”). `@claim:website-install-copy` instruments the clipboard and asserts no write at load plus exactly one, explicitly triggered write of the visible command.
2. **Real first-run desktop sample.** The Tauri binary now compiles in `src-tauri/resources/vault-cross-search-sample.kdbx` (1,073 bytes), a fake two-record KeePass database. The empty Tauri screen has **Load sample project**, an in-app three-step walkthrough, and actual load/search/lock behavior. The core opens the embedded KDBX through the normal metadata-only index, only in an empty session, rejects mixing it with real vaults, and refuses to open its synthetic path in an associated password manager. The browser demo remains a separate browser sandbox and is explicitly not used as this feature’s substitute.

The landing page now has a three-frame walkthrough captured from the fixture-backed Tauri interface, not browser-demo screenshots. `scripts/capture-desktop-walkthrough.mjs` can reproduce the source frames. Asset provenance is recorded in `.factory/design.md`.

## Regression coverage

- `@claim:website-install-copy` — visible public website command only, after explicit Copy.
- `claim_bundled_sample_project_is_a_real_kdbx_in_an_isolated_session` — opens the compiled resource, verifies both fake Acme records, verifies isolation, then clears it.
- `@claim:desktop-sample-project` — production desktop UI flow from first run through prefilled `acme` results and its isolated vault row.
- `vite.config.ts` ignores `src-tauri/target` while serving browser tests. This prevents the OS watcher exhaustion reproduced after a native build, so clean full-suite execution remains reliable.

`.factory/claims.json` now declares 35 claims; every exact command passed after the repair.

## Verification evidence

- `npm ci`: PASS.
- `npm test`: PASS — 9 Vitest tests, 53 Playwright tests with 11 intentional cross-project skips, and 17 Rust tests.
- All 35 commands declared in `.factory/claims.json`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS. Static initial JS is 7.44 kB raw / 2.92 kB gzip; CSS is 17.43 kB raw / 4.15 kB gzip. Desktop UI JS is 15.08 kB raw / 5.41 kB gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- Linux native package: PASS for `src-tauri/target/release/bundle/deb/Vault Cross Search_0.1.5_amd64.deb`; inspected package metadata is `vault-cross-search`, `0.1.5`, `amd64`.
- Local URL verifier: PASS (`.factory/evidence/v0.1.5-local/verify.json`) — title, `lang=en`, one H1, main landmark, image alternatives, labelled controls, and no console errors.
- Playwright Axe coverage in the full suite: zero serious or critical findings at desktop and 390 px mobile. The requested standalone Axe CLI could not locate a system Chrome in this container, so the repository’s pinned Playwright Axe integration was used instead.
- Production deployment verifier: PASS (`.factory/evidence/v0.1.5-live/verify.json`) at `https://vault-cross-search.sociobot.in/`: HTTP 200, 870 ms load, no console errors, title/lang/H1/main/alt/control checks pass. Managed TLS and CSP were confirmed; the live HTML contains both corrected clipboard statements. A live Playwright clipboard probe also asserted zero writes at load and one post-click write exactly equal to `curl -fsSL https://vault-cross-search.sociobot.in/install.sh | sh`.

## Deployment and release

- Repair implementation commit: `022e179ebee6017662cf153edf9e205389ce9d82`.
- Static site deployment: Azure Static Web App `sf-vault-cross-search`, production, completed successfully on 2026-09-02. Live URL: <https://vault-cross-search.sociobot.in>.
- Desktop version: `0.1.5`. The release workflow at `.github/workflows/release.yml` builds macOS arm64/x64, Windows x64, and Linux x64 assets when tag `v0.1.5` is pushed. The local worker created the Debian package. Its local AppImage bundler path failed even after `xdg-utils` installation because `linuxdeploy` would not run in this container; this does not alter the shipped source or the GitHub Linux runner configuration, which supplies the release artifact matrix.

## Operator action

- Apple notarization and Windows Authenticode remain unavailable until the owner supplies `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`. Unsigned-download guidance remains visible on the site.
- Checkout registration is still intentionally unavailable; no buy link is active.

## Known product gaps

None. The local AppImage packaging limitation above is documented for release monitoring; verify the GitHub tag workflow’s AppImage and checksums before distributing the desktop release.
