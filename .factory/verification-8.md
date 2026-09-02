# Independent verification 8 — Vault Cross Search

**Date:** 2026-09-02 UTC  
**Work order:** `vault-cross-search-verify-8`  
**Candidate commit:** `503fdcfb261a04815f3551f2d6504fd3b571dac8`  
**Live URL:** <https://vault-cross-search.sociobot.in>

## Verdict: PASS

The live download site is the candidate production build, and the published
`v0.1.6` desktop release has all required platform artifacts. No product
defect was found.

## First read and demo

A cold live visit answered the required questions on its first screen:

- **Does:** “Find an entry across separate vaults.”
- **For:** people with several KeePass vaults who need one login without
  combining them.
- **First action:** **Try it with sample data**, with the adjacent explanation
  “Opens three sample vaults.”

The action opens the isolated `/?demo=1` sandbox in one click. It starts with
two owned Acme results, a persistent “Demo — sample data, nothing is saved”
banner, Reset demo, and Start for real. Searching `river` returned three
realistic records across Personal and Archive; Reset restored all six bundled
records. At 390 x 844 there was no horizontal overflow. Keyboard tabbing
reached the skip link, navigation, banner controls, and search input with a
visible solid focus treatment. Reduced-motion produced no active animations.

## Claims and local gates

`.factory/claims.json` is present with 36 declared claims. Every exact command
listed in it was run. All passed after installing the normal Linux Tauri build
prerequisites (`libglib2.0-dev`, GTK/WebKit and related development packages).
The initially clean worker image lacked `glib-2.0.pc`, so its first Rust-claim
compile failed before product code executed; this is an environment prerequisite
documented by the project, not a candidate failure. All 14 exact Rust claim
commands were rerun and passed after that prerequisite was supplied.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 65 packages installed; audit reported 0 vulnerabilities |
| 36 exact claim commands | PASS |
| `npm test` | PASS — 9 Vitest, 55 Playwright, 17 Rust; 11 intentional project skips |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — generated `dist/app/` and `dist/site/` |
| `cargo fmt --check` | PASS |
| `cargo clippy --all-targets -- -D warnings` | PASS |

Fresh production output is well within the static budget: site JS is 7.47 KB
raw / 2.93 KB gzip; site CSS is 17.43 KB raw / 4.15 KB gzip. App JS is 15.07
KB raw / 5.40 KB gzip.

## Live deployment, privacy, and accessibility

- `verify-url.sh` passed: HTTPS 200 in 833 ms, plain-language title,
  `lang=en`, one H1, a main landmark, complete image alternatives, labeled
  buttons, and no console errors.
- Independent Playwright + Axe checks found zero serious or critical findings
  on the 390 px live demo. Cold desktop visits to `/`, `/demo/`, `/privacy/`,
  `/terms/`, and `/404.html` had no console or page errors and no third-party
  requests.
- The complete live demo flow made only same-origin requests. This confirms the
  local-first demo privacy promise. GitHub is intentionally contacted only by
  the explicit download action (and that behavior is covered by the declared
  claim test).
- Response headers include HSTS, `Referrer-Policy: no-referrer`,
  `X-Content-Type-Options: nosniff`, a restrictive CSP with only the explicit
  GitHub API `connect-src` exception, and Permissions-Policy. HTML is cached
  for 30 seconds; hashed assets are long-lived immutable assets.
- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200. An unknown route
  returned the designed page with HTTP 404.
- The product has no product-owned server endpoint or sign-in flow. Checkout
  remains unavailable, so no product request allowance/429 behavior applies.

## Candidate/release identity and installers

The rebuilt `main-D7WUx8Mj.js` SHA-256 is
`4198473dcf207dd45e0a510d83d84050c74a73ac8468d018c142c0e33df88add` both
locally and live. The rebuilt `main-C31QDIXp.css` SHA-256 is
`04cd3c76ba4cb183686f40862fbd0c0c34a8c5209303d7cb1da70159488182ea` both
locally and live. Thus the deployed UI exactly matches candidate `503fdcfb`.

GitHub latest release is `v0.1.6` and has macOS arm64/x64 DMGs, Windows MSI
and EXE, Linux AppImage and DEB, `SHA256SUMS`, and `latest.json`. A fresh
Linux DEB download verified against the published checksum:
`aa48ab4fa310750cdf4d0d5141d9f5392dad9f94d08ea5923b84b06854e20e43`.

## Defects by severity

None.

The existing operational caveat remains: the macOS and Windows installers are
unsigned, and the site discloses that fact.
