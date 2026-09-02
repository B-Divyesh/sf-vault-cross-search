# Independent verification 6 — Vault Cross Search

**Date:** 2026-09-02 UTC

**Work order:** `vault-cross-search-verify-6`

**Candidate:** `223e6864b5bfdef9181c5ba45a8f7abf1ae286c4`
**Live URL:** <https://vault-cross-search.sociobot.in>

## Verdict: FAIL

The candidate is well-built in most respects, but it has two release-blocking contract violations: a false/uncovered privacy claim about clipboard writes, and no actual desktop-app sample-project flow.

## Required first-read and claims gate

Cold live first read at desktop and 390 × 844 answered all required questions in plain words:

- **What it does:** “Find an entry across separate vaults.”
- **For whom:** people with several KeePass files who need one login without combining vaults.
- **What to click first:** **Try it with sample data**, with the adjacent outcome “Opens three sample vaults.”

That action works in one click: `/?demo=1` prefilled `acme`, showed two owned `Work.kdbx` results, a persistent “Demo — sample data, nothing is saved to your real vaults” banner, Reset demo, and Start for real. At 390 × 844 the search input was at y=321 and the first result at y=403, both above the fold. Normal, no-match (`no-such-entry`), reset, and Ctrl+K keyboard recovery flows worked.

`.factory/claims.json` exists and declares 30 claims. After `npm ci` and the repository workflow's documented Linux Tauri prerequisites (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`), every one of the 30 exact commands passed. The first Rust claim cannot compile in a pristine minimal container before those documented system dependencies are installed because `glib-2.0.pc` is absent; its rerun passed after installation. This is an environment prerequisite, not a product-test failure.

## Local verification

| Check | Result |
| --- | --- |
| `npm test` | PASS — 9 Vitest, 50 Playwright passed, 10 explicit desktop-project skips, 16 Rust tests |
| `npm run typecheck` | PASS |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | PASS |
| `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` | PASS |
| `npm run build` | PASS — `dist/app` and `dist/site` produced |
| Static site budget | PASS — 7,441 B JS raw / 2,920 B gzip; 15,975 B CSS raw / 3,910 B gzip; fonts 109,604 B |
| Linux release runtime | PASS smoke launch — verified DEB ran under Xvfb for eight seconds without process crash (timeout expected) |

The Rust claim suite exercises KDBX unlock, optional key files and invalid-key recovery, metadata-only indexing, lock-all/per-vault/timeout/quit clearing, and associated-app ownership. The desktop webview fixture exercises normal multi-vault search, keyboard result selection, and opening the selected owner.

## Live deployment, privacy, accessibility, and release checks

- Live `/` body SHA-256 matches candidate `dist/site/index.html`: `c236ee4842254737e62186dda7b83f1dc6bd23507276d760dbfded4df6951454`. Live JS and CSS SHA-256 also match candidate build assets.
- Live routes `/`, `/?demo=1`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, `robots.txt`, and `sitemap.xml` returned 200. An unknown route returned the designed page with HTTP 404.
- Cold valid-route loads at desktop and 390px had no console/page errors, no horizontal overflow, one H1, one main landmark, `lang=en`, correct titles, visible focus, reduced-motion setting, and heading focus after Privacy navigation and Back. The first Tab focus was the visible Skip to content link with a solid 3px outline.
- Independent Axe runs found zero serious/critical violations on home, demo, Privacy, Terms, and 404 at both desktop and 390px.
- Independent live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100.
- Demo home/search/reset/exit and legal-route request logs contained only same-origin requests. The landing page made no GitHub request until Download was clicked; an intercepted live click made exactly one `api.github.com` release request. This matches the adjacent disclosure.
- Live responses send HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, restrictive CSP, `Permissions-Policy`, and immutable one-year cache headers for hashed JS. HTML is revalidated at 30 seconds.
- GitHub latest release is `v0.1.4`; it includes macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and valid `latest.json`. Downloaded Linux DEB SHA-256 was `4ced66e6a8cc2b21baa723d26deff2b91ac28be89f8a66ca4993b114c86451c6`, exactly matching `SHA256SUMS`; package metadata reports `vault-cross-search` 0.1.4 amd64. The tag is older than the candidate, but the candidate differs from it only in factory evidence/handoff files, not shipped product code.

No product-owned server endpoint exists. The external Sociobot license-verify service was not rate-probed: it is outside the product-owned resource scope and no documented per-client allowance is present in the candidate. Therefore no 429/`Retry-After` allowance can be confirmed for that shared external service.

## Defects

### V6-1 — BLOCKING — “No clipboard writes” is false and its claim coverage excludes the page that contradicts it

**Location:** live landing Privacy facts: “No clipboard writes”.

**Evidence:** the live landing contains two `button[data-copy]` controls. In a browser context with clipboard permission, clicking the first wrote `curl -fsSL https://vault-cross-search.sociobot.in/install.sh | sh` to `navigator.clipboard`; source `site/main.ts` calls `navigator.clipboard.writeText(...)`. The related `no-secret-actions` claim inspects only the desktop code and does not list or test the landing-page statement.

**Impact:** this is a directly contradicted visitor-facing privacy claim and an unlisted claim under the claims contract. Whether the copied text is secret does not make the unqualified sentence true.

**Required remediation:** either change the statement everywhere to the precise, supportable “The desktop app never copies secret values” and test that statement, or remove the copy controls. Add claim coverage for the final visitor-facing wording.

### V6-2 — BLOCKING — The shipped desktop app has no required one-click sample-project experience

**Evidence:** the installed app's first state offers only “Add your first vault” and an operating-system file picker. `src/main.ts` contains no sample/demo/load-project action; there is no bundled sample KDBX or `examples/` input. The browser demo explicitly says it has “no file picker or desktop connection,” so it cannot exercise the installed desktop product. The landing also contains one hero illustration rather than the required 3–5 captioned desktop walkthrough frames.

**Impact:** the desktop-app demo-sandbox contract requires “Load sample project” in the first-run screen, shipped sample data, and a walkthrough. A user cannot try the real desktop job without supplying a real vault, so the candidate does not meet the desktop end-to-end demo requirement.

**Required remediation:** bundle fake KeePass sample vaults and provide a first-run **Load sample project** action in the Tauri app that opens them in an isolated session; add an end-to-end native/UI claim for it, and add 3–5 captioned actual-app walkthrough frames to the landing page.

## Handoff condition

Do not release this candidate until V6-1 and V6-2 are fixed and the full claims and live verification are repeated.
