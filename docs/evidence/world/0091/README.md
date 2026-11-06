# 0091 foliage craft — component study, ACTIVE

The production change is only `src/world/art/landscape/foliage.ts`. Its exports exactly match `docs/world-program/foliage-craft-v1.md`. Native foot is (0,0); caller retains `unit/18` scale, depth, contact/cast shadows, camera, culling, occlusion and terrain/colliders. No integration has been performed. World/0084 owns that adapter.

## Artwork and comparison

`native.png` is an actual 768×156 native-pixel comparison: old 52a4046 mature tree, broad camphor, leaning willow, open fruit tree. No generated image assets. Hand-placed canopy tufts have stepped contours, broken upper-left light planes, interleaving branch windows, and purposefully limited smaller leaf planes. Willow curtains have eleven authored unequal lengths with small injected-time sway. Fruit clusters are hand-placed and use a seed-selected one-pixel harvest placement. Camphor is intentionally a stable authored specimen regardless of seed.

`desktop.png`, `phone.png` and `evening.png` are isolated canvas study captures, **not the App, travel acceptance, integrated collision acceptance, or a whole-world visual claim**. Canvas scales are the production desktop15/phone11 units (foliage native scale `unit/18`), alongside the actual current player. Ground, path and pond are the unmodified production park renderer. New trees are evidence-only specimen positions; both feet and adjacent actor positions are checked against every production collider. Dashed lines expose actual pond collider rectangles; internal seams are diagnostics, not new routes. No shadow redesign or new contact/cast shadows were added by this module or harness.

Production reference: read-only `/workspace/junyan-audit-ready-art`, detached `1b42875`, approved ready-art composition containing atmosphere63a5803, landscape52a4046, rooftop2d22909. The old specimen is preserved verbatim in evidence-only `old-52a4046.ts` from `git show 52a4046:src/world/art/landscape/draw.ts`. `study.ts` imports reference camera/actor/ground/atmosphere functions via Vite `/@fs`; reference checkout must exist there for reproduction. Morning and evening both use production `sampleAtmosphere` → `colorShader` passed explicitly into `drawFoliage`.

## Contract evidence

`checks.json` is captured in Chromium by `capture.mjs`. Three species pass equal-input determinism, reduced-motion pixel equality across elapsed0/99999, full pixel bounds containment sampled every170ms through14s (including willow sway), inherited `globalAlpha=.5`, transform preservation and one shade callback per unique base material (8 camphor/willow,10 fruit). Bounds include all roots and seed-selected fruit positions. Alpha is preserved as normal canvas source-over drawing; overlapping authored spans accumulate opacity, as in the existing procedural artwork. This does not promise isolated-group opacity.

Initial measured mean of1000 direct draws/species: camphor0.286ms, willow0.348ms, fruit0.255ms in cloud system Chromium, a component microbenchmark rather than a phone GPU/frame-budget guarantee. Existing camera culling must be retained. No console/page errors in final capture.

Run from `/workspace/junyan-0091` with Node22:

```sh
/workspace/.junyan-tools/node_modules/node/bin/node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5499 --strictPort
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0091/capture.mjs
/workspace/.junyan-tools/node_modules/node/bin/node node_modules/typescript/bin/tsc --noEmit
```

TypeScript passes. Build/rules results are recorded in the ticket after completion. Root/coordinator must judge the authored study before0084 consumes it; foundation current-head integrated capture remains a separate requirement. No full App journey was claimed for this source-only seam.
