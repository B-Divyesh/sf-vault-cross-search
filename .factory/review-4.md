# Adversarial first-read review 4 — Vault Cross Search

**Date:** 2026-09-02 UTC  
**Revision reviewed:** `4d207e44e54e043bd34b650fff8f4e80bbfaa3a6`  
**Live URL:** <https://vault-cross-search.sociobot.in>  
**Verdict: PASS**

Zero findings remain. Every declared claim was tested, every earlier finding was rechecked on the live site and in source, and the required local gates pass.

## Cold first read

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** Finds one entry across separate KeePass vaults without combining them.
- **For whom:** People who keep logins in several KeePass `.kdbx` files.
- **What to click first:** **Try it with sample data**; the adjacent text says **“Opens three sample vaults.”**

Both first viewports state all three answers. At 390 px, the three plain facts—**“Sample data stays separate,” “Passwords are not indexed,”** and **“Desktop app locks after inactivity”**—also appear before the first-screen artwork. The mobile document width is exactly 390 px. Cold loading made only same-origin requests and produced no console or page errors.

## Findings

None.

## Copy audit

Counts are whitespace-delimited after Markdown formatting is removed. Landing UI labels, headings, actions, and meaningful image text are included because they must also meet the plain-words rules. README commands are excluded as code, while its headings and prose are included. No item exceeds 22 words. No banned marketing adjective, unexplained user-facing jargon, inconsistent product term, mood/metaphor heading, empty slogan, or non-result-naming active button remains.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Vault Cross Search | 3 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Local desktop search | 3 | Pass |
| Find an entry across separate vaults | 6 | Pass |
| For people with several KeePass vaults (.kdbx files) who need one login without combining them. | 15 | Pass |
| Try it with sample data | 5 | Pass |
| Opens three sample vaults | 4 | Pass |
| Download the desktop app | 4 | Pass |
| The demo is separate sample data. | 6 | Pass |
| Download checks GitHub only when you choose it. | 8 | Pass |
| Sample data stays separate | 4 | Pass |
| Passwords are not indexed | 4 | Pass |
| Desktop app locks after inactivity | 5 | Pass |
| Three separate topographic islands, each with its own vault, connected only by survey markers | 14 | Pass |
| Three separate vaults. | 3 | Pass |
| One place to find metadata. | 5 | Pass |
| 4 fields | 2 | Pass |
| Title, username, URL, group | 4 | Pass |
| 15 min | 2 | Pass |
| Default automatic lock | 3 | Pass |
| 3 vaults | 2 | Pass |
| Ready in the sample demo | 5 | Pass |
| Search without combining vaults | 4 | Pass |
| Choose local vaults | 3 | Pass |
| Add vaults explicitly. | 3 | Pass |
| Each stays where you put it. | 6 | Pass |
| Unlock for this session | 4 | Pass |
| Your master password goes to the desktop app and is cleared after use. | 13 | Pass |
| Search metadata | 2 | Pass |
| Search titles, usernames, URLs, and group paths. | 7 | Pass |
| Passwords and notes are excluded. | 5 | Pass |
| Open the owning vault | 4 | Pass |
| Open the original vault in the password app set to handle it. | 12 | Pass |
| Metadata stays in the local session. | 6 | Pass |
| The desktop app keeps the search index in memory and never saves it. | 13 | Pass |
| Lock a vault, lock all vaults, quit, or let the timer run out to clear it. | 16 | Pass |
| No analytics or telemetry | 4 | Pass |
| The desktop app never copies secret values | 7 | Pass |
| No password storage or autofill | 5 | Pass |
| No background sync | 3 | Pass |
| Read the privacy policy | 4 | Pass |
| Desktop walkthrough | 2 | Pass |
| Try the installed app with a fake vault | 8 | Pass |
| The first screen loads a bundled fake vault. | 8 | Pass |
| It never opens or writes a real vault. | 8 | Pass |
| Vault Cross Search first-run screen with the Load sample project button | 11 | Pass |
| Load sample project | 3 | Pass |
| Open the bundled fake vault in a separate session. | 9 | Pass |
| Vault Cross Search showing two Acme results in the sample vault | 11 | Pass |
| Search its metadata | 3 | Pass |
| Try acme to see title, username, URL, group, and owner. | 10 | Pass |
| Vault Cross Search sample vault rail and Lock all button | 10 | Pass |
| Lock the sample | 3 | Pass |
| Clear the session before adding your own vault. | 8 | Pass |
| Plans | 1 | Pass |
| Pricing | 1 | Pass |
| Free | 1 | Pass |
| Up to two vaults | 4 | Pass |
| Privacy, keyboard controls, and session locking are included. | 8 | Pass |
| Download free | 2 | Pass |
| Planned license | 2 | Pass |
| Unlimited vaults | 2 | Pass |
| $19 once | 2 | Pass |
| No subscription. | 2 | Pass |
| Purchases are not open yet. | 5 | Pass |
| Purchase unavailable | 2 | Pass — non-interactive status |
| Install | 1 | Pass |
| One-line install | 2 | Pass |
| macOS / Linux | 3 | Pass |
| Copy install command | 3 | Pass |
| Windows PowerShell | 2 | Pass |
| Copy install command buttons copy only the command they display. | 10 | Pass |
| The installers are not signed by a verified publisher. | 9 | Pass |
| Checksums are published with every release. | 6 | Pass |
| Local software for deliberately separate vaults. | 6 | Pass |
| Hero artwork was generated for this product. | 7 | Pass |
| Built by Param Factory · Build v0.1.6 | 7 | Pass |
| GitHub repository (opens in a new tab) | 7 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Vault Cross Search | 3 | Pass |
| Vault Cross Search is a desktop utility for people who keep credentials in several KeePass vaults (.kdbx files). | 18 | Pass |
| Unlock chosen vaults for one session. | 6 | Pass |
| Search title, username, URL, and group metadata together. | 8 | Pass |
| Then open the owning vault in the password app set to handle it. | 13 | Pass |
| Vaults are never merged or uploaded. | 6 | Pass |
| Live download site: https://vault-cross-search.sociobot.in | 4 | Pass |
| Try the demo | 3 | Pass |
| Open https://vault-cross-search.sociobot.in/?demo=1 or choose Try it with sample data on the first screen. | 13 | Pass |
| It loads six bundled records across Personal.kdbx, Work.kdbx, and Archive.kdbx; try searching acme, river, or operations. | 16 | Pass |
| The installed desktop app also starts with Load sample project. | 10 | Pass |
| It opens a fake bundled vault in a separate session and searches acme immediately. | 14 | Pass |
| Lock the sample before adding your own vault. | 8 | Pass |
| The sample has no real credentials and does not use a file picker. | 13 | Pass |
| The demo stores its sample data separately in this browser. | 10 | Pass |
| Reset demo restores the bundled records. | 6 | Pass |
| Start for real discards the sample and returns to the download page. | 12 | Pass |
| The demo never opens a local file or calls the desktop app. | 12 | Pass |
| It contacts only vault-cross-search.sociobot.in. | 4 | Pass |
| What it does | 3 | Pass |
| Reads chosen KDBX 4 vaults on your device, with optional key files. | 12 | Pass — compatibility specification |
| Builds an in-memory index of only title, username, URL, and group path. | 12 | Pass |
| Searches every unlocked vault with keyboard navigation. | 7 | Pass |
| Opens the result's owning vault in the password app set to handle it. | 13 | Pass |
| Clears the metadata index when you lock a vault, lock all, quit, or wait 15 minutes. | 16 | Pass |
| Ships with no telemetry, cloud account, autofill, sync, or desktop clipboard writes. | 12 | Pass |
| Website buttons copy their displayed command after you press Copy install command. | 12 | Pass |
| The free plan supports two simultaneous vaults. | 7 | Pass |
| The planned unlimited-vault license is $19 once, with no subscription. | 10 | Pass |
| Purchases are not open yet. | 5 | Pass |
| Existing tokens can still be restored. | 6 | Pass |
| Safety and accessibility behavior is identical in both plans. | 9 | Pass |
| Develop | 1 | Pass |
| Requirements: Node.js 22+, Rust stable, and the Tauri 2 system dependencies for your OS. | 14 | Pass |
| The factory static deployment command is exactly npm run build:site; its output is dist/site/, with index.html at that root. | 19 | Pass |
| Native installers are intentionally built only by GitHub Actions. | 9 | Pass |
| Install and release | 3 | Pass |
| After you choose Download, the landing page asks GitHub for the latest macOS, Windows, or Linux release. | 17 | Pass |
| The installers are not signed by a verified publisher. | 9 | Pass |
| Releases contain .dmg, .msi/.exe, .AppImage, and .deb bundles plus SHA256SUMS. | 10 | Pass |
| Release asset names are normalized before upload, so the downloaded names and SHA256SUMS agree. | 14 | Pass |
| After downloading an installer and SHA256SUMS into the same directory, verify them with sha256sum -c SHA256SUMS. | 16 | Pass |
| To publish the repaired v0.1.6 release after verification: | 8 | Pass |
| The tag triggers the release workflow. | 6 | Pass |
| Platform runners create installers; the publish job generates checksums and latest.json before attaching everything to one GitHub Release. | 18 | Pass |
| Security model | 2 | Pass |
| The Rust core receives the unlock credential and clears its password buffer immediately after key derivation. | 16 | Pass |
| The unlocked vault is discarded after metadata extraction. | 8 | Pass |
| The desktop window receives only the four searchable fields and random local IDs. | 13 | Pass |
| The search index exists only while the app is open and is never saved. | 14 | Pass |
| This initial version is not yet independently audited. | 8 | Pass — risk disclosure |
| It opens the owning vault because KeePassXC cannot select an exact entry through a documented cross-platform interface. | 17 | Pass |
| The matching title and group remain visible in Vault Cross Search so you can finish navigation without copying secrets. | 19 | Pass |
| Please report security issues privately to security@sociobot.in. | 7 | Pass |
| Project structure | 2 | Pass |
| src-tauri/ — Rust core, KDBX parser, session lifecycle, and native bundles. | 11 | Pass — developer reference |
| src/ — compact TypeScript desktop interface. | 6 | Pass — developer reference |
| site/ — static download, privacy, terms, and verified one-line installers. | 10 | Pass — developer reference |
| .factory/design.md — product-specific visual system and generated-art provenance. | 8 | Pass — developer reference |
| .factory/claims.json — executable, observable product claims. | 6 | Pass — developer reference |
| .factory/demo.md — demo data, storage isolation, and reset behavior. | 9 | Pass — developer reference |
| .factory/handoff.md — verification record and operator actions. | 7 | Pass — developer reference |
| License | 1 | Pass |
| MIT | 1 | Pass |

