# Vault Cross Search — visual thesis

## Direction: topographic cartography

Vaults are separate territories. Search is the act of finding one landmark without flattening those boundaries. The interface therefore borrows the precision of field maps: contour lines, coordinate-like labels, an inked locator mark, and a restrained paper-and-night palette. This is explanatory decoration, not adventure cosplay: contours group independent vaults, while a bright survey pin marks the current result.

## Tokens

- Light — `paper #F4F0E6`, `paper-raised #FBF8F0`, `ink #16251F`, `muted #53655C`, `line #B9C5B9`, `pine #205C46`, `signal #A84324`, `success #26734D`, `warning #8A5A12`, `danger #A43832`.
- Dark — `night #0D1713`, `night-raised #14231C`, `chalk #EDF1E8`, `muted #AAB8AE`, `line #3C5046`, `pine #75C09D`, `signal #F08A62`, with status hues raised for readable contrast.
- Type — self-hosted **Atkinson Hyperlegible** for UI and prose (highly differentiated letterforms); system `ui-monospace` for coordinates, vault labels, URLs, and numeric counts. One font family file plus a system companion keeps the payload small.
- Scale — 14, 16, 20, 28, 44, 64px. Body is 16px minimum. Measure tops out at 68 characters.
- Spacing — a 4px base with 8, 12, 16, 24, 32, 48, 64px steps. Controls are at least 44px; dense search rows remain 56px tall.
- Shape — 2px map-rule borders, 10–18px radii, clipped corners used sparingly for survey labels. Shadows are short and earthy rather than glossy.

## Layout and interaction grammar

The desktop app is a two-territory workbench: a narrow vault rail and a broad search field. On phones it becomes a vertical expedition log; secondary metadata collapses but vault ownership never does. The primary sequence is always visible: add vault → unlock → search → open in KeePassXC. `⌘/Ctrl+K` focuses search, arrows traverse results, Enter opens, Escape clears, and `⌘/Ctrl+L` locks everything.

Layers have meaning: paper is passive, raised paper is actionable, pine signals an unlocked boundary, and the rust-orange survey pin signals the selected destination. Empty, locked, loading, offline-license, and error states each name the next action.

## Motion

UI transitions take 160–240ms and animate only opacity and transform. Search results arrive with one short upward settle; the selected survey pin moves from its prior row. There is no ambient looping. Under `prefers-reduced-motion: reduce`, all movement is removed and state changes use immediate opacity/color changes.

## Original asset plan and prompt sheet

One generated hero illustration is used on the download site: an oblique paper topographic map containing three separate terrain islands, each holding a small sealed archival vault, with a single rust-orange survey beam connecting only their public label markers. It clarifies separation plus federated recall without implying that passwords leave the device.

Prompt sheet:

- Use case: `stylized-concept`
- Asset: wide landing-page hero, designed to crop safely to mobile.
- World: tactile topographic field map, three discrete landmasses with generous water/negative space.
- Materials: embossed recycled paper, ink contour lines, tiny brass survey pins, matte stone vault doors.
- Light/lens: soft raking dawn light, slightly oblique orthographic view, quiet and precise.
- Palette words: parchment, deep pine ink, lichen, charcoal, one restrained rust-orange locator accent.
- Negative list: no people, no screens, no readable text, no logos, no brand symbols, no padlocks floating in space, no neon gradients, no watermark, no photoreal credential data.

Final prompt: “A wide editorial illustration for a privacy-first desktop utility: an oblique tactile topographic field map made of embossed recycled paper, three clearly separate terrain islands divided by blank paper channels, each island containing a small matte-stone archival vault entrance. Fine deep-pine contour lines and tiny brass survey markers; one restrained rust-orange locator beam touches only simple blank label markers across the islands, never the vault interiors. Soft raking dawn light, precise calm cartographic composition, generous negative space, parchment, deep pine, lichen, charcoal palette. No people, no screens, no readable text, no letters, no logos, no brands, no floating padlocks, no neon gradient, no watermark.”

## Asset provenance

The hero is generated specifically for this product using the factory image deployment (OpenAI image model through Azure AI Foundry), 2026-08-28. Source PNG and prompt sidecar live in `assets/src/`; optimized WebP/AVIF derivatives live with the site. The 1200×630 social card is a center crop of the same generated source, exported locally on 2026-08-30. Generated imagery is disclosed in the footer. Icons and the locator mark are original inline SVG/CSS geometry authored in-repository under the project MIT license.

## Accessibility and themes

Both light and dark themes are first-class and follow the OS by default, with an explicit toggle. Text combinations are selected for WCAG AA (4.5:1 minimum); state always includes a word or icon, not color alone. Focus uses a 3px signal-orange outline plus offset. The illustration has concise alternative text; purely decorative contours are hidden from assistive technology.
