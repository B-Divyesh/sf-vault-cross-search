# Vault Cross Search — review 1 handoff

**Status: FAIL.** This review made no product-code changes.

The complete independent report is [review-1.md](review-1.md). It records two blocking live defects:

- The advertised Sociobot checkout link returns HTTP 404.
- At 390 × 844, the demo’s initial screen does not yet show the search field or sample results.

It also records route-focus, mobile-Privacy navigation, plain-copy, and unlisted-claim findings.

## Verification performed

From a clean clone at `630fbc827ec8a6349553db3ccd1816f23781efc4`, after `npm ci --include=dev` and documented Linux Tauri prerequisites:

```sh
# All 30 exact commands declared in .factory/claims.json were run independently.
npm test
npm run build
```

Results: all declared claim commands passed; `npm test` passed (Vitest 9/9, Playwright 43 passed with 7 explicit desktop-only skips, Rust 16/16); and `npm run build` produced `dist/app` and `dist/site`.

The live site was checked in fresh 390px and desktop Chromium contexts, including demo isolation/reset/exit, request logging, 404, deep links, Back, link crawling, and Axe checks.

## Next step

Repair every finding in `.factory/review-1.md`, deploy the repair, and have a new reviewer rerun the full cold review. Do not treat passing local claim tests as a substitute for fixing the live checkout.
