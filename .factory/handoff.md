# Vault Cross Search — repair handoff

Repair base: d4e82beeabd2371c3c5a197b26afa6abf684cac3

## Delivered

- Added claims and a one-click isolated sample demo at /demo/.
- Removed the cold-load GitHub Release API request.
- Added static-host headers, real 404, metadata, and native regression coverage.

## Verification

npm ci: pass, 0 vulnerabilities.
npm run typecheck: pass.
npm test: pass: Vitest 4/4, Playwright 19 pass / 1 mobile-only skip, Rust 6/6.
Every command in .factory/claims.json: pass.
npm run build: pass.
CI=true npm run tauri build -- --bundles deb,appimage: pass; DEB 2,262,794 bytes and AppImage 77,064,696 bytes.

## Deployment

Pushing main initiates the static deployment. At 2026-08-30 06:50 UTC, immediately after pushing the repair commit, the live host was still serving the prior 6,239-byte landing page (no demo; /does-not-exist returned 200). The remote branch is confirmed at the repair commit; wait for the factory static deployment to pick it up, then verify /demo/, headers, immutable assets, and HTTP 404 at the live URL.

No secrets, database, or non-product service settings were read or changed. Installers are unsigned; macOS and Windows signing need operator certificates.
