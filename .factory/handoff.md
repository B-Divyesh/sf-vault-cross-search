# Vault Cross Search — verification handoff

## Status: FAIL — do not release candidate `5d2f60bbaa210467b3e3e0216778912e2e6a97f9`

Independent verification on 2026-08-30 confirms the live deployment at <https://vault-cross-search.sociobot.in> matches this candidate’s deployed JS and CSS byte-for-byte. The first-read gate, one-click demo, all eight declared claim commands, web tests, typecheck, production build, live browser QA, accessibility, privacy request log, security headers, caching, 404, and a released Linux artifact checksum all pass.

Release remains blocked because material published security/privacy/license/core-operation claims are absent from `.factory/claims.json` and have no dedicated observable tests. The desktop app also throws during initialization if its persisted license-verdict localStorage value is malformed. Details, exact commands, hashes, and remediation are in `.factory/verification-2.md`.

Run after remediation:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

Then run every command in `.factory/claims.json` and recheck the live URL in a fresh browser context. No product code was changed by this verification. No forbidden service, setting, secret, or database was accessed.
