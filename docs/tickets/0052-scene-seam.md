---
id: 52
title: Let the renderer take a scene object and move the restaurant into one
status: todo
priority: high
type: chore
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] adds a second scene, the hospital ward. The restaurant's dressing is written directly inside the renderer's `bake` and `draw`, so a second scene has nowhere to go. This ticket opens a seam with no visible change: `createRenderer` takes a scene object, and the restaurant becomes the first one. It is PR 0052 in the plan `docs/plans/hospital-opening.md` (section PR 0052).

## Done when

- [ ] `createRenderer` in `src/scene/renderer.js` takes a scene object `{bake(api), draw(api, ...)}`.
- [ ] The restaurant dressing from `bake` (`:358-410`) and `draw` (`:417-441`) moves unchanged into a `restaurant` scene module.
- [ ] `src/scene/RestaurantScene.tsx` passes the restaurant scene. Its loop is unchanged: 30 fps cap, offscreen pause, redraw on change under reduced motion.
- [ ] `src/scene/render-evidence.mjs` and `src/scene/render-character-evidence.mjs` use the seam.
- [ ] Proof: restaurant frames over about 1 s are byte-identical before and after the change, captured by a script that a reviewer can rerun. The PR states the command.
- [ ] Unit tests: `src/scene/renderer.test.ts` stays green unchanged, including the elder pin at `:161`. Add a test that a stub scene's `bake` and `draw` are called.
- [ ] `pnpm test`, `pnpm build` and `pnpm test:e2e` are green.
- [ ] Live check: open the restaurant at phone 390x844 and desktop 1440x1000 and confirm it looks the same as before. Save screenshots to `/tmp/swarm-0052/worker-<n>/`.
- [ ] Perf budget: `bake` stays within 10% of about 22 ms and `draw` within 10% of 0.3 to 0.9 ms on the Mac.

## Notes

- Depends on: 0047.
- Owns: `src/scene/renderer.js`, `src/scene/renderer.d.ts`, `src/scene/renderer.test.ts`, `src/scene/RestaurantScene.tsx`, `src/scene/render-evidence.mjs`, `src/scene/render-character-evidence.mjs`, and a new restaurant scene module in `src/scene/`.
- Must not touch: `src/scene/record-demo.mjs` and `src/scene/renderer.visual.pw.ts` (0054 edits them), `src/App.tsx`, `src/content/`, `e2e/`. Do not change `characterFigure` or any character art.
- Ports: `JUNYAN_DEV_PORT=5310`, `JUNYAN_PREVIEW_PORT=5311`, strict. The existing visual evidence scripts use ports 5182 and 5186. Pass this ticket's ports instead.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D1. The opening uses the real rasteriser, not the SVG spike, so the art style does not change at the end card. This seam is its first step.
- Pointers: `src/scene/renderer.js:26-38` fixed 360x280 iso camera; `:344-413` `bake`; `:415-443` `draw`; `src/scene/RestaurantScene.tsx:20-99` loop and DOM overlay buttons.
