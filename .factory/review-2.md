# Adversarial first-read review 2 — Vault Cross Search

**Review date:** 2026-09-02 UTC

**Live URL:** <https://vault-cross-search.sociobot.in>

**Reviewed commit:** `2a930506dd2e52a29cd9cb033dbac6898c3d7fa8`

**Verdict: FAIL**

There are no blocking findings. The product is clear, tryable, and functional, but PASS requires zero findings. Eight minor copy and claim-governance findings remain.

## Cold first read

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 × 900 with no prior storage. I recorded the first viewport before scrolling.

- **What it does:** Finds a login entry across separate local KeePass vaults without combining them.
- **For whom:** People who keep credentials in several KeePass files.
- **What to click first:** **Try it with sample data**. The adjacent line says **“Opens three sample vaults.”**

All three answers are explicit on both viewports. The primary action and all three safety facts are visible at 390 × 844. The mobile document width is exactly 390 px. The home page made only same-origin requests before an explicit download action and emitted no console or page errors.

## Findings

### F-2-1 — Minor — README describes a download path the product does not use

**Location / quote:** `README.md`, Install and release: **“The landing page detects macOS, Windows, or Linux and resolves its main button from the release `latest.json` manifest.”**

**Evidence:** A live intercepted click on **Download the desktop app** requested `https://api.github.com/repos/B-Divyesh/sf-vault-cross-search/releases/latest`. `site/main.ts` also fetches that API and never fetches `latest.json`. No claim in `.factory/claims.json` covers the quoted `latest.json` behavior; `download-on-demand` covers only when GitHub is contacted.

**Why this matters:** Maintainers are told that the landing button consumes the release manifest, but the shipped code uses a different source. This makes the release documentation unreliable.

**Concrete fix:** Replace it with **“After you choose Download, the landing page asks GitHub for the latest macOS, Windows, or Linux release.”** Update `download-on-demand` to assert the selected asset for each supported OS, or add a separate claim for platform selection.

### F-2-2 — Minor — The installer warning mixes jargon with an unlisted claim

**Location / quote:** Landing install note: **“Installer publisher signing is not configured. macOS may require right-click → Open; Windows may show SmartScreen.”**

**Why this matters:** “Publisher signing” is unexplained jargon. The second sentence predicts visible platform behavior, but `installer-signing-status` checks only that signing secrets are absent and that the disclosure exists. It does not exercise either OS warning, and no other claim covers that sentence.

**Concrete fix:** Remove the prediction and say only **“The installers are not signed by a verified publisher.”** Alternatively, add separately reproducible macOS and Windows package-install checks and list the claim.

### F-2-3 — Minor — The artwork provenance sentence is an unlisted claim

**Location / quote:** Landing footer: **“Hero artwork generated for this product; no stock assets.”**

**Why this matters:** This is a factual provenance promise visible to visitors. The source image and prompt sidecars exist, but `.factory/claims.json` does not list or test the promise.

**Concrete fix:** Remove the footer claim, or add an `original-artwork` claim whose test verifies the source asset, prompt sidecars, generated derivatives, dimensions, and recorded provenance.

### F-2-4 — Minor — One README sentence exceeds the 22-word limit

**Location / quote:** `README.md`, Try the demo, 24 words: **“It opens a fake bundled KDBX in a separate in-memory session, searches `acme` immediately, and lets you lock it before adding your own vault.”**

**Why this matters:** The sentence combines setup, initial state, isolation, and exit behavior. It is harder to scan than the rest of the demo instructions.

**Concrete fix:** Use **“It opens a fake bundled KDBX in a separate session and searches `acme` immediately. Lock the sample before adding your own vault.”**

### F-2-5 — Minor — The install buttons use a generic action label

**Location / quote:** Both landing install controls end with **“Copy.”**

**Why this matters:** “Copy” does not name the result when controls are skimmed or announced out of visual context.

**Concrete fix:** Change both labels to **“Copy install command.”** Keep the platform name and command in each button’s accessible name.

### F-2-6 — Minor — Three landing phrases use implementation or operator jargon

**Locations / quotes and rewrites:**

- **“The desktop index exists only in process memory.”** → **“The desktop app keeps the search index in memory and never saves it.”**
- **“Open the original database in your associated password app.”** → **“Open the original vault in the password app set to handle it.”**
- **“Checkout registration is pending.”** → delete it; **“Purchases are not open yet”** already gives the user the useful fact.

**Why this matters:** “Process memory,” “associated app,” and “checkout registration” describe implementation or operator state instead of a result a first-time visitor can use.