Terminology is consistent: **KeePass vault (.kdbx file)** is defined once and then shortened to **vault**; **metadata** means the four listed non-secret fields; **demo** is the browser try-out; **desktop app** is the installed product; and **license** is the paid entitlement. `KDBX 4`, `SHA256SUMS`, Rust, and Tauri appear only where compatibility, installation, or development details require them.

## Demo and sandbox behavior

- The home action enters `/?demo=1` in one click.
- At 390 × 844, the first demo viewport contains the persistent banner, prefilled `acme` query, two realistic results, and their `Work.kdbx` owner labels.
- The banner says **“Demo — sample data, nothing is saved to your real vaults”** and keeps **Reset demo** and **Start for real** visible.
- A fresh context with a real-data sentinel wrote only `demo:vault-cross-search:sample-v1`. Reset cleared the query and restored six records. Start for real deleted the demo key and preserved the sentinel.
- The complete home → demo → search → reset → Start-for-real flow made only same-origin requests and produced no console error.
- After the first load, browser offline mode still returned the expected `operations` results and Reset restored all six sample entries.
- Instrumented claim coverage confirms that demo mode does not open a file picker or call the desktop app.

## Claims

Before any Rust command, the documented Tauri Linux prerequisites were installed on Ubuntu 24.04: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, and `librsvg2-dev` (including their GTK/WebKit dependencies).

