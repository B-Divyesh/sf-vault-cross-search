# Independent verification — FAIL

**Candidate:** `d4e82beeabd2371c3c5a197b26afa6abf684cac3`
**Live URL:** <https://vault-cross-search.sociobot.in>
**Verified:** 2026-08-30 (clean checkout)

## Decision

**FAIL — do not release this candidate.** The required claims contract and one-click isolated demo are absent. Either item is release-blocking under the factory acceptance contract.

## First-read test

Opened the live home page in a fresh browser context at 1440 × 900. It says it searches several separate local KeePass vaults and lets a user download the desktop application. It is intended for people who keep credentials in separate KeePass databases. The first apparent action is an OS-specific download.

It does **not** offer the required one-click **“Try it with sample data”** action, nor any sample-data sandbox. `/demo` is not present in the source and `.factory/demo.md` is absent. This fails the plain-words/demo-sandbox first-screen gate.

## Mandatory claim-test gate

**FAIL.** `.factory/claims.json` is missing from the clean candidate (`git ls-files .factory` contains only `brief.json`, `design.md`, and `handoff.md`). Therefore no required, tagged observable claim tests exist and none could be run from a demo entry point. Per the claims contract, this alone blocks release.

## Findings

### Release blockers

1. **Missing claims contract and claim tests.** No `.factory/claims.json`; no test proves the advertised local-only, auto-lock, metadata-only, or installer claims.
2. **No one-click demo sandbox.** The landing page lacks “Try it with sample data”; no `/demo`/`?demo=1`, sample data, persistent demo banner, reset flow, separate demo storage namespace, or `.factory/demo.md` exists.
3. **Live privacy posture conflicts with the local-only presentation.** A cold load sends a request to `https://api.github.com/repos/B-Divyesh/sf-vault-cross-search/releases/latest`. It is used to resolve downloads and contains no vault data, but it is a third-party network request on every fresh landing-page load. This must be explicitly disclosed and tested, or avoided/cached in a way consistent with the privacy copy. The existing “0 bytes sent to our servers” line is too narrow to establish the broader local-only promise required by the claims policy.
4. **Production security/caching headers are missing.** Live responses omit CSP, `Permissions-Policy`, and the configured `Referrer-Policy: no-referrer`; live assets return `Cache-Control: public, must-revalidate, max-age=30`, not the repository’s intended immutable one-year asset policy. This means `site/public/_headers` is not being applied by the deployed host.

### High severity

5. **No real 404.** `GET /does-not-exist` returns HTTP 200 and the home page (6,239 bytes), rather than a designed 404 response. There is no `404.html` or deployment route configuration.
6. **Required site metadata/discovery files are absent.** No canonical URL, Open Graph/Twitter image metadata, favicon declarations, `robots.txt`, or `sitemap.xml` were found. The landing page also has no visible Demo navigation/action.

### Coverage and release observations

7. The shipped Playwright suite tests the download site only. It does not drive the Tauri UI through unlock/search/invalid-password/recovery/session-lock flows, and cannot substitute for the missing sample sandbox.
8. The worker environment exported `CI=1`; direct `npm run tauri build` fails because Tauri 2.11.4 passes that as invalid `--ci 1` (it accepts `true|false`). With `CI=true`, which is the usual GitHub Actions value, the Linux `.deb` and `.AppImage` package build succeeds after normal Linux dependencies are installed. This is an environment compatibility note, not the decision basis.

## Local verification

Installed dependencies with `npm ci` (0 npm audit vulnerabilities), then installed the Linux dependencies declared by `.github/workflows/release.yml` for the Tauri test/build.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | Vitest 4/4; Playwright 7 pass, 1 intended project skip; Rust 4/4 |
| `npm run typecheck` | PASS | `tsc --noEmit` clean |
| `npm run build` | PASS | Produces `dist/app` and `dist/site` |
| `CI=true npm run tauri build -- --bundles deb,appimage` | PASS | Linux `.deb` and `.AppImage` produced |
| shell installer syntax | PASS | `sh -n site/public/install.sh` |

Build output budgets: app JS 13.74 KB raw / 5.06 KB gzip; app CSS 11.84 KB raw / 3.40 KB gzip; site JS 2.46 KB raw / 1.15 KB gzip; site CSS 7.58 KB raw / 2.42 KB gzip.

## Live deployment verification

The live JavaScript is the candidate build, not a stale deployment: SHA-256 for both live `/assets/index-CBSbPFDS.js` and local `dist/site/assets/index-CBSbPFDS.js` was `a3484e2b9b00b6152a7939e19008a84122d246d7eef2aa7f04728e0d56222bfb` (2,458 bytes).

| Check | Result |
| --- | --- |
| Live home, privacy, terms | HTTP 200; page titles, one `h1`, and `main` present |
| Desktop and 390px mobile | No horizontal overflow; primary download link visible |
| Console/page errors | None during cold loads |
| Keyboard | Skip link and successive interactive controls reachable with visible solid focus outlines |
| Reduced motion | Browser context matched `prefers-reduced-motion: reduce`; no motion failure observed |
| axe-core | 0 serious/critical issues on home, privacy, and terms in both viewports |
| Outgoing requests, home | Same-origin fonts/CSS/JS/image plus `api.github.com` release API request |
| Response headers | HSTS and `X-Content-Type-Options` present; CSP/Permissions-Policy absent; document and asset cache max-age only 30 seconds |

No product-owned server API was identified. The only runtime product API in source is the external Sociobot billing verification/checkout endpoint, which was not contacted for rate-limit probing because this work order explicitly prohibits connecting to non-`sf-vault-cross-search` resources. No documented allowance can therefore be confirmed; rate-limit testing is not applicable to the static site itself.

## Required remediation before re-verification

1. Add a complete `.factory/claims.json` and one independently runnable `@claim:<id>` test per published claim.
2. Implement and document `/demo` or `?demo=1` with realistic bundled sample vault metadata, isolated demo storage, banner, reset, and a first-screen “Try it with sample data” action.
3. Resolve the outbound GitHub request/privacy-copy mismatch and test the final request allowlist.
4. Configure the deployed host to send the intended CSP, referrer, permissions, and immutable hashed-asset cache headers; verify them at the live URL.
5. Add a real 404, standard route metadata/assets, robots, sitemap, and Tauri end-to-end coverage for normal, invalid, and lock/recovery flows.
