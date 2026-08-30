# Independent verification 2 — FAIL

**Candidate:** `5d2f60bbaa210467b3e3e0216778912e2e6a97f9`  
**Live URL:** <https://vault-cross-search.sociobot.in>  
**Verified:** 2026-08-30 from a clean checkout

## Decision

**FAIL — do not release this candidate.** The build, declared claim commands, live deployment, and release artifact checks pass. However, the published site and policies contain several user-reliance claims without entries and observable tests in `.factory/claims.json`. The factory claims contract makes an unlisted claim a failing review finding until it is removed or tested.

## First-read test

Opened the live page cold in a fresh browser context. It says: **“Find an entry across separate vaults.”** It identifies the audience as people with several KeePass files and explains that they can find one login without combining vaults. The first action is **“Try it with sample data”** and says that it opens three sample vaults. This passes the plain-words and one-click demo gate.

## Declared claims — PASS

Installed with `npm ci` (0 npm audit vulnerabilities). The initial clean image lacked the normal Linux Tauri development libraries, so the three Rust commands initially stopped at `glib-2.0` discovery. After installing the standard Tauri Linux prerequisites (`libglib2.0-dev`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libxdo-dev`), every command declared in `.factory/claims.json` passed exactly as written:

| Claim | Command | Result |
| --- | --- | --- |
| `demo-search` | `npx playwright test --grep @claim:demo-search` | PASS (2 projects) |
| `demo-isolation` | `npx playwright test --grep @claim:demo-isolation` | PASS (2 projects) |
| `demo-reset` | `npx playwright test --grep @claim:demo-reset` | PASS (2 projects) |
| `demo-privacy` | `npx playwright test --grep @claim:demo-privacy` | PASS (2 projects) |
| `download-on-demand` | `npx playwright test --grep @claim:download-on-demand` | PASS (2 projects) |
| `metadata-only` | `cargo test --manifest-path src-tauri/Cargo.toml claim_metadata_only_index_collects_only_allowed_fields` | PASS |
| `session-lock` | `cargo test --manifest-path src-tauri/Cargo.toml claim_session_lock_clears_every_vault` | PASS |
| `auto-lock` | `cargo test --manifest-path src-tauri/Cargo.toml claim_auto_lock_inactivity_expiry_locks_a_populated_session` | PASS |

## Local checks — PASS

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` components | PASS | Vitest 4/4; Playwright 19 passed, 1 expected mobile-only skip; Rust 6/6 |
| `npm run typecheck` | PASS | `tsc --noEmit` clean |
| `npm run build` | PASS | `dist/app` and `dist/site` produced |
| Production budget | PASS | Site JS 6.24 kB raw / 2.59 kB gzip; site CSS 11.73 kB raw / 3.18 kB gzip |
| KDBX normal/recovery coverage | PASS | Rust tests unlock/index a generated KDBX and reject a wrong password before a valid retry |
| Installer syntax | PASS | `sh -n site/public/install.sh` |

No local native bundle was built: desktop artifacts are intentionally produced only by the GitHub Actions release workflow. A released Linux `.deb` was downloaded and its SHA-256 was verified against `SHA256SUMS`: `60b08fee8cd004df0cf3b42cefe812165f75b05dddbf08784c6df6f94644cb9a`.

## Live deployment — PASS

- The live candidate matches local production output: SHA-256 for both local and live `main-BtJhhsvc.js` is `a88ce6442d7b1c56091364a4e8266bf60ac72725b1d51ab9d5470925c4c9e73a`; for `main-BVzfMf4f.css` it is `b23f13f41d2f9a2e55b5c2a9a853c9274e81882165243991e9407e0d6b5c19a6`.
- `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, `/robots.txt`, `/sitemap.xml`, `/install.sh`, and `/install.ps1` return 200. A nonexistent route returns the designed page with HTTP 404.
- Desktop (1440px) and mobile (390px) had no horizontal overflow. Keyboard `Ctrl+K` focused the demo search; visible focus styling was present. Reduced-motion media preference was honored.
- Axe found zero serious or critical issues on `/`, `/demo/`, `/privacy/`, and `/terms/` in both viewports. There were no browser console errors or page errors.
- The complete live demo flow (load, search `acme`, reset) requested only the product origin: document, local fonts, CSS, JS, and hero image. No third-party request occurred. The GitHub release API is not requested on a cold home-page load; it is requested only after the explicit download action, as declared.
- Live headers include CSP with `connect-src 'self' https://api.github.com`, HSTS, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `X-Content-Type-Options: nosniff`. HTML is short-cached (`max-age=30`); hashed JS is `public, max-age=31536000, immutable`.

## Release-blocking findings

### High — unlisted privacy, storage, and licensing claims

The claims policy requires every visitor-reliance statement on the landing page and README to have a dedicated observable claim test. `.factory/claims.json` covers demo behavior, three index/locking properties, and download timing, but does **not** cover the following published claims:

1. The landing page says the master password is cleared after use, the desktop index exists only in process memory, and that there is no analytics/telemetry, clipboard write, password storage/autofill, or background sync.
2. The privacy policy additionally promises no advertising or crash reporting; no indexing of attachments or custom protected fields; clearing on quit; local license-verdict storage; and no third-party website resources beyond an explicit download request.
3. The terms and pricing copy promise a two-vault free limit, unlimited-vault license behavior, non-paid accessibility/session/privacy behavior, no custody/recovery/synchronization of vault data, and refund/chargeback revocation.
4. The README promises the OS-associated vault opening behavior and that unlock credentials are cleared, the decrypted database is dropped, and only allowed metadata reaches the webview.

These are material security, privacy, payment, and core-job claims. Add one observable sandbox/unit/integration test per claim (or remove/narrow the copy) and list each in `.factory/claims.json`. The existing `metadata-only` test is also incomplete for its own wording: it proves title inclusion and password/note exclusion, but does not assert username, URL, or group-path inclusion.

### Medium — corrupted locally stored license verdict crashes application initialization

With `localStorage['sb_license:vault-cross-search:verdict']` set to malformed JSON before app load, the app emits `Expected property name or '}' in JSON at position 1` from the unconditional `JSON.parse` in `src/main.ts`. The static DOM appears, but initialization stops before listeners and state refresh complete. Treat malformed or stale local browser data as untrusted: parse defensively, discard the invalid value, and continue in the free state. Add a regression test.

## Scope notes

The site is static; it exposes no product-owned server endpoint, so a rate-limit allowance/429 test is not applicable. The optional billing endpoint is at `api.sociobot.in`, which this work order expressly forbids connecting to; it was not probed. No sign-in flow exists. No forbidden service, setting, database, or secret was read or changed.

## Required remediation before re-verification

1. Bring every security, privacy, storage, license-limit, payment/revocation, and core-opening promise into `.factory/claims.json` with one observable test each; strengthen `metadata-only` to assert all four allowed fields.
2. Recover safely from malformed locally stored license verdicts and add a regression test.
3. Re-run all claim commands, `npm test`, typecheck, build, and live QA after the claim/copy changes.
