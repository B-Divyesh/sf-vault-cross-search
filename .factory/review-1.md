# Adversarial first-read review 1 — Vault Cross Search

**Review date:** 2026-09-01 UTC  
**Live URL:** <https://vault-cross-search.sociobot.in>  
**Verdict: FAIL**

This is a cold, independent review. The result is FAIL because blocking findings remain. All findings below must be resolved and the complete review repeated before acceptance.

## Cold first read

Fresh Chromium contexts visited the live site at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** Finds a login entry across separate KeePass vaults without merging them.
- **For whom:** People who keep several KeePass files.
- **First action:** **Try it with sample data**; the adjacent text says it opens three sample vaults.

The home first screen answers those three questions on both viewports. It had no console or page errors and no horizontal overflow (`scrollWidth === 390` at mobile).

## Findings

### F-1-1 — BLOCKING — License purchase link is dead

**Location / quote:** Landing pricing card and desktop license dialog: **“Buy a license”** → `https://api.sociobot.in/api/v1/products/vault-cross-search/checkout`.

**Evidence:** A live follow of that URL returned HTTP **404** with `{"error":"enabled factory product","status":404}` on 2026-09-01. The link therefore cannot start the advertised $19 purchase.

**Why this fails:** A visitor is promised a purchasable unlimited-vault license but reaches an error. This is a dead link and contradicts the live `one-time-pricing` claim.

**Concrete fix:** Provision or correct the product-specific Sociobot checkout URL, update both links, and change the claim test to make a harmless request to the configured endpoint and assert a non-404 checkout response or documented redirect. Keep the existing exact-price assertions.

### F-1-2 — BLOCKING — The mobile demo does not show the search job in its first screen

**Location / quote:** `/demo/` at 390 × 844, immediately after **“Try it with sample data.”** The visible content ends with **“These records are bundled examples. They never open a local file.”** The **“Sample search”** heading, search field, result count, and realistic entries are below the fold.

**Evidence:** The fresh mobile screenshot shows the banner and three vault-name cards only. It does not show a query, a result, or the search field before scrolling.

**Why this fails:** The required one-click demo must already show the product being used with realistic sample data. On the phone it currently shows scope cards, not cross-vault search.

**Concrete fix:** At widths through 390px, put a pre-populated sample search and at least two owned results above the vault list, or substantially compact the vault list so the search box and results are visible in the initial 844px viewport. Add a 390 × 844 Playwright assertion that the search input, a realistic result, and its owning vault are visible without scrolling.

### F-1-3 — Minor — Route changes do not move focus to the page heading

**Location / quote:** Header **“Privacy”** link from `/` to `/privacy/`, then browser Back.

**Evidence:** In a fresh browser context, after both navigation and Back, `document.activeElement` was `<body>`, not the new route’s `<h1>`. The legal-page `<h1>` is not programmatically focusable.

**Why this matters:** Keyboard and screen-reader visitors are left at an undefined reading position after a real route change.

**Concrete fix:** Make each route heading programmatically focusable (`tabindex="-1"`), then use one shared, self-hosted route script to focus it and announce the new page after navigation and `pageshow`/Back. Add a browser test for header navigation and Back that asserts heading focus.

### F-1-4 — Minor — Mobile header hides the Privacy route

**Location / quote:** At 390px, the home header shows **“Demo”** and **“Terms”**, but not **“Privacy.”** `site/style.css` hides `.site-header nav a:nth-child(3)` below 840px.

**Why this matters:** Privacy is a required, expected destination for a product handling vault metadata. It is only available after scrolling to the footer on a phone.

**Concrete fix:** Keep Privacy visible in the mobile header, for example by using a compact menu that contains Demo, Privacy, and Terms. Add a 390px visibility assertion.

### F-1-5 — Minor — Pricing headings use invented, non-informative language

**Location / quote:** Landing pricing section: **“Useful free. Unlimited once.”**, **“Field edition”**, and **“Expedition edition.”**

**Why this matters:** The section heading does not name the section or tell a cold visitor what the options are. The edition labels are product lore rather than the user’s decision.

