---
id: 204
title: The reading room in pixel art
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The neighbourhood reading room (`src/world/maps/reading-room/map.json`, 28×19, off the residential hall) still draws with the old isometric painter. The map-driven pixel pipeline can draw it as it draws the workshop ([[tickets/0182-workshop-pixel]], [[tickets/0201-workshop-benches]]) once it is registered, has a floor table and its kinds are drawn.

## Done when

- `reading-room` is registered in `OUTDOOR_MAPS` and `OUTDOOR_PIXEL_MAPS`; its feature (the two furnishing briefs, the native floor placement and the grid fallback), `map.test.ts` and its exit to the hall still work; `e2e/reading-room.spec.ts` passes headless and muted.
- Its `timber` floor has a `GROUND_SPECS` table.
- Its static kinds are drawn (`src/pixel/sprites/bldg/reading-room.ts`, `src/pixel/sprites/life/reading-room.ts`), and so are the run-time props the furnishing feature projects (shelves, table, chair, open book, sunlight, draft ghost), so nothing shows as a placeholder.
- The reading lamp glows (`interiorLights`).
- Renders at 3x before and after, at evening, and crops reviewed; `tsc -b`, `vitest run` and the Playwright specs pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker); branch `claude/0204-reading-room-pixel` from `origin/main`; worktree `/Users/callumhemsley/Personal/junyan-px-0204`; Playwright on ports 5226/5227.
- 2026-11-11: done.
  - Registration: `reading-room` is in `OUTDOOR_MAPS` and `OUTDOOR_PIXEL_MAPS`. The scene test lists it; the "not a pixel map" and "no outdoor pixel map" checks now use `residential-stairs`.
  - Floor: `GROUND_SPECS["reading-room"]` (`ground-reading-room-legend.ts`, tiles in `sprites/ground/reading-room.ts`):
    - basket-weave parquet in honey oak and walnut, with a replaced finger and a faint ink ring as variants;
    - a `reading-worn` band where the wax is worn pale along the walked paths (in from the door, along the front of the work bays, down the gap between them);
    - a dark border board where the parquet meets the dark beyond the walls.
    - `timber` and `reading-outside` have town-builder aliases.
  - Structure (`bldg/reading-room.ts`):
    - the back wall: limewash over walnut wainscot, a picture rail, a framed ink landscape, a clock with no numerals, a bamboo scroll, a blank programme card;
    - the west wall's cap and face, and the east partition's cap with pots;
    - the two tall green-framed windows with tied-back linen curtains; the broad one has an oak window seat with indigo and jade cushions, a bolster and an open book;
    - the tall bookcase against the back wall, and the west bookcase seen end-on (with its foreshortened face of spines);
    - the alcove's run-time shelves: tall at the back, `-low` in front;
    - the hall doorway with its fanlight and indigo door curtain;
    - the project desk with its cork notice board (blank cards, a ruled sheet with no names), newspapers on rods, a ledger, a date stamp and a pencil jar.
    - Books show coloured spines, never titles.
  - Furnishings (`life/reading-room.ts`):
    - the returns cart, the Swiss-cheese plant and the jasmine on its stand, the rug, the two jade-and-cream tiled inlays at the work bays, and the green-shaded brass standard lamp;
    - the run-time furniture: elm reading tables with green leather tops (`-30x15` / `-15x30`), bentwood chairs (frame = rotation), the open book on a finished table, the sunlight in a finished nook, and the draft ghost (`draft-<valid|blocked>-<w>x<h>`).
  - Light: `interiorLights` now takes a branch per map; the reading room adds a warm pool at the lamp's shade (`LAMP_LIGHT`).
  - Engine and view, each generic and each tested in `outdoor-runtime.test.ts`:
    - `runtimeProps` can pick a sprite for a projected prop's shape and state when the atlas has it (`<sprite>-<state>-<w>x<h>`, `<sprite>-<state>`, `<sprite>-<w>x<h>`), and a prop whose id extends another projected prop's sorts just in front of it (the book on its table);
    - `OutdoorView` takes the activity's `presentationFrame` and its measured area: `frameView` chooses the largest whole zoom at which the bay fits the free part of the screen and centres it there, with a free camera (`CameraInput.free`) that may look past the scene's edges;
    - `PixelView`'s canvas sets `data-rendered` after its first frame, as the painter's did.
  - `e2e/reading-room.spec.ts` projects through the pixel camera (`.pixel-reading-room[data-pixel-camera]`) instead of the isometric `frameCamera`/`project`. Frame points the old painter drew above the room's top edge (its taller window) count at that edge.
- Learned: an activity that frames part of a map needs the camera free of the scene's edges, or a small room centred on a wide screen pushes the bay under the panel. Projected props that change shape need per-shape sprites, which the atlas lookup in `runtimeProps` now gives.
- Checks:
  - `tsc -b`: clean.
  - `vitest run`: 932 of 933 passed. `world/characters/readability.test.ts` timed out under the full run's load once; it passes alone and with `src/world` (399 passed). `pixel/engine/renderer.test.ts`'s timing test flaked the same way once.
  - Playwright headless on ports 5226/5227: `reading-room.spec.ts` and `reading-targets.spec.ts` 11 passed, 1 skipped by the spec's own filter; `world-journey.spec.ts` and `pixel-town.spec.ts` 4 passed, 2 skipped by project filters. "restores an old save" timed out once in a parallel run and passed twice alone.
