# Perfection loop 1 — repair evidence

**Source review:** `.factory/review-1.md` at `830d5b5d294cb6684409ffe53a21837c062a74bc`  
**Candidate repaired:** `fe8ee6aee897628c073cc1ec37c3cd5292d3e83f`  
**Date:** 2026-09-01 UTC

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Removed every checkout link. Landing and app now show `$19 once`, `No subscription`, and a non-interactive `Purchase unavailable` state until operator registration exists. Removed merchant/refund promises. | `@claim:one-time-pricing`; `.factory/evidence/desktop-home-1440x900.png`; cold live `/` found no checkout URL or merchant/refund copy. |
| F-1-2 | Made `/?demo=1` the one-click entry. It opens with `acme` prefilled, the search panel before the vault list, and two Work.kdbx results in the first 390×844 viewport. | `@claim:demo-search`; `mobile demo keeps its primary controls and results within 390px`; `.factory/evidence/live-mobile-demo-390x844.png`; cold live `/?demo=1`. |
| F-1-3 | Added one shared self-hosted route-focus script, focusable route H1s, a polite route announcer, and Back-navigation handling. | `real routes set distinct titles, metadata, and focus headings after navigation and Back`; cold live `/` → `/privacy/` → Back focused each route H1. |
| F-1-4 | Kept Demo, Privacy, and Terms visible in the 390px header; the 200%-zoom proxy keeps Privacy and removes overflow. | `mobile first screen shows all three product facts and Privacy navigation`; `all public controls meet the 44px mobile target minimum`; `.factory/evidence/live-mobile-home-390x844.png`. |
| F-1-5 | Replaced lore labels with `Pricing`, `Free`, and `Unlimited vaults`; retained literal `Up to two vaults` and `$19 once`. | `@claim:one-time-pricing`; `.factory/copy-audit.md`; live `/#pricing`. |
| F-1-6 | Reordered the phone hero so task, actions, and all three facts precede the artwork and fit within 390×844. | `mobile first screen shows all three product facts and Privacy navigation`; `.factory/evidence/live-mobile-home-390x844.png`; cold live `/` bounding-box assertions for all three facts. |
| F-1-7a | Reworded the statement to the verifiable configuration fact `Installer publisher signing is not configured` and added a release-workflow test. | `@claim:installer-signing-status`; release workflow `33571441788` passed; v0.1.4 published all platform assets. |
| F-1-7b | Removed all merchant-of-record and refund promises from landing, privacy, terms, README, app, and claims. | `@claim:one-time-pricing`; repository search for removed wording; live `/`, `/privacy/`, and `/terms/`. |
| F-1-7c | Narrowed the README wording and added an instrumented boundary test proving the demo invokes neither a file picker nor the Tauri bridge. | `@claim:demo-boundary`; `@claim:demo-privacy`; live `/?demo=1`. |
| F-1-7d | Removed the unproved zeroizing-buffer/logging sentence. README now states only the already tested in-memory boundary. | `claim_index_has_no_disk_persistence_path`; repository search for removed wording. |
| F-1-8 | Removed the mood-only 404 eyebrow and retained one useful `Page not found` H1. | `site build includes explicit static-host headers and a real 404 response`; cold live `/not-a-real-page` returned HTTP 404; `.factory/evidence/live-404-390x844.png`. |

## Additional acceptance coverage

- Query demo isolation, Reset demo, Start for real, native boundary, and same-origin requests are covered by five dedicated claim tests.
- Titles, descriptions, canonical URLs, Open Graph/Twitter titles, one-H1 structure, legal destinations, focus restoration, and Back are browser-tested.
- Mobile screenshots are stored under `.factory/evidence/`; the home and demo screenshots are viewport captures, not full-page captures.
- All 32 exact claim commands pass from a clean clone. Evidence: `.factory/evidence/claims-clean-clone.log`.
- The complete clean-clone test run passes. Evidence: `.factory/evidence/full-suite-clean-clone.log`.
- Local and live Lighthouse reports: `.factory/evidence/lighthouse-local.json` and `.factory/evidence/lighthouse-live.json`.

Deployment `cd368634-4854-49f6-80a8-1a5bd1204d6e` was checked cold at `https://vault-cross-search.sociobot.in` on 2026-09-01 UTC.

## Retry 1 final verification — 2026-09-02 UTC

The controller-reported linker bus error was treated as infrastructure recovery work, not as a test exemption. `cargo clean --manifest-path src-tauri/Cargo.toml` ran before a fresh `CI=true CARGO_BUILD_JOBS=1 npm run tauri build`; the completed Linux build produced `Vault Cross Search_0.1.4_amd64.deb` and `Vault Cross Search-0.1.4-1.x86_64.rpm` after the native linker stage.

From a new `--no-local` clone of `2c1f525c0dc85ad96150776e4fbb02ec0c1fb6e6`, all 32 exact commands in `.factory/claims.json` passed. The complete suite also passed: 9 Vitest tests, 60 Playwright tests, 16 Rust tests, TypeScript check, `cargo fmt --check`, Clippy with `-D warnings`, install-script syntax, and both Vite builds.

Static deployment `518621e1-d44f-44a7-80af-f74540bdaf5a` was then cold-checked at the live URL. `/opt/fleet/lib/verify-url.sh` passed with no console errors, one H1, a main landmark, `lang=en`, image alternatives, and labelled buttons; its output is `.factory/evidence/verify-live-retry1/verify.json`. A fresh 390×844 browser check re-ran F-1-2 through F-1-6 and F-1-8, while the pricing/no-checkout assertion re-ran F-1-1, F-1-5, and F-1-7b. The declared claim tests cover F-1-7a, F-1-7c, and F-1-7d. No review finding remains open.