**Concrete fix:** Rename the section **“Pricing”**, the cards **“Free”** and **“Unlimited vaults”**, and keep the useful plain facts: **“Up to two vaults”** and **“$19 once. No subscription.”**

### F-1-6 — Minor — The first mobile screen omits the required three plain product facts

**Location / quote:** Home at 390 × 844. The facts **“Sample data stays separate,” “Passwords are not indexed,”** and **“Desktop app locks after inactivity”** are below the first screen after the large illustration, headline, explanation, and actions.

**Why this matters:** The required first-screen shape includes these facts. The cold read is understandable, but the privacy and lock facts are unnecessarily delayed for the audience most likely to need them.

**Concrete fix:** On mobile, place the three facts directly under the demo action or reduce/reorder the illustration so all three are visible in the initial viewport. Add a viewport test for their visibility.

### F-1-7 — Minor — Four reliance claims are not independently listed and tested

The following visitor-facing statements have no matching claim entry and observable test in `.factory/claims.json`:

1. **F-1-7a, landing install note:** **“v0.1 builds are unsigned.”** Add an `installer-signing-status` claim that inspects each released installer/signature state, or remove the sentence.
2. **F-1-7b, landing pricing note:** **“Sociobot/Dodo is merchant of record. Refunds are handled there.”** Add a claim that verifies the configured checkout has the stated merchant/refund terms, or replace it with a neutral link to the provider’s terms that does not assert an untested arrangement.
3. **F-1-7c, README demo:** **“The demo never reads a vault file or makes a product API request.”** The existing request test only asserts no third-party request; it does not prove the local-file part. Add an observable demo-boundary test (no native/plugin invocation or file-picker path) or narrow the sentence to the tested same-origin request fact.
4. **F-1-7d, README security model:** **“Search data is wrapped in zeroizing buffers and never written to application storage or logs.”** Existing claims cover index persistence and password clearing, not this buffering/logging assertion. Add a focused Rust boundary test or remove the unproven wording.

### F-1-8 — Minor — The 404 contains a mood-only heading

**Location / quote:** `/404.html` eyebrow: **“No marker at this coordinate.”**

**Why this matters:** It is map lore rather than useful recovery information. The actual useful heading, **“Page not found,”** already does the job.

**Concrete fix:** Remove it or replace it with **“Page not found”** only.

## Copy audit

Counts use whitespace-delimited words. Code blocks, URLs used solely as links, file paths, and repeated footer/navigation instances are excluded. Every landing sentence, heading, label, fact, and action is listed once because those are the strings a visitor reads; all README prose sentences are listed. No audited line exceeds 22 words. The plain-language and claim issues are recorded above.

### Landing page

| Text | Words |
| --- | ---: |
| Skip to content | 3 |
| Vault Cross Search | 3 |
| Demo | 1 |
| How it works | 3 |
| Privacy | 1 |
| Terms | 1 |
| Local desktop search | 3 |
| Find an entry across separate vaults | 6 |
| For people with several KeePass files who need one login without combining their vaults. | 14 |
| Try it with sample data | 5 |
| Opens three sample vaults | 4 |
| Download the desktop app | 4 |
| The demo is separate sample data. | 6 |
| Download checks GitHub only when you choose it. | 8 |
| Sample data stays separate | 4 |
| Passwords are not indexed | 4 |
| Desktop app locks after inactivity | 5 |
| Three separate vaults. | 3 |
| One place to find metadata. | 5 |
| 4 fields | 2 |
| Title, username, URL, group | 4 |
| 15 min | 2 |
| Default automatic lock | 3 |
| 3 vaults | 2 |
| Ready in the sample demo | 5 |
| Search without combining vaults | 4 |
| Choose local vaults | 3 |
| Add .kdbx files explicitly. | 4 |
| Each stays where you put it. | 6 |
| Unlock for this session | 4 |
| Your master password goes to the local app and is cleared after use. | 13 |
| Search metadata | 2 |
| Search titles, usernames, URLs, and group paths. | 7 |
| Passwords and notes are excluded. | 5 |
| Open the owning vault | 4 |
| Open the original database in your associated password app. | 9 |
| Metadata stays in the local session. | 6 |
| The desktop index exists only in process memory. | 8 |
| Lock a vault, lock all vaults, quit, or let the timer run out to clear it. | 16 |
| No analytics or telemetry | 4 |
| No clipboard writes | 3 |
| No password storage or autofill | 5 |
| No background sync | 3 |
| Read the privacy policy → | 4 |
| Useful free. | 2 |
| Unlimited once. | 2 |
| Field edition | 2 |
| Free | 1 |
| Search up to two vaults, with every privacy and accessibility feature included. | 12 |
| Download free | 2 |
| One-time purchase | 2 |
| Expedition edition | 2 |
| $19 once | 2 |
| Unlimited vaults on this device. | 5 |
| No subscription. | 2 |
| Buy a license | 3 |
| Sociobot/Dodo is merchant of record. | 5 |
| Refunds are handled there. | 4 |
| One-line install | 2 |
| macOS / Linux | 3 |
| Copy | 1 |
| Windows PowerShell | 2 |
| v0.1 builds are unsigned. | 4 |
| macOS may require right-click → Open; Windows may show SmartScreen. | 9 |
| Checksums are published with every release. | 6 |
| Local software for deliberately separate vaults. | 6 |
| Hero artwork generated for this product; no stock assets. | 9 |
| Built by Param Factory | 4 |
| Build v0.1.3 | 2 |

