# Adversarial first-read review 3 — Vault Cross Search

**Date:** 2026-09-02 UTC  
**Revision reviewed:** `a6021265fee2e0503e04d3bf6f137efe1734225e`  
**Verdict: FAIL**

The live product is clear, usable, and visually product-specific. It cannot pass this round because 14 declared Rust claim tests and the required `npm test` command fail from a clean clone in this sandbox. A failing declared claim is blocking under the work order.

## Cold first read

Tested in fresh Chromium contexts at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** searches the non-secret metadata for one entry across separate KeePass vaults without combining the vaults.
- **For whom:** people who keep several KeePass vaults and need to locate one login.
- **What to click first:** **Try it with sample data**; its adjacent label says it opens three sample vaults.

All three answers are stated in the first phone viewport. The first screen contains the useful headline, the audience sentence, the named demo action, the outcome of that action, and the three facts. No cold-read blocking finding applies.

## Findings

### F-3-1 — BLOCKING — Fourteen listed desktop claims cannot run in the specified clean sandbox

**Location:** the Rust commands in `.factory/claims.json`; root build dependency is `tauri` in `src-tauri/Cargo.toml`.

**Observed result:** cloned the reviewed revision to a new temporary directory, ran `npm ci`, then ran every distinct command from `.factory/claims.json` with `CI=true CARGO_BUILD_JOBS=1`. The following 14 claims exit **101** before their test body runs:

- `metadata-only`, `kdbx-unlock`, `optional-key-files`, `credential-clear`, `database-drop`, `memory-only-index`, `session-lock`
- `single-vault-lock`, `auto-lock`, `quit-lock`, `associated-open`, `bundled-sample-vault`, `no-secret-actions`, `no-custody-sync`

The direct command for `metadata-only` reports:

```
error: failed to run custom build command for `glib-sys v0.18.1`
Package glib-2.0 was not found in the pkg-config search path.
The system library `glib-2.0` required by crate `glib-sys` was not found.
```

`CI=true CARGO_BUILD_JOBS=1 npm test` has the same result: Vitest passes 9 tests and Playwright runs, then Cargo exits 101 at `glib-sys`. This leaves all fourteen privacy/security/product-core claims unverified in the required clean environment. A first-time visitor must be able to rely on these statements, especially the metadata-only and no-secret-action promises; an unexecutable test does not verify them.

**Concrete fix:** split the pure session/KDBX core into a dependency target that does not pull Tauri/GTK, and point every Rust `claims.json` command at that target so the listed commands pass from a clean clone. Alternatively provide a reproducible repository-owned test environment that installs the exact native dependency before the listed command; merely documenting a manual host prerequisite does not satisfy the exact claim command that the verifier executes. Rerun all 14 commands and `npm test` from a fresh clone after the change.

## Demo and sandbox behaviour

The one-click path is present on the landing screen. In a fresh 390 px context, `/?demo=1` immediately rendered:

- the persistent **“Demo — sample data, nothing is saved to your real vaults”** banner;
- **Reset demo** and **Start for real**;
- a prefilled `acme` search and two owned `Work.kdbx` results.

Reset cleared the query and restored all six records. With the page offline after first load, searching `operations` returned the two expected sample entries. `localStorage` contained only `demo:vault-cross-search:sample-v1`; after **Start for real**, the browser was back at `/` and local storage was empty. Request recording during the demo contained only the product origin. The demo does not call the desktop app or present a file picker. No demo finding applies.

## Claim execution

All 36 declared commands were run individually from the clean clone. Summary: **22 pass, 14 fail** (the failure set is F-3-1).

| Claim groups | Result |
| --- | --- |
| Demo search, isolation, reset, privacy, and boundary | Pass (5/5) |
| Download, site-resource privacy, install clipboard, original artwork | Pass (4/4) |
| Rust metadata/session/security/core claims | **Fail (14/14; F-3-1)** |
| Desktop fixture behaviour and keyboard/multi-vault behaviour | Pass (4/4) |
| License and pricing behaviour | Pass (7/7) |
| Installer checksum and publisher-signing checks | Pass (2/2) |

I re-read the live landing page and README against the registry. Their reliance statements map to the listed demo, desktop, privacy, license, installer, or artwork claims. No separate unlisted-claim finding was found. The failed Rust group nevertheless means their corresponding claims remain unverified in this required environment.

## Earlier-history verification

Read every earlier review, polish report, and handoff. Rechecked each prior finding on the live site and relevant source.

