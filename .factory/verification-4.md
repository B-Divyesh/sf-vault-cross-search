# Independent verification 4 — FAIL

**Candidate:** `62074c03b0a2652d4d646856eafc477e5d8e61d4`  
**Live URL:** <https://vault-cross-search.sociobot.in>  
**Verified:** 2026-09-01 UTC from the clean candidate checkout

## Decision

**FAIL — do not accept this candidate.** The deployment matches the candidate, all 29 declared claim commands pass after the documented installation, the complete suite and production build pass, and the core product behavior is implemented. Acceptance still fails for three independent reasons:

1. The real desktop promise to search every unlocked vault has no declared observable multi-vault test. The only three-vault search claim covers the browser demo; the desktop fixture contains one vault.
2. The published `SHA256SUMS` filenames do not match the GitHub release asset filenames. A standard checksum-file check exits 1 because GitHub replaced spaces with dots during upload.
3. At 720 CSS pixels—the effective layout width for 200% zoom on a 1440-pixel window—the demo gives result titles only 38 pixels and hides usernames/domains with ellipses. At 195 CSS pixels, the proxy for 200% zoom at 390 pixels, the page also overflows horizontally by 16 pixels.

No product code was changed.

## First-read and demo gate — PASS

Confirmed a cold live visit in a fresh 1440 × 900 browser context. The first screen says **“Find an entry across separate vaults,”** identifies people with several KeePass files, and places **“Try it with sample data”** beside the explanation **“Opens three sample vaults.”** The screen also states three short product facts.

Confirmed the sample action opens `/demo/` in one click. The first demo view already contains six realistic records across Personal.kdbx, Work.kdbx, and Archive.kdbx, plus the persistent demo banner, **Reset demo**, and **Start for real**.

## Claims gate

`.factory/claims.json` exists and contains 29 entries. Every listed `test` command was run independently and verbatim after `npm ci` and the documented Tauri Linux prerequisites. Result: **29/29 commands passed**.

The untouched checkout did not yet contain Node packages or Linux WebKit/GLib development libraries, so direct pre-install commands could not start. After the repository's documented installation, no declared command failed.

Confirmed passing coverage for:

- demo search, isolation, reset, and request privacy;
- on-demand GitHub lookup and same-origin site resources;
- metadata-only indexing, KDBX 4 unlock, optional key files, invalid-input recovery, credential clearing, decrypted-database disposal, and memory-only storage;
- lock-all, one-vault lock, 15-minute inactivity lock, quit clearing, and associated-app opening;
- desktop request privacy and keyboard search/open;
- absence of clipboard, autofill, password-persistence, custody, recovery, and sync paths;
- free and licensed vault limits, license scope, local verdict storage, revocation, cached offline verdicts, and exact one-time pricing;
- installer manifest generation and verification-before-install boundaries.

The claims acceptance gate nevertheless fails because the published real-product cross-vault promise is not covered by a real desktop multi-vault test. See the first defect below.

## Clean installation and repository gates — PASS

| Check | Result |
| --- | --- |
| Candidate identity | PASS; clean `main` checkout at `62074c03b0a2652d4d646856eafc477e5d8e61d4` |
| `npm ci` | PASS; 65 packages, 0 reported package findings |
| 29 claim commands | PASS; 29/29 after documented dependencies |
| `npm test` | PASS; Vitest 9/9, Playwright 40 passed with 6 declared project skips, Rust 16/16 |
| `npm run typecheck` | PASS |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | PASS |
| `sh -n site/public/install.sh` | PASS |
| `npm run build` | PASS; produced `dist/app` and `dist/site` |

The production build sizes are within contract:

- desktop UI JS: 14,039 bytes raw / 5.16 kB gzip;
- desktop UI CSS: 11,993 bytes raw / 3.43 kB gzip;
- site JS: 6,366 bytes raw / 2.66 kB gzip;
- site CSS: 12,848 bytes raw / 3.36 kB gzip;
- self-hosted fonts: 109,604 bytes total;
- mobile AVIF hero: 64,037 bytes.

