# Independent verification 5 — PASS

**Candidate:** `fe8ee6aee897628c073cc1ec37c3cd5292d3e83f`  
**Live URL:** <https://vault-cross-search.sociobot.in>  
**Verified:** 2026-09-01 UTC from a clean checkout

## Decision

**PASS — accept this candidate.** Confirmed and checked that the public site is the candidate build, the sample flow works without storing real-vault data, the desktop-core behaviors covered by the contract pass, and the published installers and release manifests are usable.

## First read and demo

Confirmed and checked that a cold 1440 × 900 visit plainly says **“Find an entry across separate vaults,”** identifies people with several KeePass files, and offers **“Try it with sample data”** with **“Opens three sample vaults.”** This satisfies the first-read and one-click demo requirements.

Confirmed and checked that one click opens `/demo/`, immediately shows six realistic records in Personal.kdbx, Work.kdbx, and Archive.kdbx, and keeps the persistent **Demo — sample data, nothing is saved to your real vaults** banner with **Reset demo** and **Start for real** controls.

Independent live-flow results:

- Confirmed and checked that `acme` returns Acme VPN and Acme status in Work.kdbx.
- Confirmed and checked that an unmatched value shows the calm **No sample match** recovery state.
- Confirmed and checked that Reset demo restores six records and clears the query.
- Confirmed and checked that Start for real returns home and removes `demo:vault-cross-search:sample-v1`.
- Confirmed and checked that Ctrl+K focuses the demo search field.

## Claims gate

`.factory/claims.json` is present and contains **30** declared claims. After `npm ci` and the documented Linux Tauri prerequisites, every listed command was run independently through its stated demo or fixture entry point: **30/30 passed**.

This includes the demo/search/isolation/privacy checks; KDBX 4 unlock and optional-key-file recovery; metadata-only indexing; credential and session clearing; per-vault, all-vault, quit, and inactivity locking; associated-app opening; desktop keyboard and multi-vault search; license states and one-time pricing; and release checksum/installer boundaries.

The three desktop-webview claim commands each reported one applicable desktop fixture pass and one mobile-project skip. The skips are explicitly project-scoped in the test source; the applicable desktop coverage ran and passed.

## Clean checkout and build gates

| Check | Result |
| --- | --- |
| Candidate identity and worktree | PASS; clean checkout at `fe8ee6aee897628c073cc1ec37c3cd5292d3e83f` |
| `npm ci` | PASS; 65 packages, 0 package audit findings |
| 30 exact claim commands | PASS |
| `npm test` | PASS; Vitest 9/9, Playwright 43 passed with 7 explicit project skips, Rust 16/16 |
| `npm run typecheck` | PASS |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |
| `sh -n site/public/install.sh` | PASS |
| `npm run build` | PASS; produced `dist/app` and `dist/site` |

Confirmed and checked that the built payload is within the static-product budgets: site JavaScript is 6.37 kB raw / 2.66 kB gzip, site CSS is 13.53 kB raw / 3.45 kB gzip, desktop UI JavaScript is 14.04 kB raw / 5.16 kB gzip, and self-hosted fonts total 109.6 kB.

## Live behavior, accessibility, and performance

Confirmed and checked that the live home, demo, privacy, terms, and 404 routes return expected content. The unknown-route response is HTTP 404 with the designed recovery page. Confirmed and checked that the live response headers include CSP, HSTS, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `X-Content-Type-Options: nosniff`; HTML has a short revalidation cache lifetime and hashed JS/CSS/artwork use `max-age=31536000, immutable`.

Confirmed and checked that a live 390 × 844 mobile visit has no horizontal overflow. Keyboard-only traversal begins with a visible Skip to content link, never reaches hidden controls, and shows a `3px` signal-colored outline. All visible interactive controls measured at least 44 CSS pixels in both dimensions. The 720px and 195px 200%-zoom proxy checks both had equal body and viewport widths and zero clipped demo-result fields.

Confirmed and checked that the site honors `prefers-reduced-motion: reduce`. Axe on the live home reported zero violations, including zero serious or critical violations. `/opt/fleet/lib/verify-url.sh` passed with HTTP 200, title, `lang=en`, one H1, a main landmark, complete image alternatives, labeled controls, and no console or page errors.

Fresh mobile Lighthouse results for the live home: performance **99**, accessibility **100**, best practices **100**, SEO **100**; LCP **1.7 s**, CLS **0**, total blocking time **130 ms**, and transfer size **179 KiB**.

## Privacy and deployment identity

Confirmed and checked that a fresh live cold load requested only the product origin: HTML, self-hosted fonts, hashed CSS/JS, and product artwork. Confirmed and checked that the complete home → demo → search → reset → Start for real flow made no non-site request and produced no console or page errors. The download claim test also confirms and checks that GitHub is contacted only after the explicit download action.

Confirmed and checked that fresh production output is byte-identical to the live deployment:

| File | SHA-256 |
| --- | --- |
| `index.html` | `b7e470f2fc0fbce6ec137945508a56a1b6eda4ce3ad97df2986b6d3e9dd3d022` |
| `assets/main-CAtC4V80.js` | `c99ae6191b0db8e6579933994ecb3f120ee5221147fee578112c23e37404ae64` |
| `assets/main-DVL40K4V.css` | `985e66497706644b4d00db26d75f8d472458f8e1e1624d16e6d4f76a41929aa6` |

## Desktop release and installer check

Confirmed and checked that public release `v0.1.3` provides macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `latest.json`, and `SHA256SUMS`. Confirmed and checked that the downloaded Linux DEB (`vault-cross-search` 0.1.3, amd64) returns `OK` from `sha256sum -c SHA256SUMS --ignore-missing`. Confirmed and checked that `latest.json` names macOS arm64/x64, Windows x64, Linux x64, and Linux DEB choices.

Confirmed and checked that the extracted DEB opens under a virtual display and remains running for the eight-second smoke interval. The expected timeout ended the test process; output contained only virtual-display and missing-session-bus notices.

The application source at this candidate is unchanged from tag `v0.1.3`; the candidate differs from that tag only in `.factory/handoff.md`.

## Applicability and defects

Confirmed and checked that this is a local desktop application with a static download site. It has no product-owned server endpoint, account sign-in, PWA service worker, backend health endpoint, or local persistence service. The external Sociobot billing endpoint is outside this work order's permitted resource scope and was not contacted; therefore a product request allowance and 429/`Retry-After` observation are not applicable here.

**Release-blocking defects:** none found.  
**Known non-blocking note:** v0.1.3 installers are unsigned, as disclosed on the landing page and in the existing handoff. Signing would require operator-provided platform certificates.

## Scope

Confirmed and checked only this repository, its public GitHub release, and `https://vault-cross-search.sociobot.in`. No other product, service setting, secret, database, staging slot, DNS record, or billing resource was read or changed.
