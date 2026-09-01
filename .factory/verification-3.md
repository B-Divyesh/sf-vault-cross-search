# Independent verification 3 — FAIL

**Candidate:** `5038b8a375e1a25a0ba31ede89d1c5c53510a300`  
**Live URL:** <https://vault-cross-search.sociobot.in>  
**Verified:** 2026-09-01 UTC from the clean candidate checkout

## Decision

**FAIL — do not accept this candidate.** The core implementation, all 25 declared claim commands, full suite, production build, deployed parity, privacy checks, performance budgets, and release packages pass. The acceptance contract still fails because material public promises are absent from `.factory/claims.json`, the demo search has no visible keyboard focus, and required mobile touch targets and route skip links are missing.

No product code was changed.

## First-read and demo gate — PASS

A fresh live-page visit says what the product does — **“Find an entry across separate vaults”** — names people with several KeePass files, and presents **“Try it with sample data”** with **“Opens three sample vaults.”** Pressing Enter on that action opens `/demo/` in one action and immediately shows six records across Personal.kdbx, Work.kdbx, and Archive.kdbx. This passes at 1440 × 900 and 390 × 844.

## Claims gate — 25/25 PASS after documented install

`.factory/claims.json` exists. Every `test` value was run independently and verbatim after `npm ci` and the documented Tauri Linux prerequisites. All passed:

- Demo: `demo-search`, `demo-isolation`, `demo-reset`, `demo-privacy`.
- Site: `download-on-demand`, `site-resource-privacy`.
- Core: `metadata-only`, `kdbx-unlock`, `credential-clear`, `database-drop`, `memory-only-index`, `session-lock`, `single-vault-lock`, `auto-lock`, `quit-lock`, `associated-open`, `no-secret-actions`, `no-custody-sync`.
- Desktop/license: `desktop-no-observation`, `free-vault-limit`, `licensed-vault-limit`, `license-scope`, `license-verdict-storage`, `license-revocation`, `offline-license-cache`.

Browser claim commands passed in both configured projects. On the untouched clone before installation, Node commands could not resolve local Playwright/Vite packages and Rust could not find Linux WebKit/GLib development libraries. These are documented install prerequisites; after installation, no declared claim behavior failed.

## Local gates — PASS

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 65 packages, 0 vulnerabilities |
| `npm test` | PASS; Vitest 9/9, Playwright 33 passed with one intentional project skip, Rust 15/15 |
| `npm run typecheck` | PASS |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |
| `npm run build` | PASS; `dist/app` and `dist/site` produced |
| `sh -n site/public/install.sh` | PASS |

Budgets pass: site JS 6,235 bytes raw / 2,609 gzip; CSS 11,728 / 3,196; fonts 109,604 total; mobile hero AVIF 64,037. App JS is 14.07 kB raw / 5.18 kB gzip and app CSS is 11.84 kB / 3.40 kB.

## End-to-end evidence

The live demo produced six records for an empty query, two Work.kdbx matches for `acme`, three matches for `river`, and two for `operations`. Markup-like input and a 10,000-character query returned zero matches without adding DOM images, errors, or persistent failure; a subsequent valid search recovered. Reset restored six records. Demo mode added only `demo:vault-cross-search:sample-v1`; Start for real removed it and preserved a real-data sentinel.

The Rust integration tests saved and reopened a generated KDBX 4 database, recovered from a wrong password, included the four allowed metadata fields, excluded password/note/attachment/protected-custom fixtures, cleared sessions at all specified boundaries, and recorded the owning vault path sent to the associated opener.

The local webview shell had zero serious/critical axe findings in light and dark modes at both viewports, no overflow or browser errors, and correct dialog focus entry/return. Native bundles were not rebuilt locally because the product contract requires GitHub Actions builds.

## Privacy, requests, and headers — PASS

Cold home and the complete demo flow loaded only same-origin documents, fonts, CSS, JS, and art. There were no cookies, trackers, third-party runtime assets, console errors, or page errors. GitHub was not contacted on cold load; choosing **Download the desktop app** made the expected GitHub release-API request and then navigated to the v0.1.1 AppImage.

Headers include a restrictive CSP, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and restrictive `Permissions-Policy`. HTML uses `max-age=30`; hashed assets/fonts use one-year immutable caching.

This is a static site plus desktop app with no product-owned server endpoint, so a product request allowance and 429/Retry-After result are **not applicable**. The external Sociobot billing endpoint is outside the permitted `sf-vault-cross-search` resource scope and was not contacted. There is no sign-in, PWA service worker, or backend health endpoint.

## Accessibility and performance evidence