## End-to-end product checks

Confirmed the live demo starts with six records. Normal searches returned two records for `acme`, three for `river`, two for `operations`, and one for `northstar`. Checked a 10,000-character query and markup-like input; both returned a calm zero-result state, added no result images, produced no browser errors, and recovered on the next valid search.

Confirmed **Reset demo** clears the query and restores all six records. During demo mode the only demo key was `demo:vault-cross-search:sample-v1`. **Start for real** removed that key while preserving a separately seeded real-data sentinel.

Confirmed `Ctrl+K` focuses the demo search. Its focus container uses a visible 3-pixel rust outline. Confirmed the local desktop fixture focuses search with `Ctrl/Command+K`, moves result selection with arrows, and opens the selected owning-vault identifier with Enter. Dialog entry and focus return are covered by the passing repository suite.

Confirmed the Rust checks create and reopen KDBX 4 data, include title/username/URL/group metadata, omit the declared secret fields, recover after incorrect credentials or key-file input, and clear sessions at every stated boundary.

Downloaded the v0.1.2 Linux DEB, extracted it to a temporary directory, and started the released GUI under a virtual display. The process remained open until the eight-second QA timeout. The container reported only expected missing desktop-session/graphics warnings. The candidate's desktop source is byte-identical to tag `v0.1.2`; candidate-only differences are site and documentation files.

## Accessibility and responsive checks

Confirmed home, demo, privacy, terms, and 404 in light and dark at 1440 × 900 and 390 × 844. Every checked route had `lang=en`, one H1, one main landmark, the standard header/footer, and a skip link. No checked 390-pixel route overflowed, and no visible link, button, or input measured below 44 × 44 CSS pixels.

Playwright axe reported **zero serious or critical findings** across the 20 route/theme/viewport combinations. The worker URL verifier passed in 715 ms with a title, language, H1, main landmark, image alternatives, labeled buttons, and no console errors. Reduced-motion emulation matched and left no visible element with a non-zero animation or transition duration.

The 720-pixel and 200%-zoom checks found the metadata-loss defect described below. This issue is not reported by axe.

## Privacy, requests, and response headers

Confirmed the complete cold home → demo → search → reset → Start for real flow requested only the product origin. It loaded the page, self-hosted fonts, hashed CSS/JS, and product artwork. There were no third-party runtime requests, cookies, console errors, or page errors in that flow.

Confirmed the live home page does not contact GitHub until **Download the desktop app** is chosen. On Linux, the explicit action received a 200 release-API response and selected `linux-x64-Vault.Cross.Search_0.1.2_amd64.AppImage`. The download was cancelled after the real filename was observed.

Confirmed live responses include CSP, HSTS, `Referrer-Policy: no-referrer`, restrictive `Permissions-Policy`, and `X-Content-Type-Options: nosniff`. HTML uses `public, must-revalidate, max-age=30`. Hashed JS, CSS, and fonts use `public, max-age=31536000, immutable`.

The product has no product-owned server endpoint, account system, PWA service worker, or backend health endpoint. A product request allowance and 429/`Retry-After` result are therefore not applicable. The external Sociobot billing endpoint is outside this work order's permitted resource scope and was not contacted; license behavior used the repository's fixture responses. There is no sign-in flow to check.

## Performance — PASS

The clean mobile Lighthouse rerun reported:

- performance 100;
- accessibility 100;
- best practices 100;
- SEO 100;
- LCP 1,686 ms;
- CLS 0;
- TBT 0 ms;
- total transferred bytes 183,751.

INP is not available from a no-user-input Lighthouse lab run. Search interaction was exercised directly in Playwright without an observed error or stuck state.

## Deployment identity — PASS