### F-2-7 — Minor — The README uses unexplained implementation terms

**Locations / quotes:** **“local-first,” “browser key,” “desktop bridge,” “product origin,” “webview,” “opaque local identifiers,”** and **“application-storage path.”**

**Why this matters:** These terms make the user-facing introduction, demo instructions, and security summary harder to understand on the first read.

**Concrete fix:** Start with **“Vault Cross Search is a desktop utility that processes vaults on your device.”** For the demo, use **“The demo stores its sample data separately in this browser. It never opens a local file or calls the desktop app. It contacts only vault-cross-search.sociobot.in.”** For the security summary, use **“The desktop window receives only the four searchable fields and random local IDs. The search index exists only while the app is open and is never saved.”** Keep implementation terms in developer documentation.

### F-2-8 — Minor — User-facing names for the same vault object are inconsistent

**Locations / quotes:** The landing page alternates among **“KeePass files,” “vaults,” “database,” “KeePass project,”** and **“KDBX.”** The README similarly alternates among **“KeePass-compatible databases,” “vaults,” “KDBX 4 databases,”** and **“sample project.”**

**Why this matters:** A new visitor must infer whether these are the same thing, especially when the product’s value depends on keeping several of them separate.

**Concrete fix:** Define the object once as **“KeePass vault (.kdbx file)”**, then use **“vault”** in user-facing prose. Reserve **“KDBX 4”** for the compatibility specification and **“sample project”** only for the exact desktop control label.

## Copy audit

Counts are whitespace-delimited words. Commands are excluded as code, repeated header/footer items are listed once, and numbered step markers are excluded. Meaningful image alternatives are included. The landing average is 5.1 words across 84 audited strings; no landing item exceeds 22 words. The README average is 10.3 words across 60 items; one sentence exceeds 22 words. No banned marketing adjective, mood heading, or slogan-only heading appears.

### Landing page

| Text | Words | Flag |
| --- | ---: | --- |
| Skip to content | 3 | — |
| Vault Cross Search | 3 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Local desktop search | 3 | — |
| Find an entry across separate vaults | 6 | — |
| For people with several KeePass files who need one login without combining their vaults. | 14 | F-2-8 |
| Try it with sample data | 5 | — |
| Opens three sample vaults | 4 | — |
| Download the desktop app | 4 | — |
| The demo is separate sample data. | 6 | — |
| Download checks GitHub only when you choose it. | 8 | — |
| Sample data stays separate | 4 | — |
| Passwords are not indexed | 4 | — |
| Desktop app locks after inactivity | 5 | — |
| Three separate vaults. | 3 | — |
| One place to find metadata. | 5 | — |
| Three separate topographic islands, each with its own vault, connected only by survey markers | 14 | — |
| 4 fields | 2 | — |
| Title, username, URL, group | 4 | — |
| 15 min | 2 | — |
| Default automatic lock | 3 | — |
| 3 vaults | 2 | — |
| Ready in the sample demo | 5 | — |
| Search without combining vaults | 4 | — |
| Choose local vaults | 3 | — |
| Add .kdbx files explicitly. | 4 | F-2-8 |
| Each stays where you put it. | 6 | — |
| Unlock for this session | 4 | — |
| Your master password goes to the local app and is cleared after use. | 13 | — |
| Search metadata | 2 | — |
| Search titles, usernames, URLs, and group paths. | 7 | — |
| Passwords and notes are excluded. | 5 | — |
| Open the owning vault | 4 | — |
| Open the original database in your associated password app. | 9 | F-2-6, F-2-8 |
| Metadata stays in the local session. | 6 | — |
| The desktop index exists only in process memory. | 8 | F-2-6 |
| Lock a vault, lock all vaults, quit, or let the timer run out to clear it. | 16 | — |
| No analytics or telemetry | 4 | — |
| The desktop app never copies secret values | 7 | — |
| No password storage or autofill | 5 | — |
| No background sync | 3 | — |
| Read the privacy policy → | 4 | — |
| Desktop walkthrough | 2 | — |
| Try the installed app with a fake vault | 8 | — |
| The first screen loads a bundled fake KeePass project. | 9 | F-2-8 |
| It never opens or writes a real vault. | 8 | — |
| Vault Cross Search first-run screen with the Load sample project button | 11 | — |
| Load sample project | 3 | — |
| Open the bundled fake KDBX in a separate session. | 9 | F-2-8 |
| Vault Cross Search showing two Acme sample results in Sample project.kdbx | 11 | — |
| Search its metadata | 3 | — |
| Try acme to see title, username, URL, group, and owner. | 10 | — |
| Vault Cross Search sample vault rail and Lock all button | 10 | — |
| Lock the sample | 3 | — |
| Clear the session before adding your own vault. | 8 | — |
| Plans | 1 | — |
| Pricing | 1 | — |
| Free | 1 | — |
| Up to two vaults | 4 | — |
| Privacy, keyboard controls, and session locking are included. | 8 | — |
| Download free | 2 | — |
| Planned license | 2 | — |
| Unlimited vaults | 2 | — |
| $19 once | 2 | — |
| No subscription. | 2 | — |
| Purchases are not open yet. | 5 | — |
| Purchase unavailable | 2 | — |
| Checkout registration is pending. | 4 | F-2-6 |
| Install | 1 | — |
| One-line install | 2 | — |
| macOS / Linux | 3 | — |
| Copy | 1 | F-2-5 |
| Windows PowerShell | 2 | — |
| Copy buttons place only the visible public install command on your clipboard. | 12 | — |
| Installer publisher signing is not configured. | 6 | F-2-2 |
| macOS may require right-click → Open; Windows may show SmartScreen. | 10 | F-2-2 |
| Checksums are published with every release. | 6 | — |
| Local software for deliberately separate vaults. | 6 | — |
| Hero artwork generated for this product; no stock assets. | 9 | F-2-3 |
| Built by Param Factory · Build v0.1.5 | 7 | — |
| GitHub | 1 | — |