| Earlier finding | Status this round | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | No checkout link; price says purchases are unavailable. |
| F-1-2 | Fixed | Mobile demo opens with owned search results above the fold. |
| F-1-3 | Fixed | Privacy navigation and browser Back focus the destination H1 and update the polite announcer. |
| F-1-4 | Fixed | 390 px header exposes Demo, Privacy, and Terms without overflow. |
| F-1-5 | Fixed | Pricing headings are Pricing, Free, and Unlimited vaults. |
| F-1-6 | Fixed | The first phone screen contains all three plain product facts. |
| F-1-7 | Fixed in source/copy | The former claims are removed or registered; their Rust subset is blocked only by F-3-1's environment failure. |
| F-1-8 | Fixed | The live 404 H1 is “Page not found.” |
| F-2-1 through F-2-8 | Fixed | README wording, signing disclosure, artwork claim, sentence length, copy-button label, jargon, and vault terminology match the documented repairs and live pages. |

No earlier finding is regressed. F-3-1 is a new blocking verification failure.

## Structure, links, accessibility, and visual identity

- `/`, `/?demo=1`, `/demo/`, `/privacy/`, and `/terms/` return 200; an unknown path returns the designed 404 with HTTP 404.
- Each route has one H1, a main landmark, a route-specific title, description, canonical, OG/Twitter metadata, favicon, and the shared header/footer. `robots.txt` and `sitemap.xml` are present.
- All landing navigation and external GitHub/release links returned 200. The security headers include a matching CSP, `Referrer-Policy: no-referrer`, and `X-Content-Type-Options: nosniff`.
- Axe reported no violations, including no serious or critical violations, across home, both demo URLs, Privacy, Terms, and 404. Normal 404-document network reporting aside, no JavaScript console errors occurred on the successful routes.
- The topographic-map art, paper/night palette, cartographic rules, self-hosted accessible type, and field-map walkthrough are distinct from a generic SaaS template and match `.factory/design.md`.
- `npm run build` and `npm run typecheck` passed. `npm test` fails only at the Cargo prerequisite described in F-3-1.

## Missed leverage

No additional feature is required by the brief. The product deliberately avoids vault custody, sync, autofill, and cloud accounts; an AI feature would not improve this metadata-search job and would add a privacy boundary. The current demo, local install path, and screenshot walkthrough provide the expected try-before-install path.

## Copy audit

The following is the full current landing and README copy inventory. Word counts are whitespace-delimited. Navigation labels and repeated controls are counted once. No item exceeds 22 words, uses a banned marketing adjective, relies on a mood/metaphor heading, or uses a non-result-naming button. There are no copy findings in this round.

### Landing page

| Copy | Words |
| --- | ---: |
| Skip to content | 3 |
| Vault Cross Search | 3 |
| Demo | 1 |
| How it works | 3 |
| Privacy | 1 |
| Terms | 1 |
| Local desktop search | 3 |
| Find an entry across separate vaults | 6 |
| For people with several KeePass vaults (.kdbx files) who need one login without combining them. | 15 |
| Try it with sample data | 5 |
| Opens three sample vaults | 4 |
| Download the desktop app | 4 |
| The demo is separate sample data. | 6 |
| Download checks GitHub only when you choose it. | 8 |
| Sample data stays separate | 4 |
| Passwords are not indexed | 4 |
| Desktop app locks after inactivity | 5 |
| Three separate topographic islands, each with its own vault, connected only by survey markers | 14 |
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
| Add vaults explicitly. | 3 |
| Each stays where you put it. | 6 |
| Unlock for this session | 4 |
| Your master password goes to the desktop app and is cleared after use. | 13 |
| Search metadata | 2 |
| Search titles, usernames, URLs, and group paths. | 7 |
| Passwords and notes are excluded. | 5 |
| Open the owning vault | 4 |
| Open the original vault in the password app set to handle it. | 12 |
| Metadata stays in the local session. | 6 |
| The desktop app keeps the search index in memory and never saves it. | 13 |
| Lock a vault, lock all vaults, quit, or let the timer run out to clear it. | 16 |
| No analytics or telemetry | 4 |
| The desktop app never copies secret values | 7 |
| No password storage or autofill | 5 |
| No background sync | 3 |
| Read the privacy policy | 4 |
| Desktop walkthrough | 2 |
| Try the installed app with a fake vault | 8 |
| The first screen loads a bundled fake vault. | 8 |
| It never opens or writes a real vault. | 8 |
| Vault Cross Search first-run screen with the Load sample project button | 11 |
| Load sample project | 3 |
| Open the bundled fake vault in a separate session. | 9 |
| Vault Cross Search showing two Acme results in the sample vault | 11 |
| Search its metadata | 3 |
| Try acme to see title, username, URL, group, and owner. | 10 |
| Vault Cross Search sample vault rail and Lock all button | 10 |
| Lock the sample | 3 |
| Clear the session before adding your own vault. | 8 |
| Plans | 1 |
| Pricing | 1 |
| Free | 1 |
| Up to two vaults | 4 |
| Privacy, keyboard controls, and session locking are included. | 8 |
| Download free | 2 |
| Planned license | 2 |
| Unlimited vaults | 2 |
| $19 once | 2 |
| No subscription. | 2 |
| Purchases are not open yet. | 5 |
| Purchase unavailable | 2 |
| Install | 1 |
| One-line install | 2 |
| macOS / Linux | 3 |
| Copy install command | 3 |
| Windows PowerShell | 2 |
| Copy install command buttons copy only the command they display. | 10 |
| The installers are not signed by a verified publisher. | 9 |
| Checksums are published with every release. | 6 |
| Local software for deliberately separate vaults. | 6 |
| Hero artwork was generated for this product. | 7 |
| Built by Param Factory · Build v0.1.6 | 7 |
| GitHub repository opens in a new tab | 7 |

