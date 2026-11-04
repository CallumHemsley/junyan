---
id: 53
title: Build the hospital ward scene and its cast
status: doing
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

## Progress (2026-11-04)

- Owner: Claude Code (poteto-mode autopilot-stack owner). Branch `claude/0053-ward-scene` from `claude/0052-scene-seam`, restacked on its tip `b45586c`. Ports `5312`/`5313`; the visual config ran on its fixed `5182`/`5186`.
- Status: built and verified; awaiting Callum's review of `docs/design/review/0053-review-*.png` and `0053-review.mp4`. Done only after that review.
- Built: `src/scene/ward.js` (`wardScene`, `WARD_CAST`, beds, lying transform, motion bounds), `src/scene/ward-steps.js` (the fifteen variant A steps as `WardFrame`s, shared by tests, evidence and video), `src/scene/render-ward-evidence.mjs`, `src/scene/record-ward.mjs`, the `lying` pose and the `doctor`, `nurse` and `aunt` kinds in `characterFigure`.
- Learned: a flat blanket thick enough to bury lying hands also hides the head from this camera, because the camera looks down from the foot of the bed. Inclining the lying rig and its blanket by about 20 degrees, like a raised bed back, shows the face and keeps hands and shoes under the cover.
- Learned: the plan's `palette.accessory: FigureKind` narrowing would need edits to three existing lines in `renderer.test.ts`. `FigureKind` is exported and used by the ward types, and `palette.accessory` stays `string`, so the renderer test diff is additions only.
- Checks at the head: `pnpm test` 120 passed (7 files), `pnpm build` green, the visual config 8 passed on `5182`/`5186`, `pnpm test:e2e e2e/waiter.spec.ts e2e/scene-scheduling.spec.ts` 10 passed on `5312`/`5313`, and `node src/scene/render-character-evidence.mjs output/playwright/0053-character eeeb18d` exits 0.
- Restaurant: `node src/scene/scene-frame-hashes.mjs <parent b45586c> . <out>` reports 200 frames, 0 differ. Bake median 16.61 ms parent and 16.62 ms head, draw median 0.931 ms parent and 0.944 ms head.
- Ward perf: five runs of `render-ward-evidence.mjs` give bake medians 16.4 to 19.0 ms and draw medians 1.24 to 1.54 ms on the Mac. On the iPhone 13 profile with CDP CPU throttling at 6, 300 `doctor-zh` draws give p50 8.5 ms and p95 10.5 ms.
- Review fixes (2026-11-04, on top of `3fceb9e`): 王医生 turns 30 degrees toward the camera, and a new test pins at least two eye pixels on every face in every step (`1c0c8db`). The bedside food is warm (brown milk cap and lower jade band, golden egg and bread), sits on a cream cloth on the cabinet, and each item keeps its own slot when another is taken (`74277cb`). The stethoscope is one U loop with an off-centre chest piece instead of two straight tubes and a centred dot (`6445725`). The monitor shows a faint jade pulse trace under the moving blip (`0d346f0`). A warm rug covers the front floor and the third bed is a linen trolley with folded blankets and sheets (`80a16d8`). Review stills and video regenerated (`7c560c1`).
- Checks after the fixes, parent `b45586c`: `pnpm test` 127 passed (7 files), `pnpm build` green, the visual config 8 passed on `5182`/`5186`, full `pnpm test:e2e` 123 passed and 4 skipped (127) on `5312`/`5313`, `render-character-evidence.mjs ... eeeb18d` exits 0 with 40 exact elder comparisons, and `scene-frame-hashes.mjs` reports 200 frames, 0 differ (restaurant draw median 0.835 ms parent, 0.857 ms head). Ward perf over three runs: bake 18.2 to 22.5 ms, draw 1.25 to 1.37 ms.
- Not done: the plan's ten lanes ran as one owner script, not ten swarm lanes, and lane 1's browser `toDataURL` comparison is replaced by the node frame-hash proof above.