### README

| Text | Words | Flag |
| --- | ---: | --- |
| Vault Cross Search | 3 | — |
| Vault Cross Search is a local-first desktop utility for people who deliberately keep credentials in several KeePass-compatible (.kdbx) databases. | 19 | F-2-7, F-2-8 |
| Unlock selected vaults for one session, search title/username/URL/group metadata together, then open the owning database in its associated password app. | 20 | F-2-6, F-2-8 |
| Vaults are never merged or uploaded. | 6 | — |
| Live download site: https://vault-cross-search.sociobot.in | 4 | — |
| Try the demo | 3 | — |
| Open https://vault-cross-search.sociobot.in/?demo=1 or choose Try it with sample data on the first screen. | 13 | — |
| It loads six bundled records across Personal.kdbx, Work.kdbx, and Archive.kdbx; try searching acme, river, or operations. | 16 | — |
| The installed desktop app also starts with Load sample project. | 10 | — |
| It opens a fake bundled KDBX in a separate in-memory session, searches acme immediately, and lets you lock it before adding your own vault. | 24 | F-2-4, F-2-8 |
| The sample has no real credentials and does not use a file picker. | 13 | — |
| The demo uses the separate browser key demo:vault-cross-search:sample-v1. | 8 | F-2-7 |
| Reset demo restores the bundled records. | 6 | — |
| Start for real discards the demo key and returns to the download page. | 13 | — |
| The demo uses no file picker or desktop bridge, and every demo request stays on the product origin. | 18 | F-2-7 |
| What it does | 3 | — |
| Reads explicitly selected KDBX 4 databases locally, with optional key files. | 11 | F-2-8 |
| Builds an in-memory index of only title, username, URL, and group path. | 12 | — |
| Searches every unlocked vault with keyboard navigation (Ctrl/⌘ K, arrows, Enter). | 11 | — |
| Opens the result's owning database with the operating system's associated app. | 11 | F-2-6, F-2-8 |
| Zeroes the metadata index on per-vault lock, lock-all, quit, or 15 minutes of inactivity. | 14 | — |
| Ships with no telemetry, cloud account, autofill, sync, or desktop clipboard writes. | 12 | — |
| The website install buttons copy only their visible public install commands after you press Copy. | 15 | — |
| The free plan supports two simultaneous vaults. | 7 | — |
| The planned unlimited-vault license is $19 once, with no subscription. | 10 | — |
| Purchases remain unavailable until checkout registration is complete. | 8 | F-2-6 |
| Existing tokens can still be restored. | 6 | — |
| Safety and accessibility behavior is identical in both plans. | 9 | — |
| Develop | 1 | — |
| Requirements: Node.js 22+, Rust stable, and the Tauri 2 system dependencies for your OS. | 14 | — |
| The factory static deployment command is exactly npm run build:site; its output is dist/site/, with index.html at that root. | 19 | — |
| Native installers are intentionally built only by GitHub Actions. | 9 | — |
| Install and release | 3 | — |
| The landing page detects macOS, Windows, or Linux and resolves its main button from the release latest.json manifest. | 18 | F-2-1 |
| Installer publisher signing is not configured. | 6 | F-2-2 |
| Releases contain .dmg, .msi/.exe, .AppImage, and .deb bundles plus SHA256SUMS. | 10 | — |
| Release asset names are normalized before upload, so the downloaded names and SHA256SUMS agree. | 14 | — |
| After downloading an installer and SHA256SUMS into the same directory, verify them with sha256sum -c SHA256SUMS. | 16 | — |
| To publish the repaired v0.1.5 release after verification: | 8 | — |
| The tag triggers the release workflow. | 6 | — |
| Platform runners create installers; the publish job generates checksums and latest.json before attaching everything to one GitHub Release. | 18 | — |
| Security model | 2 | — |
| The Rust core receives the unlock credential and clears its owned password buffer immediately after key derivation. | 17 | — |
| The decrypted database object is dropped after metadata extraction. | 9 | — |
| The webview receives only the allowed metadata fields and opaque local identifiers. | 12 | F-2-7 |
| The metadata index stays in the in-memory Rust session and has no application-storage path. | 14 | F-2-7 |
| This initial version is not yet independently audited. | 8 | — |
| It opens the owning database because KeePassXC does not expose a documented cross-platform interface for selecting an exact GUI entry. | 20 | F-2-8 |
| The matching title and group remain visible in Vault Cross Search so the user can finish navigation without copying secrets. | 20 | — |
| Please report security issues privately to security@sociobot.in. | 7 | — |
| Project structure | 2 | — |
| src-tauri/ — Rust core, KDBX parser, session lifecycle, and native bundles. | 11 | — |
| src/ — compact TypeScript desktop interface. | 6 | — |
| site/ — static download, privacy, terms, and verified one-line installers. | 10 | — |
| .factory/design.md — product-specific visual system and generated-art provenance. | 8 | — |
| .factory/claims.json — executable, observable product claims. | 6 | — |
| .factory/demo.md — demo data, storage isolation, and reset behavior. | 9 | — |
| .factory/handoff.md — verification record and operator actions. | 7 | — |
| License | 1 | — |
| MIT | 1 | — |

