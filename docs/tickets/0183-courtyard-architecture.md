---
id: 183
title: Draw the courtyard's architecture
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The shikumen courtyard behind the town's moon gate (`src/world/maps/courtyard/map.json`, 48×38) renders in the game, but its buildings, walls, gates and doorways are placeholder boxes. It should feel like an intimate shared yard between old row houses, in the same language as the town's lane houses ([[tickets/0164-pixel-lane-buildings]]).

## Done when

- One `courtyard/<id>` sprite per `row-house`, `boundary-wall`, `entry-gate`, `doorway`, `stoop`, `doorstep`, `window`, `canopy`, `bicycle-shed`, `ledge`, `utility-box` and `garden-arch` prop, iterating `mapProps("courtyard", kind)` (pipeline from [[tickets/0176-outdoor-map-pipeline]]), anchored on the footprint's bottom-centre.
- South-facing homes show their facades and hipped roofs; the two north–south homes at the map's edges show a long hipped roof from above and a foreshortened side wall toward the yard. Doors sit where the doorsteps are.
- The entry gate and the garden arch stay walkable; nothing covers the exits.
- A full-map render and 3× crops of the hall approach and the south gate reviewed; `tsc -b` and `vitest run src/pixel src/world/pixel` pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker), branch `claude/0183-courtyard-architecture`, worktree `/Users/callumhemsley/Personal/junyan-px-0183`, no dev server. The trees and small yard items are drawn by another worker in `src/pixel/sprites/life/` and `src/pixel/sprites/plant/`.
- 2026-11-11: done. `src/pixel/sprites/bldg/courtyard.ts`. South-facing homes (`FRONTS`: north-west, north-east, central, south) use `facadeShell`, `laneWindow`, `stoneGate` and hip `laneRoof`, each with its own family's life; doors sit over the doorsteps, and the shallow south home rises 56 px above its footprint for a roof. `west-row` and `east-home` are long homes: a lane roof drawn east–west into a scratch canvas and turned a quarter (hips cap the north and south ends, courses run down to the side eaves), the south end wall facing the camera, and a 22 px foreshortened side wall toward the yard (height runs across the strip; windows, shutters and the yard door lie along it, downpipes and poles cross it; the door follows the doorstep). The wall windows are drawn by both the window prop and the house under it, so `window-blue` (which sorts behind its house) still shows. Also the whitewashed boundary walls with pantile coping, the lane gate (piers, lintel with blank plaque, scroll pediment, hood; opening clear), the hall doorway (open, lamplit) and its pent canopy on posts, granite stoop and doorsteps, the corrugated bicycle shed (open front, shade under the roof, bikes show through), the cats' ledge, electric and gas utility boxes, and the rose arbour over the park path.
- Learned: an arch over a path running across the camera is seen edge-on and reads as a ladder; only smothering it in roses makes it read. Turning a finished roof a quarter is a cheap way to get a north–south roof whose lighting stays plausible.
- Open: the map gives `stoop` and `doorstep` the `object` layer, so they sort with people and cover the feet of anyone standing on them; `ground` would suit them better.

