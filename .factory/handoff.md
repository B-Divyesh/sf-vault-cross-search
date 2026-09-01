# Vault Cross Search — verification 3 handoff

**Status: FAIL — candidate is not accepted.**

- Work order: `vault-cross-search-verify-3`
- Candidate: `5038b8a375e1a25a0ba31ede89d1c5c53510a300`
- Live URL: <https://vault-cross-search.sociobot.in>
- Full report: [`.factory/verification-3.md`](verification-3.md)
- Verified: 2026-09-01 UTC

## What was done

- Ran every `.factory/claims.json` command independently after the documented clean install: 25/25 passed.
- Ran `npm test`, typecheck, Rust format, strict Clippy, and the exact production build: all passed.
- Exercised live first-read/demo, normal and boundary queries, recovery, reset, storage isolation, desktop/mobile, keyboard, reduced motion, axe, console/page errors, and 404 behavior.
- Recorded outgoing requests and response headers; demo traffic stayed same-origin and GitHub was contacted only after the explicit download action.
- Confirmed live HTML/JS/CSS hashes match the candidate build.
- Confirmed the v0.1.1 four-platform release workflow succeeded and a downloaded Linux DEB matched both checksum manifests.
- Did not modify product code.

## Passing evidence

- First screen clearly states the job, audience, first action, and offers one-click sample data.
- Full tests: Vitest 9/9, Playwright 33 passed with one intentional project skip, Rust 15/15.
- Build: `dist/app` and `dist/site`; site JS 2.61 kB gzip, CSS 3.20 kB gzip.
- Live worker check: 628 ms, no console errors, and baseline semantic checks pass.
- Lighthouse mobile: 100 performance, accessibility, best practices, and SEO; LCP 1.66 s, CLS 0, TBT 0.
- Release checksum: `d7073eaea2c763e76ac517a7dbcd1fedfc0213dcf24be331663c0cf2a59fe41a`.

## Release-blocking defects

1. Public claims for optional key files, desktop keyboard search/open, `$19` one-time terms, and verified installers/checksums have no tagged claims. The desktop request-log claim test also omits the normal-use/license-control flow named by its sandbox.
2. The demo search receives keyboard focus but has no visible focus change.
3. Multiple controls and links on every checked mobile route are below the required 44 px target size.
4. Privacy, terms, and 404 lack skip links and the required product route shell. The footer also lacks Param Factory and build identity.

## Reproduce local gates

```sh
npm ci
npm test
npm run typecheck
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build
```

Then open <https://vault-cross-search.sociobot.in/demo/>, press `Ctrl+K`, and compare the search field before and after focus. At 390 px, inspect header/footer links and demo banner control bounds.

## Next steps

- Add the missing claim entries/tests and complete the privacy flow test.
- Add visible focus styling, 44 px targets, skip links, and the standard route shell.
- Rebuild, deploy, and repeat all claims plus independent live QA.

No prohibited service, app setting, secret, database, or non-`sf-vault-cross-search` resource was read or changed. The external billing endpoint was not contacted.
