# Polish round 2 — finding closure

**Date:** 2026-09-02 UTC

**Source report:** `.factory/review-2.md` at `9378af930282669ebef289a985c4b3d701050edd`

**Release:** `v0.1.6`

All eight review-2 findings are closed. Earlier review and polish reports were also reread; their fixes remain covered by the full suite.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | README now says the landing page asks GitHub after Download is chosen. The claim now verifies no cold request and the exact macOS, Windows, and Linux asset selected from the GitHub API response. | `@claim:download-on-demand`; clean-clone Playwright pass; `https://vault-cross-search.sociobot.in/` |
| F-2-2 | Replaced signing jargon and untested OS-warning predictions with “The installers are not signed by a verified publisher.” The same wording appears on the landing page, README, and both install scripts. | `@claim:installer-signing-status`; clean-clone installer test pass; `https://vault-cross-search.sociobot.in/#install` |
| F-2-3 | Kept the useful artwork disclosure and registered it. The claim verifies the original source, prompt/model sidecar, design provenance, responsive AVIF/WebP derivatives, dimensions, and rendered image. | `@claim:original-artwork`; `.factory/design.md`; `assets/src/topographic-vaults.png.json`; `https://vault-cross-search.sociobot.in/` |
| F-2-4 | Split the 24-word README demo sentence into two short instructions. | `.factory/copy-audit.md`; README copy scan; clean-clone test suite |
| F-2-5 | Both buttons now say “Copy install command”; success and fallback feedback name the command too. | `@claim:website-install-copy`; clean-clone Playwright pass; `https://vault-cross-search.sociobot.in/#install` |
| F-2-6 | Replaced “process memory” and “associated app” with user-facing descriptions, and removed checkout-registration copy. | `@claim:memory-only-index`, `@claim:associated-open`, `@claim:one-time-pricing`; copy audit; `https://vault-cross-search.sociobot.in/` |
| F-2-7 | Rewrote README prose to remove “local-first,” “browser key,” “desktop bridge,” “product origin,” “webview,” “opaque local identifiers,” and “application-storage path.” | `.factory/copy-audit.md`; banned-word and terminology scan; README review |
| F-2-8 | Defines “KeePass vault (.kdbx file)” once, then uses “vault.” “KDBX 4” remains only as a compatibility specification; “Load sample project” remains only as the exact control label. The bundled filename and screenshots now say “Sample vault.kdbx.” | `.factory/copy-audit.md`; `@claim:bundled-sample-vault`; `@claim:desktop-sample-project`; `.factory/evidence/polish-2-mobile-demo-390x844.png` |

## Local evidence

- `.factory/evidence/polish-2-mobile-home-390x844.png` — cold first screen at 390 × 844.
- `.factory/evidence/polish-2-mobile-demo-390x844.png` — direct isolated demo with visible banner, results, reset, and exit.
- `.factory/evidence/lighthouse-local-polish-2.json` — 99 performance, 100 accessibility, 100 best practices, 100 SEO; 2.11 s LCP and 0 CLS.
- Every one of the 36 commands in `.factory/claims.json` passed independently from a clean clone.
- The tagged commit passed `npm test`: 9 Vitest, 55 Playwright, and 17 Rust tests; 11 Playwright cases were intentionally skipped outside their configured project.
- `npm run typecheck`, `npm run build`, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, and shell syntax checks passed.
- Native Linux packaging produced `.AppImage`, `.deb`, and `.rpm` bundles. GitHub Actions built the release matrix for macOS arm64/x64, Windows x64, and Linux x64.

## Live evidence

- `https://vault-cross-search.sociobot.in/` cold at 390 × 844: no third-party requests or console errors, width 390 px, first-screen facts visible, and the generated artwork disclosure present.
- The explicit Download action made one GitHub API request and chose `v0.1.6/linux-x64-Vault.Cross.Search_0.1.6_amd64.AppImage`; it made no GitHub request before the click.
- `https://vault-cross-search.sociobot.in/?demo=1`: banner, two initial Acme results, Reset demo, Start for real, storage removal, and offline in-page search/reset all passed.
- `/`, `/demo/`, `/privacy/`, and `/terms/`: HTTP 200, distinct correct title, one H1, one main landmark, no page or console errors, and zero serious or critical Axe violations.
- Unknown route: designed HTTP 404, correct title and return links, and zero serious or critical Axe violations.
- `/opt/fleet/lib/verify-url.sh`: pass in 948 ms; report at `.factory/evidence/polish-2-live-verify/verify.json`.
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; 1.67 s LCP and 0 CLS.
- Live screenshots: `.factory/evidence/polish-2-live-mobile-home-390x844.png`, `.factory/evidence/polish-2-live-mobile-demo-390x844.png`, and `.factory/evidence/polish-2-live-404-390x844.png`.
- Release `v0.1.6`: all four platform jobs plus publish passed. The downloaded Linux DEB matched `latest.json` and `SHA256SUMS` at `aa48ab4fa310750cdf4d0d5141d9f5392dad9f94d08ea5923b84b06854e20e43`.
