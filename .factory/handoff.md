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

Pushing main initiates the static deployment. Verify /demo/, headers, immutable assets, and HTTP 404 at the live URL after deploy.

No secrets, database, or non-product service settings were read or changed. Installers are unsigned; macOS and Windows signing need operator certificates.
