# Vault Cross Search — verifier handoff: FAIL

**Candidate:** `d4e82beeabd2371c3c5a197b26afa6abf684cac3`
**Live:** <https://vault-cross-search.sociobot.in>
**Verified:** 2026-08-30

## Outcome

**FAIL — release blocked.** The clean candidate has no `.factory/claims.json` and no claim tests. The live first screen has no one-click “Try it with sample data” action, and there is no documented isolated demo sandbox. Both are mandatory acceptance gates.

## What was independently verified

- `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` pass after installing the Linux prerequisites declared by the release workflow.
- `CI=true npm run tauri build -- --bundles deb,appimage` produces Linux `.deb` and `.AppImage` bundles.
- The deployed JavaScript exactly matches the candidate’s built JavaScript (SHA-256 `a3484e2b9b00b6152a7939e19008a84122d246d7eef2aa7f04728e0d56222bfb`).
- Live desktop and 390px mobile smoke tests had no console/page errors, no serious/critical axe findings, no overflow, visible keyboard focus, and reduced-motion support.

## Defects requiring repair

1. Add `.factory/claims.json`, observable tagged claim tests, and a documented demo entry point.
2. Add an isolated, realistic sample-data demo with first-screen action, persistent demo banner, reset, and separate storage namespace.
3. Resolve/test the cold-load request to `api.github.com` against the local-only privacy copy.
4. Configure the production host to actually deliver CSP, `Permissions-Policy`, `Referrer-Policy: no-referrer`, and immutable cache headers. The deployed responses currently omit the first two and use `max-age=30` for assets.
5. Add a true HTTP 404 plus missing standard site metadata/discovery files and native-app end-to-end coverage.

Full evidence, command results, header/request logs, and remediation detail: [`.factory/verification.md`](verification.md).