A new local clone of the reviewed revision was created under `/tmp`, followed by `npm ci`. Every `test` command in `.factory/claims.json` was then run separately. Result: **36 passed, 0 failed, 0 untested**.

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| demo-search | Pass | demo-isolation | Pass |
| demo-reset | Pass | demo-privacy | Pass |
| demo-boundary | Pass | download-on-demand | Pass |
| site-resource-privacy | Pass | website-install-copy | Pass |
| original-artwork | Pass | metadata-only | Pass |
| kdbx-unlock | Pass | optional-key-files | Pass |
| credential-clear | Pass | database-drop | Pass |
| memory-only-index | Pass | session-lock | Pass |
| single-vault-lock | Pass | auto-lock | Pass |
| quit-lock | Pass | associated-open | Pass |
| bundled-sample-vault | Pass | desktop-sample-project | Pass |
| desktop-no-observation | Pass | desktop-keyboard-search | Pass |
| desktop-multi-vault-search | Pass | no-secret-actions | Pass |
| no-custody-sync | Pass | free-vault-limit | Pass |
| licensed-vault-limit | Pass | license-scope | Pass |
| license-verdict-storage | Pass | license-revocation | Pass |
| offline-license-cache | Pass | one-time-pricing | Pass |
| verified-installers | Pass | installer-signing-status | Pass |

The live landing page and README were cross-checked sentence by sentence against this registry. Each reliance statement maps to the relevant demo, download, privacy, desktop-core, session, pricing/license, artwork, or installer claim. Development and release instructions describe repository operations rather than additional runtime product promises. No unlisted claim remains.

## Earlier-history verification

Every earlier review, polish report, and handoff was read. Each earlier finding was checked again in source and on the live deployment.

