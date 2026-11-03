---
id: 53
title: Build the hospital ward scene and its cast
status: todo
priority: high
type: feature
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] opens the game on a hospital ward, drawn by the same rasteriser as the restaurant so the style holds across the end card. The ward needs its own scene, two new poses (lying and seated in bed) and looks for the doctor, the nurse and 小姨. A hospital reads cold, so the room must be dressed warm and full. This ticket is PR 0053 in the plan `docs/plans/hospital-opening.md` (section PR 0053).

## Done when

- [ ] A `ward` scene module plugs into the 0052 seam. It has two beds, a window, a drip stand, a monitor and a door, and is dressed fuller than a bare room.
- [ ] The composition is designed for the fixed camera, which faces the back walls. Both beds and the door read at phone width.
- [ ] `characterFigure` gains a `lying` pose and a bed-seated pose. Bed-seated is the seated pose raised. Lying does not let hands or shoes poke through the bed, which the addBone point-transform prototype did.
- [ ] The doctor (王医生), the nurse, 老爷爷 and 小姨 have distinct looks.
- [ ] The elder pin at `src/scene/renderer.test.ts:161` (byte-identical to `eeeb18d`) passes unchanged. Restaurant frames stay byte-identical to the 0052 proof.
- [ ] An evidence sheet shows the ward with each cast member present, in each pose, at phone and desktop sizes.
- [ ] Unit tests: renderer tests for both new poses and for the ward scene's `bake` and `draw`.
- [ ] `pnpm test`, `pnpm build` and `pnpm test:e2e` are green.
- [ ] Live check: render the ward at phone 390x844 and desktop 1280x900 and 1440x1000. Save screenshots to `/tmp/swarm-0053/worker-<n>/` and record a short video of the idle loop.
- [ ] Perf budget: ward `bake` under 40 ms and `draw` under 2 ms on the Mac (phone is guessed 3 to 8 times slower).
- [ ] Review gate: this ticket changes what the player sees. Callum reviews the screenshots and the video before merge.

## Notes

- Depends on: 0052.
- Owns: a new ward scene module in `src/scene/`, `characterFigure` and the pose code in `src/scene/renderer.js`, `src/scene/renderer.d.ts`, `src/scene/renderer.test.ts`, and a new ward evidence script in `src/scene/`.
- Must not touch: the restaurant scene module from 0052 (except to read it), `src/scene/RestaurantScene.tsx`, `src/App.tsx`, `e2e/`.
- The accessory enum in `characterSchema` (`src/content/index.ts:43-48`) is a shared schema. Keep the ward cast's looks in the renderer and the ward scene, keyed by cast id. If the enum must change, that change is serialized and waits until 0050 has merged, because 0050 owns `src/content/index.ts` in the same wave.
- Ports: `JUNYAN_DEV_PORT=5312`, `JUNYAN_PREVIEW_PORT=5313`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D1. The ward uses the real rasteriser, not the SVG art from the spike.
- Pointers: `src/scene/renderer.js:51-148` `characterFigure`; `:75-128` accessory branches; `:26-38` camera. A working ward render prototype is at `/tmp/junyan-hosp/ward.mjs` if it still exists. The spike's SVG ward (`spikes/hospital-opening/art.js`, `shots/`) is the layout reference.
