---
id: 186
title: The rooftop garden in pixel art
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The rooftop garden (`src/world/maps/rooftop/map.json`, 48×36) still draws with the old isometric painter. The outdoor-map pipeline (PR 74, [[tickets/0176-outdoor-map-pipeline]]) makes it a registration away from the pixel engine; its architecture then needs drawing in the lane houses' language ([[tickets/0164-pixel-lane-buildings]]).

## Done when

- `rooftop` is registered in `src/pixel/world/maps.ts` (`OUTDOOR_MAPS`) and `src/world/pixel/maps.ts` (`OUTDOOR_PIXEL_MAPS`); the garden feature (its projected pots, shade and crates, its anchors and placement plan), its tests and its exit to the stairs still work.
- `src/pixel/sprites/bldg/rooftop.ts` draws `parapet`, `stairhead`, `stairs`, `water-tank`, `pergola`, `post`, `threshold-post`, `threshold-lintel`, `bamboo-screen`, `pipe`, `tool-bay`, `warm-window`, `worn-paving` and `weathering`, one `rooftop/<id>` sprite per prop.
- Full-map renders before and after and 3× crops of the stair hut and the pergola reviewed; `tsc -b`, `vitest run`, and the rooftop journeys plus `pixel-town` in Playwright pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker), branch `claude/0186-rooftop-pixel`, worktree `/Users/callumhemsley/Personal/junyan-px-0186`, Playwright on ports 5222/5223. The garden's small items (beds, pots, tools, tea table…) are another worker's, in `src/pixel/sprites/life/`.
- 2026-11-11: done. `rooftop` registered in both lists (registry tests updated: the unknown-map check now uses `park`). The garden projects its pots, shade and crates at run time, which the compiled scene cannot know, so `runtimeProps(mapId, props)` (`src/world/pixel/outdoor.ts`, test `outdoor-runtime.test.ts`) hands every map prop missing from the static JSON to `OutdoorView` as run-time props: sprite `<map>/<id>`, anchored on its footprint's bottom-centre, `frame = variant` (mod frame count), so one sprite per pot carries every growth and care state. The garden's placement plan (a DOM panel) laid its six sites out on isometric axes; it now uses the top-down axes the player sees, and `placement.spec.ts` checks the same ordering on the new axes. `avatar-heading` already observes the residential hall; no e2e relied on the rooftop's isometric painter. `src/pixel/sprites/bldg/rooftop.ts` draws the parapets (north with the neighbours' roofs beyond, south, and two north–south ones as coping plus a foreshortened face; pots, drying poles and airing quilts along them), the stair hut (a turned hip roof, its south wall, its east wall foreshortened with the door at the exit), its steps, the water tank on its stand, the tool bay, the pergola with a wisteria and dappled shade, its four posts, the garden threshold (posts and a lintel with a blank plaque and morning glory), the bamboo screen, deck pipes, the warm window, worn paving and weathering.
- Checks: `tsc -b`; `vitest run` 908 passed; Playwright (muted, headless, ports 5222/5223): `world-journey`, `pixel-town` (desktop and phone), `neighbourhood` (normal opening, which tends the rooftop garden), and `placement.spec.ts` through a throwaway config, all green.
- Learned: run-time map props need a frame convention to show state; `variant` as the frame index keeps the sprite contract per prop id.
- Open: the ground outside the parapets (the one-tile margin) draws as grass; the rooftop wants a "beyond the edge" material (neighbouring roofs or a drop) in the ground legend. Still placeholders for the garden worker: border-pot ×6, care-residue, care-soil, care-tray, central-shrub-island, compost, hose, loose-tools, orchard, south-climbers, sun-clock, tap-basin, tea-table, terrace-tree, trellis-bed (the `trellis-bed` id, not the kind), wash-bowl, and the run-time `garden-*` pots, shade and crates.

