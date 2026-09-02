# Independent verification 7 — Vault Cross Search

**Date:** 2026-09-02 UTC
**Work order:** `vault-cross-search-verify-7`
**Candidate / deployed main:** `8b627032af98d6f6db509bd6c41e0eb8036ca574`
**Live URL:** <https://vault-cross-search.sociobot.in>

## Verdict: PASS

The live static site is byte-for-byte the candidate production build, and the
published desktop release is `v0.1.5` from this repository main commit. No
release-blocking product defect was found.

## Required first read and demo

A cold desktop and 390 x 844 live visit answers the three required questions
in plain words on the first screen:

- **What it does:** “Find an entry across separate vaults.”
- **For whom:** “For people with several KeePass files who need one login
  without combining their vaults.”
- **What to do first:** the visible **Try it with sample data** action, with
  the adjacent outcome “Opens three sample vaults.”

That action enters `/?demo=1` in one click. It shows prefilled `acme`, two
owned `Work.kdbx` entries, a persistent “Demo — sample data…” banner, Reset
demo, and Start for real. On the live 390 px route, Ctrl+K focuses search; an
unknown record produces a useful recovery message; Reset restores six sample
records. The post-reset keyboard focus has a visible solid 3 px outline.

## Claims and local quality gates

`.factory/claims.json` exists and contains 35 claims. From a clean checkout
after `npm ci`, every exact `test` command declared there was run against its
specified demo/fixture entry point and passed. This includes demo isolation,
privacy and boundary checks; KDBX unlock/key-file/error recovery; metadata
exclusion and session-lock behaviour; desktop sample project, multi-vault and
keyboard paths; license states; and installer verification.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 65 packages installed; 0 vulnerabilities reported |
| `npm test` | PASS — 9 Vitest tests, 64 Playwright tests, and Rust core suite |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `dist/app` and `dist/site` produced |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | PASS |
| Production Vite budgets | PASS — site JS 7,441 B raw / 2,920 B gzip; site CSS 17,432 B raw / 4,150 B gzip; app JS 15,084 B raw / 5,410 B gzip |

The disposable base image initially lacked the Linux WebKit/GTK packages.
Installing the same `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`,
`librsvg2-dev`, and `patchelf` prerequisites used by the repository release
workflow allowed native compilation to proceed. An unmodified `npx tauri
build` also rejects this worker's `CI=1` as an invalid boolean; `CI=true npx
tauri build` is the correct invocation and matches GitHub Actions. Neither is
a source defect. The published GitHub Actions release run succeeded for the
supported platforms.

## Live deployment, privacy, accessibility, and caching

- Live `/` SHA-256 is `298f56af99a7b1696f8ae5357288f13aa01205839cbfd3544da3d2d3693a000f`, exactly matching `dist/site/index.html`. Live
  `main-DvlTy6jE.js` SHA-256 is `7aa5de159d4b7130b9b125ec00f32a32f3323306ab4d2562817a108bf59b7fca`, exactly matching the candidate asset.
- Live desktop and 390 px visits had no console errors or page errors. They
  have `lang=en`, the plain-language title, exactly one H1, and one main
  landmark. Playwright Axe found zero serious or critical findings in each.
- The complete live demo flow requested only `vault-cross-search.sociobot.in`.
  It made no third-party request on cold load. GitHub is contacted only after
  the explicit download action, as covered by `@claim:download-on-demand`.
- `/`, `/privacy/`, `/terms/`, and `/demo/` return 200; an unknown route
  returns HTTP 404. Responses send HSTS, `Referrer-Policy: no-referrer`,
  `X-Content-Type-Options: nosniff`, Permissions-Policy, and a restrictive
  same-origin CSP. Hashed JS/CSS are `max-age=31536000, immutable`; HTML is
  revalidated after 30 seconds.
- No product-owned server endpoint or sign-in endpoint exists. Checkout is
  intentionally unavailable, so there is no product request allowance to
  probe for 429/`Retry-After`.

## Desktop release verification

GitHub latest release is `v0.1.5`; its assets are two macOS DMGs, Windows EXE
and MSI, Linux AppImage and DEB, `SHA256SUMS`, and valid `latest.json`. A
fresh download of `linux-x64-Vault.Cross.Search_0.1.5_amd64.deb` passed
`sha256sum -c` against the published checksum
`b737d19fa6f8d47d82594add988d59dec8a881a9e380f2efe835c499dbdc1bf9`.

## Defects

None found. The remaining operational caveat is already disclosed: macOS and
Windows builds are unsigned until the operator supplies notarization and
Authenticode credentials.