Confirmed the live files are byte-for-byte identical to the candidate's fresh production build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `8a0a5cc1de7f43afa49b462b7cb588f9b9b2a1391bd20a6353b67c76d8bf6dc1` |
| `demo/index.html` | `bba458d7d6dee99089fde8568f0599f8738a02db0084436119990f31424befa7` |
| `privacy/index.html` | `bba1c9223802909197f1b35470ff495ad24eb7061c64cb29e58f4fc043e555d7` |
| `terms/index.html` | `bcd4b4c8477c61cfaf8c9426ecab5df6d880ce1ccab5750a8d3ba5e3dd5a3df8` |
| `404.html` | `664974e0b05547f60fa4f8981bc18df11f4318425a6d2a3ba1bed03511435678` |
| `main-BOKXCiNw.js` | `3dde7190bedfeb5d3cea188b784495ca30c2e72a94651add55ddbd470894ad68` |
| `main-hiSGy6Uf.css` | `6fde4cec9b5f88360438159f1441594f50e5fe34cdccbba5d123b5027c0762cc` |

Confirmed `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, `/robots.txt`, `/sitemap.xml`, `/install.sh`, and `/install.ps1` return 200. An unknown route returns the designed 404 with HTTP 404. All discovered same-origin page links return 200.

## Desktop release evidence

Confirmed GitHub Actions release run `33552594183` completed successfully for commit `e7766b4dce200605785492e67b1480771dee6d46`. Release `v0.1.2` publishes macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `latest.json`, and `SHA256SUMS`.

The downloaded DEB reports package `vault-cross-search`, version `0.1.2`, architecture `amd64`. Its SHA-256 is `ced69d6ab4f6339cf7d899f9dcec76e810f04f2b029dbf74529854d586a774c6`, which equals the value in both release manifests. The checksum filename defect still prevents standard file-based verification.

## Defects

### High — the real cross-vault desktop job has no declared observable test

The landing headline, package description, desktop ready state, and README promise search across separate or every unlocked vault. `.factory/claims.json` has `demo-search`, but that claim is explicitly the bundled browser sample. The desktop `desktop-keyboard-search` fixture reports one Work.kdbx vault and returns two Work.kdbx entries. The KDBX Rust check opens one database, and no Rust test invokes `search_entries` with records from two owning vaults.

The production code appears to iterate every in-memory vault, but the claims contract requires the real visitor-reliance statement to have its own observable test. Add a declared desktop claim that seeds or unlocks at least two vaults, searches a term present in both, confirms both owning vaults are returned, and confirms Enter opens the selected result's correct owner.

### High — `SHA256SUMS` names do not match the published release assets

GitHub published names such as `linux-x64-Vault.Cross.Search_0.1.2_amd64.deb`. `SHA256SUMS` lists `linux-x64-Vault Cross Search_0.1.2_amd64.deb`. The same space-versus-dot mismatch affects all six installer lines. With the real dotted DEB beside the published checksum file, `sha256sum -c SHA256SUMS` exits 1 and reports that all listed files could not be read.

The numeric hash is correct, and the one-line installers remain functional because they use `latest.json`. The release contract separately requires `SHA256SUMS` to match. Normalize names before generating checksums, or generate the checksum file with the final uploaded names, then add a release-shape test that includes an original filename containing spaces.

### Medium — result metadata is lost at 720 pixels and 200% zoom

At 720 CSS pixels, the demo keeps its 300-pixel vault rail and desktop result columns. Every result title and username/domain line overflows its 38-pixel text column; the username/domain is replaced by an ellipsis with no visual way to reveal it. This is also the effective layout width for 200% zoom on a 1440-pixel browser window. At the 195-pixel proxy for 200% zoom on a 390-pixel viewport, all six username/domain lines remain clipped and the body is 211 pixels wide against a 195-pixel viewport.

Stack the demo workspace at a wider breakpoint or remove the fixed result column pressure. Preserve complete metadata through wrapping or a visible expansion affordance, and add 720-pixel plus 200%-zoom regression checks.

## Scope and next step

Checked only the `sf-vault-cross-search` repository, its matching public GitHub release, and `https://vault-cross-search.sociobot.in`. No other service configuration, secret, database, or deployment resource was read or changed.

After the three defects are repaired, repeat all 29 existing claims, add and run the real multi-vault claim, publish corrected release manifests, and repeat the 720-pixel/200%-zoom live check.