### Terminology check

| Concept | Terms currently used | Required single term |
| --- | --- | --- |
| User's KeePass data file | vault, KeePass file, database, KDBX, project | Define **KeePass vault (.kdbx file)** once, then **vault** |
| Searchable non-secret fields | metadata, title/username/URL/group | **metadata**, defined once as those four fields |
| Browser try-out | demo, sample demo | **demo** |
| Installed software | desktop app, local app, webview | **desktop app** in user copy |
| Paid state | plan, edition, license | **license** for the entitlement; **Free** for the no-license state |

## Demo and sandbox verification

- The landing page enters `/?demo=1` in one click.
- At 390 × 844, the first demo viewport contains the banner, prefilled `acme` search, **“2 matches across three sample vaults,”** two realistic results, and their `Work.kdbx` owner labels.
- The persistent banner reads **“Demo — sample data, nothing is saved to your real vaults”** and exposes **Reset demo** and **Start for real**.
- In a fresh context containing a `real:sentinel` value, the demo wrote only `demo:vault-cross-search:sample-v1`. Reset retained the sentinel, cleared the query, and restored six records. Start for real deleted only the demo key and retained the sentinel.
- The complete home → demo → search → reset → Start-for-real flow made no third-party request and produced no console or page error.
- Source inspection confirms the demo has no file input or Tauri invocation path. The installed sample is a separately bundled KDBX exercised by the desktop and Rust claim tests.

## Claims verification

I cloned commit `2a930506dd2e52a29cd9cb033dbac6898c3d7fa8` with `git clone --no-local`, ran `npm ci`, installed the repository's documented Linux Tauri prerequisites, and ran every `test` command in `.factory/claims.json` separately. All 35 commands passed. Desktop-only Playwright commands produced one applicable desktop pass and one intentional mobile-project skip.

| Claim ID | Result |
| --- | --- |
| demo-search | PASS |
| demo-isolation | PASS |
| demo-reset | PASS |
| demo-privacy | PASS |
| demo-boundary | PASS |
| download-on-demand | PASS |
| site-resource-privacy | PASS |
| website-install-copy | PASS |
| metadata-only | PASS |
| kdbx-unlock | PASS |
| optional-key-files | PASS |
| credential-clear | PASS |
| database-drop | PASS |
| memory-only-index | PASS |
| session-lock | PASS |
| single-vault-lock | PASS |
| auto-lock | PASS |
| quit-lock | PASS |
| associated-open | PASS |
| bundled-sample-vault | PASS |
| desktop-sample-project | PASS |
| desktop-no-observation | PASS |
| desktop-keyboard-search | PASS |
| desktop-multi-vault-search | PASS |
| no-secret-actions | PASS |
| no-custody-sync | PASS |
| free-vault-limit | PASS |
| licensed-vault-limit | PASS |
| license-scope | PASS |
| license-verdict-storage | PASS |
| license-revocation | PASS |
| offline-license-cache | PASS |
| one-time-pricing | PASS |
| verified-installers | PASS |
| installer-signing-status | PASS |

