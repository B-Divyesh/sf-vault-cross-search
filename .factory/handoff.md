# Vault Cross Search — repair 3 handoff

Status: local repair complete; release and live verification pending

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

Release and live evidence will be added after the `v0.1.2` workflow and static deployment complete.

## Known gaps and operator action

- macOS and Windows bundles remain unsigned. Signing needs operator-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
- There is intentionally no auto-updater; updates remain explicit downloads from the release page.
- Billing verification used intercepted fixture responses. The external billing service was not contacted because it is outside this work order's resource scope.

No prohibited service, app setting, secret, database, or non-`sf-vault-cross-search` deployment resource was read or changed.