| Earlier ID | Status | Current independent confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | No checkout link exists; landing and desktop state that purchasing is unavailable. |
| F-1-2 | Fixed | The 390 px demo first viewport shows the query, two results, and owning vault. |
| F-1-3 | Fixed | Home → Privacy focuses the Privacy H1; Back focuses the home H1 and updates the polite announcer. |
| F-1-4 | Fixed | Demo, Privacy, and Terms are visible in the 390 px header without overflow. |
| F-1-5 | Fixed | Pricing headings are **Pricing**, **Free**, and **Unlimited vaults**. |
| F-1-6 | Fixed | All three required product facts are in the first 390 × 844 viewport. |
| F-1-7a | Fixed | The plain unsigned-installer disclosure is registered and `installer-signing-status` passes. |
| F-1-7b | Fixed | Merchant-of-record and refund promises are absent from source and live copy. |
| F-1-7c | Fixed | `demo-boundary` proves no file picker or desktop bridge call. |
| F-1-7d | Fixed | The unsupported zeroizing/logging sentence is absent; narrower registered memory claims remain. |
| F-1-8 | Fixed | The live HTTP-404 page uses the useful H1 **“Page not found”** and no mood label. |
| F-2-1 | Fixed | README describes the actual explicit GitHub lookup; the platform-selection test passes. |
| F-2-2 | Fixed | Landing and README use **“not signed by a verified publisher”** without OS-warning predictions. |
| F-2-3 | Fixed | Artwork provenance is registered as `original-artwork`, and its source/sidecar/derivative test passes. |
| F-2-4 | Fixed | The former 24-word demo sentence is split; every current sentence is at most 22 words. |
| F-2-5 | Fixed | Both controls say **“Copy install command.”** |
| F-2-6 | Fixed | Process-memory, associated-app, and checkout-registration jargon is absent from landing copy. |
| F-2-7 | Fixed | The cited implementation jargon is absent from user-facing README prose. |
| F-2-8 | Fixed | User-facing data-file terminology is consistently **KeePass vault (.kdbx file)** then **vault**. |
| F-3-1 | Resolved | With the documented native prerequisites installed first, all 14 Rust claim commands and full `npm test` pass in the clean clone. Missing host packages are not classified as a product finding. |

No earlier finding is open, half-fixed, or regressed.

## Structure, accessibility, links, and visual identity

- Live `/`, `/?demo=1`, `/demo/`, `/privacy/`, and `/terms/` return 200. A random unknown route returns the designed page with HTTP 404.
- Every checked route has `lang=en`, one H1, one main landmark, a route-specific title, a description, canonical URL, Open Graph and Twitter metadata, SVG favicon, and 180 × 180 apple-touch icon. The social image is 1200 × 630.
- Each route has the consistent wordmark/header/footer shell, Demo, Privacy, Terms, build ID, and a skip link. The home route keeps four primary navigation links; the other routes keep three.
- A crawl found all product-site and GitHub links healthy. The 404 page's `#main` link correctly remains within the already-404 document.
- Navigation and browser Back focus and announce the destination H1. Deep links load their intended state. The demo has working keyboard search and reset controls.
- Live Axe analysis at 390 px reported zero violations on home, both demo URLs, Privacy, Terms, and the designed 404. The supplied live verifier reported one H1, `lang`, main, complete image alternatives, labelled buttons, and zero console errors.
- The complete suite covers keyboard operation, visible three-pixel focus, 44 px mobile targets, 200% zoom-width behavior, reduced-motion CSS, route shells, metadata, and 404 configuration.
- Response headers include `nosniff`, `no-referrer`, and a CSP whose `frame-ancestors 'none'` is delivered as a header. `robots.txt` and `sitemap.xml` list the real public routes.
- The topographic terrain artwork, paper/pine/rust palette, Atkinson Hyperlegible type, contour rules, cartographic labels, and restrained motion match `.factory/design.md`. The result is product-specific rather than a generic SaaS template.

## Local quality gates

Run from the clean clone after installing the native prerequisites:

- `CI=true CARGO_BUILD_JOBS=1 npm test` — Pass: 9 Vitest, 55 applicable Playwright, and 17 Rust tests. Eleven Playwright cases were intentionally skipped outside their configured project.
- `npm run typecheck` — Pass.
- `npm run build` — Pass; produced `dist/app/` and `dist/site/`.
- First-load JavaScript — desktop app 5.40 kB gzip; site 2.93 kB gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check` — Pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` — Pass.
- `sh -n site/public/install.sh` — Pass.
- `/opt/fleet/lib/verify-url.sh https://vault-cross-search.sociobot.in <temporary-evidence-dir>` — Pass; 650 ms load and zero console errors.

The live GitHub release is public `v0.1.6` and includes macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json` assets.

## Missed leverage

No additional AI, import/export, or sync feature is implied by the brief. Selecting local KDBX files is the necessary import path. Sync, cloud accounts, password storage, and autofill are explicit non-goals. An AI step would not improve deterministic metadata lookup and would add an unnecessary privacy boundary. No decorative AI feature or embedded provider credential is present.

## What would make this perfect

Nothing remains to change for the reviewed scope. Maintain the current claim matrix, native-prerequisite setup, and full live/local checks for future releases.