### README

| Sentence | Words |
| --- | ---: |
| Vault Cross Search is a local-first desktop utility for people who deliberately keep credentials in several KeePass-compatible (.kdbx) databases. | 19 |
| Unlock selected vaults for one session, search title/username/URL/group metadata together, then open the owning database in its associated password app. | 20 |
| Vaults are never merged or uploaded. | 6 |
| Open https://vault-cross-search.sociobot.in/demo/ or choose Try it with sample data on the first screen. | 13 |
| It loads six bundled records across Personal.kdbx, Work.kdbx, and Archive.kdbx; try searching acme, river, or operations. | 16 |
| The demo uses the separate browser key demo:vault-cross-search:sample-v1. | 8 |
| Reset demo restores the bundled records. | 6 |
| Start for real discards the demo key and returns to the download page. | 13 |
| The demo never reads a vault file or makes a product API request. | 13 |
| Reads explicitly selected KDBX 4 databases locally, with optional key files. | 11 |
| Builds an in-memory index of only title, username, URL, and group path. | 12 |
| Searches every unlocked vault with keyboard navigation (Ctrl/⌘ K, arrows, Enter). | 11 |
| Opens the result’s owning database with the operating system’s associated app. | 11 |
| Zeroes the metadata index on per-vault lock, lock-all, quit, or 15 minutes of inactivity. | 14 |
| Ships with no telemetry, cloud account, autofill, sync, or clipboard writes. | 11 |
| The free edition supports two simultaneous vaults. | 7 |
| A $19 one-time license enables unlimited vaults through the Sociobot billing API. | 12 |
| There is no subscription. | 4 |
| Safety and accessibility behavior is identical in both editions. | 9 |
| Requirements: Node.js 22+, Rust stable, and the Tauri 2 system dependencies for your OS. | 14 |
| The factory static deployment command is exactly npm run build:site; its output is dist/site/, with index.html at that root. | 19 |
| Native installers are intentionally built only by GitHub Actions. | 9 |
| The landing page detects macOS, Windows, or Linux and resolves its main button from the release latest.json manifest. | 18 |
| Releases contain unsigned .dmg, .msi/.exe, .AppImage, and .deb bundles plus SHA256SUMS. | 11 |
| Release asset names are normalized before upload, so the downloaded names and SHA256SUMS agree. | 14 |
| After downloading an installer and SHA256SUMS into the same directory, verify them with sha256sum -c SHA256SUMS. | 16 |
| To publish the repaired v0.1.3 release after verification: | 8 |
| The tag triggers the release workflow. | 6 |
| Platform runners create installers; the publish job generates checksums and latest.json before attaching everything to one GitHub Release. | 18 |
| The Rust core receives the unlock credential and clears its owned password buffer immediately after key derivation. | 17 |
| The decrypted database object is dropped after metadata extraction. | 9 |
| The webview receives only the allowed metadata fields and opaque local identifiers. | 12 |
| Search data is wrapped in zeroizing buffers and never written to application storage or logs. | 15 |
| This initial version is not yet independently audited. | 8 |
| It opens the owning database because KeePassXC does not expose a documented cross-platform interface for selecting an exact GUI entry. | 20 |
| The matching title and group remain visible in Vault Cross Search so the user can finish navigation without copying secrets. | 20 |
| Please report security issues privately to security@sociobot.in. | 7 |

