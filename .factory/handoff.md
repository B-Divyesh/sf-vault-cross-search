# Vault Cross Search — review 3 handoff

## Outcome

Performed the requested adversarial first-read review without modifying product code. The review is **FAIL** because 14 executable Rust claims cannot compile in a clean clone in this sandbox: `glib-sys` requires missing `glib-2.0` pkg-config metadata. This also makes `npm test` fail during its Cargo phase.

## What was verified

- Cold live site at 390 × 844 and 1440 × 900: the job, audience, and first click are clear before scrolling.
- Live sample demo: first-screen sample results, persistent isolation banner, reset, offline search, storage namespace, Start-for-real cleanup, and same-origin requests.
- All 36 `.factory/claims.json` commands in a fresh clone: 22 pass, 14 fail with Cargo exit 101 as recorded in `.factory/review-3.md`.
- Live routes, titles, metadata, links, focus/Back behavior, HTTP 404, CSP/headers, Axe checks, and visual identity.
- `npm run build` and `npm run typecheck` pass. `npm test` fails at Cargo for the same native prerequisite.

## Required next step

Repair the test target/environment so the exact 14 Rust claim commands in `.factory/claims.json` and `npm test` pass from a clean clone. Then repeat the entire independent review.
