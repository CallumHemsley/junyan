---
id: 200
title: Bake the next map's art before the player gets there
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

Sprites bake lazily on first use (`src/pixel/engine/atlas.ts`), and each outdoor map's renderer was built on the first visit (`src/world/pixel/OutdoorView.tsx`). The park and riverbank have about 110 tree crowns each, so the first step onto them froze the game for seconds while every sprite baked at once.

## Done when

- [x] First-frame cost per map measured (Node and headless Chromium), split into scene compile, sprite baking and floor cache.
- [x] The stall is gone without changing art: neighbouring maps compile in idle slices and their sprites bake in a worker while the player is next door. Renders are byte-identical.
- [x] Tests: the idle scheduler on a fake clock; pre-baked frames are the bytes lazy baking makes, and a map renders byte-identically from either. The renderer frame-time test stays green.

## Notes

- Owner: Claude (worker in the overnight session). Branch `claude/0200-prebake-map-art`, worktree `/Users/callumhemsley/Personal/junyan-px-0200`, Playwright ports 5220/5221.
- **Measured before** (cold first frame = compile + bake + floor cache and composite):

  | Map | Node bake | Chromium cold first frame | Compile | Bake | Floor cache and composite |
  |---|---|---|---|---|---|
  | cafe | 86 ms | 80 ms | 11 | 17 | 6 |
  | ward | 21 ms | 21 ms | 2 | 7 | 3 |
  | town | 2446 ms | 1621 ms | 19 | 1613 | 22 |
  | courtyard | 445 ms | 268 ms | 1 | 233 | 10 |
  | rooftop | 120 ms | 75 ms | 0 | 52 | 10 |
  | park | 5929 ms | 3915 ms | 1 | 4093 | 24 |
  | riverbank | 5318 ms | 3440 ms | 3 | 3448 | 31 |

  Baking is nearly all of it. In a profile, about 70% of baking time is the plant canopy generator (`canopy` in `src/pixel/sprites/plant/_helpers.ts`). A landscape tree bakes in 150–240 ms for its four sway frames, about 40–60 ms a frame. That means no single sprite fits a few-millisecond idle slice, so the baking goes to a worker.
- **The fix.**
  - `src/pixel/engine/prebake.ts`:
    - `bakeFrame` bakes one frame, to the same bytes as the atlas.
    - `sceneSprites` lists a compiled scene's real sprites, floor first.
    - `createIdleQueue` is a FIFO that starts a task only while the idle slice has more than 2 ms left, or once when the browser runs the callback late.
  - The atlas gains `baked(i)` and `adopt(i, rgba)`, and the renderer gains `warm()`, which builds the floor cache.
  - `src/world/pixel/prebake.ts` now owns the outdoor atlas and renderers (moved out of `OutdoorView`). `prebakeAround(mapId)` takes the map's outdoor neighbours from the exits, both ways, so the restaurant's neighbour is the town.
  - For each neighbour, in order:
    1. it compiles the scene in an idle slice;
    2. it posts the unbaked frames to `bake.worker.ts`, which transfers back one buffer per frame for the atlas to adopt;
    3. it warms the floor cache in an idle slice once the worker reports the map done.
  - The colour grade's four tables (about 20 ms each) are also built in idle slices, once per session.
  - `OutdoorView` calls `prebakeAround` for its map, and `CafeView` calls it for the restaurant. Without workers the same steps run in idle slices on the main thread, one sprite per slice.
- **Measured after** (headless Chromium):
  - The town baked in 2.0 s of worker time from the cafe. Courtyard, park and riverbank baked in 8.8 s from the town.
  - Meanwhile a frame loop on the main thread saw no long tasks; the worst gap between frames was 32 ms (one idle slice: a floor cache or a grade table).
  - First frame after prebake: town 4.4 ms (was 1629 ms), courtyard 1.8 ms (267 ms), park 1.6 ms (3727 ms), riverbank 1.1 ms (3283 ms). Bytes were identical to a lazily baked render in every case.
- **Costs and limits.**
  - The worker bundle is 1.17 MB, because it carries its own copy of the sprite code.
  - Baked art is held in memory as before, but now for neighbours too: about 30 MB for the town and 82 MB for courtyard, park and riverbank together.
  - A player who reaches the park within about 6 s of entering the town still finds part of it unbaked; the rest bakes lazily as before, only less of it.
  - Loading a save straight onto the park still bakes it all on the first frame.
  - The rooftop has no outdoor neighbour, so it is never prebaked, but it costs only 75 ms.
- **Verification.** `pnpm exec tsc -b` clean; `pnpm exec vitest run` 925/925 (frame-time test 11.3 ms inside the full suite at load average about 20). Headless, muted Playwright `pixel-town`, `world-journey`, `waiter`: 14 passed, 2 skipped. `pnpm build` bundles the worker. The Chromium figures above came from throwaway specs, now deleted.
- **Follow-up worth a ticket.** `canopy` builds a `Map` per clump and recomputes the lighting per pixel. A typed-array rewrite with byte-identical output would cut the worker time and the lazy fallback several-fold. I left it alone because it is art code that another session owns.