### README

| Copy | Words |
| --- | ---: |
| Vault Cross Search is a desktop utility for people who keep credentials in several KeePass vaults (.kdbx files). | 17 |
| Unlock chosen vaults for one session. | 6 |
| Search title, username, URL, and group metadata together. | 8 |
| Then open the owning vault in the password app set to handle it. | 12 |
| Vaults are never merged or uploaded. | 6 |
| Open the demo URL or choose Try it with sample data on the first screen. | 14 |
| It loads six bundled records across Personal.kdbx, Work.kdbx, and Archive.kdbx; try searching acme, river, or operations. | 16 |
| The installed desktop app also starts with Load sample project. | 10 |
| It opens a fake bundled vault in a separate session and searches acme immediately. | 14 |
| Lock the sample before adding your own vault. | 8 |
| The sample has no real credentials and does not use a file picker. | 13 |
| The demo stores its sample data separately in this browser. | 10 |
| Reset demo restores the bundled records. | 6 |
| Start for real discards the sample and returns to the download page. | 12 |
| The demo never opens a local file or calls the desktop app. | 12 |
| It contacts only vault-cross-search.sociobot.in. | 4 |
| Reads chosen KDBX 4 vaults on your device, with optional key files. | 12 |
| Builds an in-memory index of only title, username, URL, and group path. | 12 |
| Searches every unlocked vault with keyboard navigation. | 7 |
| Opens the result's owning vault in the password app set to handle it. | 12 |
| Clears the metadata index when you lock a vault, lock all, quit, or wait 15 minutes. | 16 |
| Ships with no telemetry, cloud account, autofill, sync, or desktop clipboard writes. | 12 |
| Website buttons copy their displayed command after you press Copy install command. | 12 |
| The free plan supports two simultaneous vaults. | 7 |
| The planned unlimited-vault license is $19 once, with no subscription. | 10 |
| Purchases are not open yet. | 5 |
| Existing tokens can still be restored. | 6 |
| Safety and accessibility behavior is identical in both plans. | 9 |
| Native installers are intentionally built only by GitHub Actions. | 9 |
| After you choose Download, the landing page asks GitHub for the latest macOS, Windows, or Linux release. | 18 |
| The installers are not signed by a verified publisher. | 9 |
| Releases contain .dmg, .msi/.exe, .AppImage, and .deb bundles plus SHA256SUMS. | 10 |
| Release asset names are normalized before upload, so the downloaded names and SHA256SUMS agree. | 14 |
| After downloading an installer and SHA256SUMS into the same directory, verify them with sha256sum -c SHA256SUMS. | 16 |
| The tag triggers the release workflow. | 6 |
| Platform runners create installers; the publish job generates checksums and latest.json before attaching everything to one GitHub Release. | 18 |
| The Rust core receives the unlock credential and clears its password buffer immediately after key derivation. | 16 |
| The unlocked vault is discarded after metadata extraction. | 8 |
| The desktop window receives only the four searchable fields and random local IDs. | 13 |
| The search index exists only while the app is open and is never saved. | 14 |
| This initial version is not yet independently audited. | 8 |
| It opens the owning vault because KeePassXC cannot select an exact entry through a documented cross-platform interface. | 17 |
| The matching title and group remain visible in Vault Cross Search so you can finish navigation without copying secrets. | 19 |
| Please report security issues privately to security@sociobot.in. | 7 |

Terminology remains consistent: **KeePass vault (.kdbx file)** is defined once, then **vault**; the browser try-out is **demo**; installed software is **desktop app**; searchable non-secret fields are **metadata**; and paid entitlement is **license**.

## What would make this perfect

Make the 14 Rust claim commands independently executable from a clean clone in this verifier sandbox, rerun them successfully, and rerun `npm test`. No additional product/copy/demo/structure work is currently indicated by this review.
