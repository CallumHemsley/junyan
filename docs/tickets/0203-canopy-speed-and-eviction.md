---
id: 203
title: Bake tree crowns faster and release maps the player has left
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

Follow-up to [[tickets/0200-prebake-map-art]]. The canopy generator was about 70% of all sprite baking: the park's and riverbank's crowns took 5–6 s per map in Node and about 9 s of worker time from the town. Every visited map's baked art and floor cache also stayed in memory for the whole session.

## Done when

- [x] `canopy` (`src/pixel/sprites/plant/_helpers.ts`) is rewritten for speed, and every sprite frame stays byte-identical. Hashes of all 1792 sprites' frames were pinned before the change and compared after.
- [x] The outdoor atlas releases the frames and caches of maps outside the current neighbourhood, and re-bakes them by prebake or lazily if the player returns. The cafe and ward atlases are untouched, and nothing a renderer is drawing is ever released.
- [x] Tests for both. The renderer frame-time test stays green.

## Notes

- Owner: Claude (worker in the overnight session). Branch `claude/0203-canopy-speed`, worktree `/Users/callumhemsley/Personal/junyan-px-0203`, Playwright ports 5220/5221.
- **Canopy, how.**
  - Per-clump cells and the crown's ownership live in typed grids over the crown's bounds. An insertion-order list stands in for the `Map`'s order, so seams come out in the same sequence.
  - Leaf drawings are parsed once.
  - The grids are module scratch buffers reused across calls, with generation stamps instead of clearing.
  - Overdraw is resolved inside the canopy against what the canvas held (new `Px.peek`, `Px.drawMode` and `Px.put` in the kit), so each pixel is written to the sprite once.
  - The sway frames share each clump's cells: they do not depend on the wind, which only shifts them, so a small cache keyed by everything else replays them for frames 2–4.
- **Canopy, verified.**
  - All 1792 sprites, every frame: 0 differ from the pinned hashes.
  - `canopy.test.ts` keeps the original Map-based canopy verbatim as a reference and checks the new one draws identical ink and alpha. It covers three foliages (odd-colour leaves, outlined leaves), two crown sizes, wind shifts 0/2/−3, normal, over and under modes, a clip, opacity, and art already on the canvas. A deliberate one-line mutation makes it fail.
- **Canopy, faster** (Node, `bakeSprite`):

  | Measure | Before | After |
  |---|---|---|
  | Whole registry | 12.9 s | 5.5–6.2 s |
  | Landscape tree, average (103 trees) | 81 ms | 31–35 ms |
  | `town/junction` | 406 ms | 76–89 ms |

  Per map, first-time bake through the atlas:

  | Map | Before | After |
  |---|---|---|
  | town | 2457 ms | 1070 ms |
  | courtyard | 420 ms | 198 ms |
  | rooftop | 120 ms | 110 ms |
  | park | 5902 ms | 2300–3300 ms |
  | riverbank | 5183 ms | 2759 ms |

  The machine was loaded (other workers running), so the ranges are honest spreads. What remains is the per-pixel lighting of the first frame of each crown, plus `Px.px`, `autoOutline` and `limb`/`barkCell` outside the canopy.
- **Release, how.**
  - The atlas gains `bakedBytes()`, `AtlasSprite.bytes()` and `release()`. The renderer gains `cachedBytes()` and `release()`, which drop the static floor cache, shadow mask and light buffers.
  - The engine's `releaseScenes(keep, drop)` frees the frames of every dropped scene's sprite that no kept scene draws. It never touches sprites outside every scene, such as characters and critters.
  - In `src/world/pixel/prebake.ts`, `prebakeAround(map)` now also records the neighbourhood (`keptMaps`: the map if outdoor, plus its neighbours) and queues `releaseAway` as the last idle task.
    - It reads the current map when it runs, never drops the map a view last drew, and resets a dropped map's prebake state so it bakes again when it becomes a neighbour.
    - Worker frames for a map the player has since left are dropped on arrival.
- **Release, measured.** Outdoor art over a walk (restaurant → town → park → riverbank → town → courtyard → town → workshop → town → restaurant). Each step bakes the neighbourhood and warms its floor caches, as prebake does; counts are frame buffers plus renderer caches:

  | Where the player is | Without release | With release |
  |---|---|---|
  | Back in the cafe | 231 MB | 57 MB |
  | Workshop | 231 MB | 69 MB |
  | Courtyard | 225 MB | 146 MB |
  | Peak (in the town, whose neighbourhood is almost every map) | 231 MB | 219 MB |

  Roughly half of every figure is the world-size static floor caches, not sprite frames.
- **Verification.** `pnpm exec tsc -b` clean. `pnpm exec vitest run`: 930/931 at load average 30; the one failure was `src/world/characters/readability.test.ts` hitting its 5 s timeout, and it passes alone in 1.4 s. Headless, muted Playwright `pixel-town`, `world-journey`, `waiter`: 14 passed, 2 skipped.
- **Follow-ups.**
  - The floor cache is a whole-world buffer per map (the town's alone is tens of MB). Caching it in screen-sized tiles, or only warming the current map, would halve the peak.
  - The remaining bake time is the crowns' first-frame lighting, and `limb`'s per-pixel `barkCell` object.