No declared claim is untested. F-2-1, F-2-2, and F-2-3 identify claim-like copy outside the registry.

The same clean clone also passed `CI=true CARGO_BUILD_JOBS=1 npm test` (9 Vitest tests, 53 Playwright tests, 11 intentional project skips, and 17 Rust tests), `npm run typecheck`, and `npm run build`. The build produced `dist/app` and `dist/site`; initial JavaScript is 5.41 kB gzip for the desktop UI and 2.92 kB gzip for the site.

The live home HTML, hashed site JavaScript, and hashed site CSS are byte-for-byte matches for that clean build, confirming that the audited deployment corresponds to the reviewed commit.

## Earlier finding verification

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the prior `.factory/handoff.md`, then checked every earlier finding in both source and the live deployment.

| Earlier ID | Status | Independent confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | No checkout link exists in landing or desktop source. Live pricing clearly says purchase is unavailable. `one-time-pricing` passed. |
| F-1-2 | Fixed | Mobile demo places the prefilled search and two owned Acme results above the 844 px fold. `demo-search` passed. |
| F-1-3 | Fixed | Home → Privacy focuses the Privacy H1; browser Back focuses the home H1 and restores scroll. The polite announcer updates. |
| F-1-4 | Fixed | Demo, Privacy, and Terms are all visible in the 390 px header. No horizontal overflow exists. |
| F-1-5 | Fixed | Pricing uses **Pricing**, **Free**, and **Unlimited vaults**. The earlier lore labels are absent. |
| F-1-6 | Fixed | All three product facts are visible in the initial 390 × 844 home viewport. |
| F-1-7 | Fixed | Signing, demo boundary, and storage claims now have tests; merchant/refund and unproved buffer/log copy are absent. All related commands passed. |
| F-1-8 | Fixed | The live HTTP-404 page uses the single useful H1 **“Page not found”**; the mood label is absent. |

No earlier finding is half-fixed or regressed.

## Structure, accessibility, links, and visual identity

- `/`, `/?demo=1`, `/demo/`, `/privacy/`, and `/terms/` return 200. A random unknown route returns the designed page with HTTP 404.
- Every checked route has `lang=en`, one H1, one main landmark, a route-specific title, description, canonical URL, Open Graph/Twitter metadata, SVG favicon, and apple-touch icon. The social image is 1200 × 630.
- Header/footer shells are present on every route with Home/wordmark, Demo, Privacy, Terms, build ID, and the required legal links. All crawlable internal routes, assets, GitHub links, install scripts, `robots.txt`, and `sitemap.xml` returned their expected successful status.
- Home → Privacy → Back moved focus to the new H1 and updated the polite live region. Skip links work. All visible controls on the checked 390 px routes measure at least 44 × 44 px.
- Playwright Axe reported zero violations, including zero serious or critical violations, on home, both demo URLs, Privacy, Terms, and the designed 404. Reduced-motion rules and visible three-pixel focus treatments exist.
- `/opt/fleet/lib/verify-url.sh` passed the live home page: HTTP 200, 831 ms load, no console errors, title, `lang`, one H1, main landmark, image alternatives, and labelled buttons.
- The topographic map art, irregular contour shapes, pine/paper/rust palette, self-hosted Atkinson type, and restrained motion match `.factory/design.md`. The result is visibly product-specific rather than a generic SaaS template.

## Missed leverage

No additional AI, sync, import, or export feature is implied strongly enough to add. The core job is local cross-vault lookup; sync is an explicit non-goal, an AI step would add privacy and key-management cost without improving deterministic lookup, and selecting local KDBX files is already the necessary import path. No decorative AI feature or embedded provider key is present.

## What would make this perfect

Resolve F-2-1 through F-2-8: make the README describe the actual GitHub API download path, register or remove the two remaining claim-like statements, split the 24-word demo sentence, give Copy buttons result-specific labels, replace implementation jargon, and standardize the vault terminology. Then repeat the full cold-read, demo isolation, claim matrix, routing, link, and accessibility checks against the deployed result until the review has zero findings.
