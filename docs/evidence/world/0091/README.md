# 0091 foliage craft — component study, ACTIVE

The production change is only `src/world/art/landscape/foliage.ts`. Its exports exactly match `docs/world-program/foliage-craft-v1.md`. Native foot is (0,0); caller retains `unit/18` scale, depth, contact/cast shadows, camera, culling, occlusion and terrain/colliders. No integration has been performed. World/0084 owns that adapter.

## Artwork and comparison

`native.png` is an actual 768×156 native-pixel comparison: old 52a4046 mature tree, broad camphor, leaning willow, open fruit tree. No generated image assets. Hand-placed canopy tufts have stepped contours, broken upper-left light planes, interleaving branch windows, and purposefully limited smaller leaf planes. Willow curtains have eleven authored unequal lengths with small injected-time sway. Fruit clusters are hand-placed and use a seed-selected one-pixel harvest placement. Camphor is intentionally a stable authored specimen regardless of seed.

`actual-phone-{old,camphor,willow,fruit}.png` and `actual-desktop-{old,camphor,willow,fruit}.png` show one specimen and the actual current player at the App's display scale. The harness calls production `cameraForMap` with the exact `WorldViewport.tsx` half-resolution backing rule (lines72–74 in1b42875): phone CSS390×620 / backing195×310 / scale11; desktop CSS1120×640 / backing560×320 / scale15. The CSS displays these canvases2×, giving effective22/30 CSS pixels per world unit. Insets are0 because this component harness has no interaction panel. Projection and returned camera, viewport, foot, actor and radius are serialized in `checks.json`. The radius-aware production `canStand` passes for every actor (radius.22) and specimen foot (conservative radius.5).

`desktop.png`, `phone.png` and `evening.png` remain **reduced-scale** comparison sheets (single backing/CSS pixel ratio, units15/11). The original WIP mislabeled these as production scale; review caught the missing2× canvas display step and the new actual-scale views correct that claim. `native.png` remains actual native pixels. `contract.png` shows silhouettes/bounds and inherited alpha. All are isolated canvas study captures, **not the App, travel acceptance, integrated collision acceptance, or whole-world visual acceptance**. Ground, path and pond are the unmodified production park renderer. New trees are evidence-only specimen positions. Dashed pond collider rectangles on comparison sheets are diagnostics, not new routes. No shadow redesign or new contact/cast shadows were added by this module or harness.

Production reference: read-only `/workspace/junyan-audit-ready-art`, detached `1b42875`, approved ready-art composition containing atmosphere63a5803, landscape52a4046, rooftop2d22909. The old specimen is preserved verbatim in evidence-only `old-52a4046.ts` from `git show 52a4046:src/world/art/landscape/draw.ts`. `study.ts` imports reference camera/actor/ground/atmosphere functions via Vite `/@fs`; reference checkout must exist there for reproduction. Morning and evening both use production `sampleAtmosphere` → `colorShader` passed explicitly into `drawFoliage`.

## Contract evidence

`checks.json` is captured in Chromium by `capture.mjs`. Three species pass equal-input determinism, reduced-motion pixel equality across elapsed0/99999, full pixel bounds containment sampled every170ms through14s (including willow sway), inherited `globalAlpha=.5`, transform preservation and one shade callback per unique base material (8 camphor/willow,10 fruit). Bounds include all roots and seed-selected fruit positions. Alpha is preserved as normal canvas source-over drawing; overlapping authored spans accumulate opacity, as in the existing procedural artwork. This does not promise isolated-group opacity.

Latest measured mean of1000 direct draws/species: camphor0.295ms, willow0.340ms, fruit0.248ms in cloud system Chromium, a component microbenchmark rather than a phone GPU/frame-budget guarantee. Existing camera culling must be retained. No console/page errors in final capture.

Run from `/workspace/junyan-0091` with Node22:

```sh
/workspace/.junyan-tools/node_modules/node/bin/node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5499 --strictPort
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0091/capture.mjs
/workspace/.junyan-tools/node_modules/node/bin/node node_modules/typescript/bin/tsc --noEmit
```

TypeScript passes. Standard Vite production build passes (existing chunk-size/Zod annotation warnings); existing rules suite passes308/308 tests in26 files. An initial custom `/tmp` output directory failed the existing build plugin's hardcoded `dist` scan; rerunning the unmodified standard build succeeded. Build checks the existing App regression; the new module is exercised through the evidence harness and TypeScript because integration is intentionally pending. Root/coordinator must judge the authored study before0084 consumes it; foundation current-head integrated capture remains a separate requirement. No full App journey was claimed for this source-only seam.

## Player-behind-canopy follow-up

Root accepted the authored direction and authorized0084's bounded integration trial after inspecting corrected actual-scale views. The measured fade gate is documented in `fade-report.md`, with12 actual-actor screenshots and `fade-checks.json`. Direct per-span source-over alpha is materially higher than requested; caller-side whole-object isolation is recommended for the integration trial. No production change was made by this follow-up. Actual App fade/culling/casts/DPR cost remain0084's integration work.
