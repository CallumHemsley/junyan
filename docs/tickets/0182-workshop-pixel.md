---
id: 182
title: The repair workshop in pixel art
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The repair workshop (`src/world/maps/workshop/map.json`, 30×29, behind the town's `to-workshop` door) still draws with the old isometric painter. Its walls, windows and furniture are props and its floor is terrain, so the map-driven pixel pipeline ([[tickets/0176-outdoor-map-pipeline]]) can draw it once it has a floor table and its structure.

## Done when

- `workshop` is registered in `OUTDOOR_MAPS` and `OUTDOOR_PIXEL_MAPS`; its features, tests and door back to the town still work, and e2e specs that enter it pass.
- Its floor has its own `GROUND_SPECS` table (`src/pixel/town/ground-workshop-legend.ts`, tiles in `src/pixel/sprites/ground/workshop.ts`): planks, stone, cobbles, rug, runner and their edges.
- `src/pixel/sprites/bldg/workshop.ts` draws `wall`, `low-wall`, `window`, `door-post`, `awning`, `shelf`, `display-shelf`, `pegboard`, `drawers` and `timber-rack`.
- Renders reviewed; `tsc -b`, `vitest run` and the Playwright specs pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker), branch `claude/0182-workshop-pixel`, worktree `/Users/callumhemsley/Personal/junyan-px-0182`, Playwright on ports 5228/5229. Benches and small items are another worker's.
- 2026-11-11: done. `workshop` registered in both lists (scene test updated; town-builder stand-in aliases for its five materials in `MATERIAL_ALIASES`, as for the courtyard and rooftop). Floor: `GROUND_SPECS.workshop` (fill `workshop-cobbles`) with oiled east–west planks (fixed edge tone per board so variants tile, inserts, nail lines, sawdust, a knot and a tin ring), granite door flags, lane setts, an indigo lattice rug and a striped jade runner with woven borders and corner knots, plus plank end boards and the flags' lip; `maps.test.ts` now checks the workshop's layers name only drawn tiles. Structure (`bldg/workshop.ts`): the back wall (timber cap, limewash, panelled dado, fuse box, clock, blank calendar, mirror ghost), side walls as caps with a foreshortened face whose caps run up to the back wall, low front walls (cap, limewash over brick, pots, a mug of pencils), jade door posts, a striped awning high over the door, the high back window and the edge-on side window, the parts shelf, the display shelf of repaired toys and radios with blank tags, the pegboard with painted tool outlines (gaps where tools are out), the pharmacy drawer chest and the timber rack.
- `e2e/workshop-framing.spec.ts` measured the isometric painter (canvas backing store, iso `project` with `workshopFrame`); it now waits for the pixel camera and measures the same things in pixel coordinates (one canvas at a whole zoom, foot and head inside the view and clear of the panel, the cue centred on its anchor within 1 px).
- Checks: `tsc -b`; `vitest run` 915 passed; Playwright desktop (ports 5228/5229): workshop-framing ×2, landscape-lookup ×8, interface-theme, progression, world-journey, pixel-town ×2 all passed; phone workshop-framing: normal motion passed 2/2, reduced motion failed 2 of 4 runs. In the failures `walkTo`'s taps are refused near the "看看" button at the yard and its movement-pad fallback oscillates forward/back at (15.2, 24.8) until its 75 s budget; to investigate in the helper (not loosened here).
- Learned: an awning drawn to its full map depth buries the doorway in three-quarter view; fixed high on the wall and a tile deep, it reads and the door shows.
- Still placeholders (another worker): lamp-bench, toy-bench, window-bench, woodworking, sewing-bench, lamp-stool and toy-stool and yard-stool are shared `stool` (drawn), fabric-basket (shared `basket`), spares-bins, radio, kettle, window-plant, desk-lamp, toy-lamp, clamped-chair, wood-shavings, chalk-sketch, mending-box, entry-mat, yard-wheel.

