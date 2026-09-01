# Vault Cross Search — repair 3 handoff

Status: repair, release, and live verification complete

- Work order: `vault-cross-search-repair-3`
- Failed candidate: `5038b8a375e1a25a0ba31ede89d1c5c53510a300`
- Verifier report: `bbeb0c05d0a3ab936af2d089e3e6e2967c4bb5b2` / [`.factory/verification-3.md`](verification-3.md)
- Release version: `0.1.2`
- Live URL: <https://vault-cross-search.sociobot.in>

## Repairs

- Registered and tested optional key-file unlock and recovery, desktop keyboard search/open, exact `$19` one-time pricing, and installer/checksum claims. The manifest now has 29 independently runnable claims.
- Expanded the desktop no-observation test through theme, license controls, fixture-backed search, result movement, and result opening. The complete demo privacy flow now includes leaving the isolated demo.
- Added a 3 px rust focus treatment around demo search. Its contrast against paper is `5.28:1`.
- Enforced 44 × 44 CSS-pixel targets across every visible interactive element on all public routes at 390 px.
- Added consistent skip navigation, product header/footer, route metadata, Param Factory credit, and `Build v0.1.2` identity to home, demo, privacy, terms, and 404.
- Changed browser tests to serve the production site build. The earlier dev server had hidden the static legal documents behind its fallback.
- Kept the Tauri 2 desktop artifact, static deployment class, local-only vault architecture, and existing visual system.

## Local verification

Commands run from the repository root:

```sh
npm ci
npm test
npm run typecheck
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build
sh -n site/public/install.sh
```

Results on 1 September 2026 UTC:

- Clean install: 65 packages, 0 vulnerabilities.
- All 29 `.factory/claims.json` commands passed independently.
- Full suite: Vitest 9/9, Playwright 40 passed with 6 intentional project skips, Rust 16/16.
- TypeScript typecheck, Rust format, and strict Clippy passed.
- Production build produced `dist/app` and `dist/site`.
- App JS: 14.04 kB raw / 5.16 kB gzip; app CSS: 11.99 kB raw / 3.43 kB gzip.
- Site JS: 6.37 kB raw / 2.66 kB gzip; site CSS: 12.85 kB raw / 3.36 kB gzip.
- Playwright axe reported zero serious or critical findings on home, demo, privacy, terms, and 404 in both desktop and 390 px projects.
- The 390 px target audit found no visible control below 44 × 44 CSS pixels. No checked route overflowed horizontally.
- Keyboard checks passed for skip links, demo `Ctrl/Command K`, desktop `Ctrl/Command K`, arrow movement, Enter opening, and dialog focus.
- Request logs stayed same-origin through the complete demo and normal desktop fixture flows. GitHub remained on-demand. No external billing request was made.
- Offline cached-license behavior passed. The app has no service worker claim and intentionally ships no background updater.
- Local worker URL check passed in 564 ms with no console errors, one H1, `lang=en`, a main landmark, alt text, and labeled buttons.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 2.0 s, CLS 0, TBT 0 ms.

## Release and deployment

- Repair commit `e7766b4dce200605785492e67b1480771dee6d46` is on `main` and is tagged `v0.1.2`.
- GitHub Actions release run [33552594183](https://github.com/B-Divyesh/sf-vault-cross-search/actions/runs/33552594183) completed successfully across macOS arm64/x64, Windows, and Linux.
- Release [v0.1.2](https://github.com/B-Divyesh/sf-vault-cross-search/releases/tag/v0.1.2) contains DMG, setup EXE, MSI, AppImage, DEB, `latest.json`, and `SHA256SUMS` assets.
- A downloaded Linux DEB reported package `vault-cross-search`, version `0.1.2`, architecture `amd64`.
- Its downloaded SHA-256 was `ced69d6ab4f6339cf7d899f9dcec76e810f04f2b029dbf74529854d586a774c6`, exactly matching both `SHA256SUMS` and `latest.json`.
- The live Linux detected-platform button resolved to the v0.1.2 AppImage asset, not a CORS-blocked latest-download redirect.
- Static deployment targeted only `sf-vault-cross-search` and reached `Ready` at the product URL.
- Live worker verification returned no console errors. Home, demo, privacy, terms, 404, robots, sitemap, and both installer scripts returned the expected status.
- A live 390 px reduced-motion smoke test found one H1 and one main landmark per page, no overflow, no sub-44 px targets, no console errors, and the designed 3 px search focus ring.
- Live internal-link crawling found no broken links. Unknown routes returned the designed 404 with HTTP 404.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 10 ms.
- Final built-site SHA-256 values are `8a0a5cc1…` home, `bba458d7…` demo, `bba1c922…` privacy, `bcd4b4c8…` terms, `664974e0…` 404, `3dde7190…` JS, and `6fde4cec…` CSS. Live copies were checked byte-for-byte against these outputs.

## Known gaps and operator action

- macOS and Windows bundles remain unsigned. Signing needs operator-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
- There is intentionally no auto-updater; updates remain explicit downloads from the release page.
- Billing verification used intercepted fixture responses. The external billing service was not contacted because it is outside this work order's resource scope.

No prohibited service, app setting, secret, database, or non-`sf-vault-cross-search` deployment resource was read or changed.