Terms used consistently: **vault** (KeePass database), **metadata** (the four searchable non-secret fields), **demo** (browser sample), **desktop app** (the installed software), and **license** (the paid vault-limit state). The only copy terminology that needs replacement is the invented pricing-edition naming in F-1-5. `.kdbx` is explained by the opening use of KeePass-compatible files; later landing copy should prefer “KeePass (.kdbx) files” over `.kdbx` alone.

## Demo and privacy checks

- The landing action opens `/demo/` in one click.
- Demo data is realistic: six entries across Personal.kdbx, Work.kdbx, and Archive.kdbx.
- The persistent banner says **“Demo — sample data, nothing is saved to your real vaults”** and provides working **Reset demo** and **Start for real** controls.
- In a fresh context, the demo stored only `demo:vault-cross-search:sample-v1`; a sentinel real-data key survived unchanged. Reset cleared the query and restored six records. Start for real removed the demo key and returned home.
- The complete home → demo → search → reset → Start-for-real flow made only same-origin requests and emitted no console/page errors.
- F-1-2 remains blocking because this otherwise isolated demo does not show the search/results before the mobile fold.

## Claims and local verification

Read `.factory/claims.json`: 30 claims are declared. From a new local clone at `630fbc827ec8a6349553db3ccd1816f23781efc4`, after `npm ci --include=dev` and the documented Linux Tauri prerequisites, **all 30 exact commands passed independently**. The three desktop-only Playwright claims each had one applicable desktop pass and one intentional mobile-project skip.

Also passed from that clone:

- `npm test` — Vitest 9/9, Playwright 43 passed with 7 explicit desktop-only skips, Rust 16/16.
- `npm run build` — produced `dist/app` and `dist/site`; site JavaScript is 6.37 kB raw / 2.66 kB gzip.

The claim suite does not clear F-1-1: `@claim:one-time-pricing` only checks that the checkout `href` has the expected string, not that the live checkout can be reached.

## Structure, links, accessibility, and history

- Live `/`, `/demo/`, `/privacy/`, `/terms/`, and static `/404.html` returned 200. An unknown route returned the designed 404 with HTTP 404. Titles, descriptions, canonical URLs, OG/Twitter data, favicon, `lang`, one H1, and one main landmark were present on every checked route.
- Live Axe checks at 390px reported zero serious/critical violations on home, demo, privacy, terms, and unknown 404. Reduced-motion CSS is present. The map-based art, self-hosted type, and palette match `.factory/design.md` and are distinct from a generic SaaS layout.
- All internal links worked. The GitHub release and repository links returned 200. The checkout link is the one dead link (F-1-1).
- The static site has robots, sitemap, CSP, response-header `frame-ancestors`, a designed 404, privacy, terms, self-hosted fonts/assets, and no third-party page resources in the observed demo flow.
- There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the prior handoff and repair evidence. Its named multi-vault search, normalized-release-assets, and narrow-layout overflow repairs are present in source and their declared tests passed. The new mobile-demo, checkout, focus, navigation, copy, and claim findings are not marked as fixed by that history.
- The brief explicitly excludes sync, cloud accounts, password storage, and autofill. No AI step, import, or sync is an obvious missing feature for this narrowly local job; no decorative AI feature or embedded provider key was found.

## What would make this perfect

Make checkout real and test its reachability; rearrange the phone demo so a query and owned results are immediately visible; restore heading focus on navigation; keep Privacy available in the mobile header; use plain pricing names; and either test or remove every remaining reliance claim. Then rerun this entire review against the live deployment until there are zero findings.
