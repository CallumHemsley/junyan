---
id: 157
title: Play the waiter loop in the new pixel cafe
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The cafe is redrawn as top-down pixel art (tickets 0149–0156) and composed as `src/pixel/scenes/cafe.ts`, but the playable game still renders the old isometric restaurant. Callum wants to play the new cafe.

## Done when

- Entering the restaurant in the real game renders the pixel cafe through `src/pixel/engine` (`PixelView`), with the waiter walking on cardinal keys, tap-to-move, collision from the scene.
- Customers appear seated at their tables from game state, the waiter shows `carry-*` while the tray holds food, served food appears on tables, the kitchen pickup and tables are the interaction points.
- All Chinese text stays DOM, positioned via the camera; no text in canvas.
- Rules tests and the existing browser journey pass, adjusted only where the camera change requires.

## Notes

- Owner: Claude worker (Opus). Branch `claude/0157-pixel-cafe-integration`; worktree `/Users/callumhemsley/Personal/junyan-px-integration`; port 5192 strict (preview 5193 for production journeys). Silent: no audio, headless browser only. Merged `claude/0149-pixel-art-foundation` twice: b348a61 (round-2 food and furniture), then 2b9a2e8 (the Shanghai bistro recomposition).

### Progress (2026-11-10)

- **One coordinate system.** `src/world/restaurant.ts` is re-authored in the cafe scene's tile units (22×14): the scene's walkable rect, its compiled colliders read from `src/world/pixel/cafe-colliders.json` (written by the new `node src/pixel/tools/colliders.ts cafe --out src/world/pixel/cafe-colliders.json`; rerun after recomposing the cafe), table props under their stable ids `table-5-9`…, the kitchen anchor at the `pickup` mark, a service spot beside each table, the `to-town` exit in the street door, the `from-town` entrance just inside it. All stable ids are unchanged, so game rules, saves and transitions work as before; the game's own abstract `TABLES`/`KITCHEN` positions were never tied to the map. `src/world/pixel/cafe-map.test.ts` fails if the scene's colliders, walkable rect or marks drift from the map.
- **Seam.** `src/world/pixel/maps.ts` (`isPixelMap`, `cardinalDirections`, `PIXEL_WALK_SPEED`; pure, also imported by Playwright helpers). `src/world/pixel/cafe.ts` (pure: the live scene without demo cast or leftovers, cook, seated customers from `restaurantPresence`, dishes from delivered orders, waiter actor, light mapping, tap destination, service facing). `src/world/pixel/CafeView.tsx` (thin React over `PixelView`). `WorldViewport` keeps all DOM UI, focus, targets, the path worker and the movement loop; on pixel maps it renders `CafeView` instead of the canvas, walks on the screen's axes at 3.2 tiles/s, and places the target cue with the camera's `toScreen`.
- **Cafe scene.** Only gameplay change (kept through the bistro merge): the previous customers' leftover food in `SETTINGS` carries ids `remains/table-N-i`, so the live game can leave it out (`liveCafe`); tools still render the scene exactly as before.
- **Engine.** `PixelView` redraws once when the view comes back on screen or the page becomes visible (a hidden canvas may be discarded). Tests 56/56.
- **Camera.** The zoom is chosen from the whole viewport (`portraitTiles: 9` on phones), so opening a panel never rescales the room. A phone bottom sheet shrinks the view to what stays visible; a desktop side panel offsets the focus by half its width. Under reduced motion the clock is frozen (no steam or flicker) and the canvas only redraws on change.
- **Food.** Up to three servings per table in per-table `DISH_SLOTS`, nearest the customer first, sorted with the table; once paid (`served`) the bun, youtiao and dumpling show their `-eaten` sprites.
- **Journeys.** `e2e/world-journey.ts` reads the published `data-pixel-camera` (after it holds still) to tap the cafe, and its pad fallback walks the cafe's axes; `overnight-keyboard` steers with cardinal arrows; two hard-coded old coordinates in `overlay-focus` and `startup-focus` moved to the cafe's; `scene-scheduling` also counts the pixel view's full-frame `putImageData`; `avatar-heading` (the isometric avatar artwork) now restores in the town, which that artwork still draws, and leaves the cafe through its door. New `e2e/pixel-cafe.spec.ts` plays the loop and writes screenshots.
- The isometric restaurant painter (`src/world/art/restaurant`, the restaurant branch of `painter.ts`, `restaurantCamera`) no longer draws anything in the game; its own tests use `src/world/art/restaurant/fixture.ts`. Removing it is follow-up work.

### Checks (2026-11-10, after the bistro merge)

- `pnpm exec tsc -b` clean. `pnpm exec vitest run`: 128 files, 815 tests passed (`src/pixel` 56/56).
- Headless Playwright against Vite on 5192 and a preview build on 5193, repo projects (desktop 1440×1000, iPhone 13): before the bistro merge, waiter, word-switch, overlay-focus, calm-ui, startup-focus, progression, scene-scheduling, avatar-heading, overnight-keyboard, overnight-phone, cumulative-earnings, neighbourhood, save, learning-help and pixel-cafe: 144 passed. After it, waiter, save, calm-ui, overnight-keyboard, overlay-focus, startup-focus, scene-scheduling, avatar-heading, word-switch and progression: 118 passed; pixel-cafe at 1440×900@2 and 390×844@3: 2 passed.
- Screenshots: `output/pixel/integration/{desktop,phone}-{1-start,2-kitchen-panel,3-carrying,4-served-panel,5-served}.png`.

### Known gaps

- Customers appear and leave seated; presence does not model walking in or out, so no customer walk.
- The chalkboard's `sign/board` mark has no DOM text yet (no content line for it).
- The waiter's tray sprite carries its own drawn steamer and soy milk, not the actual tray contents.

- Done 2026-11-10: merged to main with the pixel cafe (Shanghai bistro) and the 0158–0161 polish pass. Learned: art as deterministic code over one palette lets workers iterate by rendering PNGs headless; depth sorting of table items and seated actors needs explicit sortY.
