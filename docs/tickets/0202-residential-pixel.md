---
id: 202
title: The residential hall and the apartment in pixel art
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The shikumen house's shared hall (`src/world/maps/residential/residential-hall.json`, 32×26) and the player's apartment (`apartment.json`, 30×26) still draw with the old isometric painter. Like the workshop ([[tickets/0182-workshop-pixel]]), their walls and furniture are props and their floors terrain, so the map-driven pixel pipeline can draw them.

## Done when

- Both maps are in `OUTDOOR_MAPS` and `OUTDOOR_PIXEL_MAPS` (`residential-stairs` stays on the old painter for its elevation); their features, tests and exits still work, and every furnishing the player can own draws in the pixel apartment.
- `e2e/avatar-heading.spec.ts` observes the old avatar on a map still drawn by the old painter, checking the same things.
- Ground tables for `terrazzo`, `timber`, `woven` and `glazed-tile`; structure in `src/pixel/sprites/bldg/residential.ts`, furniture and life in `src/pixel/sprites/life/residential.ts`; lamps and lanterns glow.
- Renders reviewed; `tsc -b`, `vitest run` and the Playwright specs that enter the hall or the apartment pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker), branch `claude/0202-residential-pixel`, worktree `/Users/callumhemsley/Personal/junyan-px-0202`, Playwright on ports 5222/5223.
- 2026-11-11: done. Both maps registered (registry and scene tests updated; town-builder stand-in aliases for the four materials). Owned furnishings: the old painter drew them from apartment state, not map props, so `furnitureProps(state)` (src/features/apartment/world.ts) projects each placement as a prop `apartment.furniture.<item>.<orientation>` (rug: `<size>-r<n>`) on its cells, `src/world/dynamic.ts` adds them to the apartment (now keyed on the whole apartment state, so a colour change redraws), and `runtimeProps` draws them; every item × orientation × rug size has a sprite in `life/residential.ts`, frame 0 blue, frame 1 cream (`src/world/pixel/residential-furniture.test.ts` checks the projection, every sprite and the game's map). `avatar-heading` now observes the residential stairs (still the old painter): restores on the hall landing, walks the diagonal there, and enters from the pixel hall expecting the stairs' north-facing entrance (direction 3), the same assertions as before. Ground: `ground-residential-legend.ts` + `sprites/ground/residential.ts` (terrazzo with brass strips, basket-weave parquet, rush matting with binding, glazed tile with a marble lip, and a dark fill past the walls). Structure: hall and flat walls with faces and caps, jambs and partitions, transomed doors (open and closed), windows with the neighbours' roofs, the stair rail, mailboxes, notice board, hanging lantern and wall sconce, marble sills, wall shelves. Life: shoe racks, umbrella stand, parcels, mats and the tea-corner rug, kitchen, folding screen, wardrobe, bookcase, sofa, washbasin, towel rail, coat hooks, morning sunlight. `interiorLights` gives the hall lantern, the sconce and the reading lamp a glow.
- Checks: `tsc -b`; `vitest run` 919 passed; Playwright desktop (5222/5223): avatar-heading ×6, apartment ×2, apartment-composition, reading-room ×4 (one viewport skipped by design), world-journey, progression, interface-theme, pixel-town ×2 all passed.
- Learned: `Px.line` with a fractional endpoint never terminates; round every computed coordinate. Node cannot import the feature folders (extensionless imports), so sprites import only `rules.ts`.
- Open: the hall bench's patchwork cushion sorts just behind the shared park bench and is hidden; owned lamps do not glow (run-time props carry no lights); the reading lamp is the workshop's shared bench lamp.
- 2026-11-11, round 2 (orchestrator review): (1) the furnishing being placed previews in the pixel room: `furnitureProps` adds the item at the draft cells (`….preview`, drawn with the item's own sprite by `runtimeProps`, 55% opacity through `runtimeFade` into `fade`) and a floor outline `apartment.furniture-outline.<w>x<h>.<valid|blocked>` (warm cream with corner marks / broken cool grey); the view sets `data-preview` for tests. (2) Owned lamps glow: `FrameState.lights` (engine: compiled once per array, halos included; `PixelView`/`Surface` pass them) fed by `runtimeLights`. (3) A `mat` lying on an object prop sorts just in front of it (`restsOn` in `src/pixel/world/scene.ts`), so the hall bench's cushion shows. Tests: preview, fade, outline sprites, lamp lights, cushion sort (`residential-furniture.test.ts`), run-time lights in `renderer.test.ts`; `apartment-composition` asserts the preview while placing (valid), its absence after confirming, blocked over the bed, and its absence after cancelling.