- Axe: zero serious/critical findings on home, demo, privacy, and terms at both viewports.
- Worker `verify-url.sh`: PASS; 628 ms, title, `lang=en`, one H1, main, alt text, labeled buttons, no console errors.
- Reduced motion: active; tested animation and transition duration `0s`.
- No horizontal overflow at 390 px.
- Lighthouse mobile rerun: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1,664 ms, CLS 0, TBT 0. INP was unavailable without field data.

Automated scores do not detect the focus and touch-target defects below.

## Live identity and release — PASS

Checked local/live SHA-256 values match exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `af3deb243d9843d3592c6b09b7ff964cd27051f2c606311883dd38f96d915698` |
| `demo/index.html` | `2630d944ec88198069c494c9c0176c56b54361e61972b3db547bca0dddc9d8cc` |
| `privacy/index.html` | `471530fc40cd3ebcb818e14a3eedd346c1922a2f9bb51875abed73f78ae14cfd` |
| `terms/index.html` | `852913cc2df1bcdb9a4f9357821f54425da350882397c1d1d4eade5706d14fb2` |
| `main-BtJhhsvc.js` | `a88ce6442d7b1c56091364a4e8266bf60ac72725b1d51ab9d5470925c4c9e73a` |
| `main-BVzfMf4f.css` | `b23f13f41d2f9a2e55b5c2a9a853c9274e81882165243991e9407e0d6b5c19a6` |

All expected public routes return 200 and an unknown route returns the designed 404. GitHub Actions run `33299972534` succeeded for macOS arm64/x64, Windows x64, Linux x64, and publish. Release v0.1.1 has DMGs, EXE/MSI, AppImage/DEB, `SHA256SUMS`, and valid `latest.json`. The downloaded Linux DEB's SHA-256 matched both manifests: `d7073eaea2c763e76ac517a7dbcd1fedfc0213dcf24be331663c0cf2a59fe41a`.

## Defects

### High — material public claims are not in the claims manifest

The claims contract requires one manifest entry and tagged observable test for every visitor-reliance statement. Missing coverage includes:

1. README: **“Reads explicitly selected KDBX 4 databases locally, with optional key files.”** The KDBX claim tests password-only unlock; no test supplies a key file or recovers from an invalid key file.
2. README: **“Searches every unlocked vault with keyboard navigation (`Ctrl/⌘ K`, arrows, Enter).”** The existing keyboard test covers only the browser demo, not desktop result movement and opening.
3. Landing/app: **“$19 once,” “one-time purchase,”** and **“No subscription.”** License-state fixtures do not protect the displayed price, checkout target, or one-time terms.
4. Landing/README: **“Checksums are published with every release”** and **“verified one-line installers.”** Current release evidence passes, but there is no claim entry or tagged clean-install/checksum test.

Also, `desktop-no-observation` names normal desktop use and its manifest sandbox explicitly includes opening license controls. The test only loads the webview and toggles the theme; it does not exercise the named license-control or add/unlock/search flow. Under the attached claims contract, these are release-blocking even though all existing commands exit successfully.

### Medium — demo search has no visible keyboard focus

On `/demo/`, `Ctrl+K` focuses the search input, but computed presentation is identical before and after focus: input outline remains `none 0px`; the container remains `2px solid rgb(22, 37, 31)` with the same `rgb(212, 218, 208) 5px 5px 0px` shadow. `.demo-input input { outline: 0 }` has no `:focus-visible` or `:focus-within` replacement.

### Medium — mobile touch targets are below 44 px

At 390 px, examples include the header Demo link at 39 × 23.3 px, Terms at 40 × 23.3 px, Reset demo at 103 × 40 px, Start for real at 109 × 40 px, and the demo input at 292 × 29.9 px. Footer/legal links are commonly 21–30 px high. Undersized targets occur on all five checked public routes.

### Medium — skip navigation and route shell are incomplete

Home and demo have skip links; privacy, terms, and 404 do not. Those routes also omit the required consistent product header/footer. The public footer lacks “Built by Param Factory” and a version/build identifier.

## Required remediation

1. Add tagged claims for key files, desktop keyboard operation, price/one-time terms, and installers/checksums; expand the desktop request-log test to its stated flow.
2. Add and test a visible, contrast-compliant demo input focus treatment.
3. Make every public interactive target at least 44 × 44 CSS px at 390 px.
4. Add skip links and the standard product route shell with build identity.
5. Rebuild, deploy, and repeat claims plus independent live QA.

## Safety scope

Only the `sf-vault-cross-search` repository, its live URL, and its matching GitHub repository/release were read. No other app settings, services, databases, secrets, or resources were accessed or changed.
