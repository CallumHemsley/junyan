---
id: 150
title: Build the top-down pixel scene engine
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

The new art needs a renderer: tile layers, depth-sorted sprites and actors, contact shadows, light, a camera, and a way to look at scenes in Node and the browser.

## Done when

- Pure-TypeScript compositor renders a scene and actors to an RGBA frame, deterministic and tested without DOM.
- Scene format, camera with integer zoom, collision from sprite footprints, light map.
- React view, a silent dev harness (sprite gallery and walkable scene), and a Node scene-to-PNG tool.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0150-pixel-engine`; worktree `/Users/callumhemsley/Personal/junyan-px-engine`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.

### Progress (2026-11-09)

All twelve deliverables built; the status is left at `doing` for the orchestrator's review.

- `src/pixel/engine/`: `types.ts` (scene format), `atlas.ts`, `frame.ts` (blending), `scene.ts` (compile), `actors.ts`, `light.ts`, `camera.ts`, `collision.ts`, `renderer.ts`, `PixelView.tsx`, `index.ts`. Tests: `*.test.ts` plus `test-sprites.ts`.
- `src/pixel/scenes/{demo,index}.ts`, `src/pixel/registry.ts`, `src/pixel/harness.{html,tsx}`, `src/pixel/tools/render-scene.ts`.
- Checks: `pnpm exec vitest run src/pixel` gives 56/56; `pnpm exec tsc -b` is clean; a 480×270 frame composites in about 0.6 ms in Node. Headless Playwright on port 5191 (desktop 1440×900@2, phone 390×844@3): walking and collision work, and the console shows only the dev fallback warning.

### Decisions and what was learned

- **Units.** Everything authored is in continuous tile units (1 = 16 px). `[2.5, 6]` is the bottom-centre of cell (2,5), which is where a standing thing's anchor usually goes. Actors, marks, colliders and `toWorld` share this one space.
- **Tall tiles.** A tile-layer entry draws with its top-left on its cell, whatever its anchor. A 16×48 wall slice therefore goes in its own layer in row 0 and spills over rows 1–2. Layers draw in order, cells row by row.
- **Static cache.** It holds the floor prefix up to the first animated floor element, so the order stays exact. Shadows are merged into one mask per frame (max, not stacked), so overlapping table and stool shadows never go black.
- **Food on tables** needs `sortY` (a bowl sorts with its table's y), or it hides behind the table.
- **Light.** Multiplying by the light map alone washed out the shaft. A soft tone shoulder above 224 keeps the grain. Falloffs are quantised into 6 flat bands, checkerboarded only on a narrow seam in world space. A full Bayer dither read as speckle and broke the style bible.
- **Lamp gain.** The same lamp needs very different visibility by phase, so glows carry a per-phase gain (`GLOW_GAIN`: morning 0.5, night 2.2), while shafts are gated by `phases` (morning by default).
- **Actor warnings.** A wholly missing character warns once, not once per action and facing.
