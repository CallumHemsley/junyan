---
id: 52
title: Let the renderer take a scene object and move the restaurant into one
status: done
priority: high
type: chore
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] adds a second scene, the hospital ward. The restaurant's dressing is written directly inside the renderer's `bake` and `draw`, so a second scene has nowhere to go. This ticket opens a seam with no visible change: `createRenderer` takes a scene object, and the restaurant becomes the first one. It is PR 0052 in the plan `docs/plans/hospital-opening.md` (section PR 0052).

## Done when

- [x] `createRenderer` in `src/scene/renderer.js` takes a scene object `{bake(api), draw(api, ...)}`.
- [x] The restaurant dressing from `bake` (`:358-410`) and `draw` (`:417-441`) moves unchanged into a `restaurant` scene module.
- [x] `src/scene/RestaurantScene.tsx` passes the restaurant scene. Its loop is unchanged: 30 fps cap, offscreen pause, redraw on change under reduced motion.
- [x] `src/scene/render-evidence.mjs` and `src/scene/render-character-evidence.mjs` use the seam.
- [x] Proof: restaurant frames over about 1 s are byte-identical before and after the change, captured by a script that a reviewer can rerun. The PR states the command.
- [x] Unit tests: `src/scene/renderer.test.ts` stays green unchanged, including the elder pin at `:161`. Add a test that a stub scene's `bake` and `draw` are called.
- [x] `pnpm test`, `pnpm build` and `pnpm test:e2e` are green.
- [x] Live check: open the restaurant at phone 390x844 and desktop 1440x1000 and confirm it looks the same as before. Save screenshots to `/tmp/swarm-0052/worker-<n>/`.
- [x] Perf budget: `bake` stays within 10% of about 22 ms and `draw` within 10% of 0.3 to 0.9 ms on the Mac.

## Notes

- Depends on: 0047.
- Done on 2026-11-03 against trunk 6c34555. `node src/scene/scene-frame-hashes.mjs /tmp/junyan-0052-trunk . /tmp/swarm-0052/perf/final-2` printed `200 frames, 0 differ; bake median trunk 15.507 ms head 11.375 ms; draw median trunk 0.837 ms head 0.831 ms` and exited 0. The first 30 frames hash to `27c76c1d6ef69d474067fe6aaafed198ecb85b3c18ab43169cb829c0cdefa4f6` at both, which `renderer.test.ts` pins.
- Live check: at 390x844 and 1440x1000 with reduced motion, after 开门迎客, the trunk and head dev servers return equal canvas data URLs and a clean console. Screenshots are in `/tmp/swarm-0052/worker-1/`. `render-evidence.mjs` and `render-character-evidence.mjs` write byte-identical PNGs at trunk and head (54 and 440 files).
- Learned: the bake median is noisy. With 10 samples it ranged from 12 to 27 ms. When both roots point at the same checkout, the two medians agree within 1%. In the trunk-against-head runs, head was never slower. The draw medians agree within 1%.
- Learned: `portraitScene` takes `COLORS` with the figure, because the eye filter compares colours by identity. With the head `COLORS` against the eeeb18d figure, the filter would never match and the rear-eye check would pass for no reason.
- Follow-up, not done here: a comment review suggested taking the restaurant palette from `docs/design/tokens.json` and turning the dressing's section comments into named helpers. Both are outside this zero-change move.
- Owner: Claude Code (autopilot-stack owner, took over from a stopped owner). Branch `claude/0052-scene-seam`, worktree `.claude/worktrees/agent-af2d6e670b50bd24f`, based on `claude/0047-opening-rules-docs` at 6c34555. Ports 5310 (dev) and 5311 (preview); the visual config keeps its fixed 5182 and 5186.
- Owns: `src/scene/renderer.js`, `src/scene/renderer.d.ts`, `src/scene/renderer.test.ts`, `src/scene/RestaurantScene.tsx`, `src/scene/render-evidence.mjs`, `src/scene/render-character-evidence.mjs`, and a new restaurant scene module in `src/scene/`.
- Must not touch: `src/scene/record-demo.mjs` and `src/scene/renderer.visual.pw.ts` (0054 edits them), `src/App.tsx`, `src/content/`, `e2e/`. Do not change `characterFigure` or any character art.
- Ports: `JUNYAN_DEV_PORT=5310`, `JUNYAN_PREVIEW_PORT=5311`, strict. The existing visual evidence scripts use ports 5182 and 5186. Pass this ticket's ports instead.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D1. The opening uses the real rasteriser, not the SVG spike, so the art style does not change at the end card. This seam is its first step.
- Pointers: `src/scene/renderer.js:26-38` fixed 360x280 iso camera; `:344-413` `bake`; `:415-443` `draw`; `src/scene/RestaurantScene.tsx:20-99` loop and DOM overlay buttons.
