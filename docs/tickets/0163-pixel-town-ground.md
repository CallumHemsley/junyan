---
id: 163
title: Draw the town's ground
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The town needs paving, road, brick lanes, stone, grass and canal water that read as worn French Concession lanes, with edges where materials meet.

## Done when

- `ground/<material>-a..d` for grass, paving, road, brick, stone, water (animated), plus edge/kerb tiles.
- `src/pixel/town/groundLayers()` produces variants, kerbs and transitions over the whole 80×64 map.
- Renders of the whole map and close-ups reviewed; `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: doing. Owner Claude Code (ground worker); branch `claude/0163-pixel-town-ground`; worktree `/Users/callumhemsley/Personal/junyan-px-0163`; no dev server (Node renders only).
- 2026-11-10: done. `src/pixel/sprites/ground/` holds grass, paving, road, brick (herringbone), stone (canal bank granite) and water (4 frames at 3 fps), each a–d, plus `edge-kerb-*`, `edge-grass-*`, `edge-header-*`, `edge-coping-*` and `edge-water-*` overlays. `groundLayers()` returns a base layer, stacked edge-overlay layers, then the water and its overlays last so the static floor cache holds everything else. Rasterising lives in `src/pixel/town/ground-grid.ts`; tests in `src/pixel/town/ground.test.ts`.
- Learned: the kit's `hash` makes diagonal streaks when picking variants from neighbouring tile coordinates, so placement uses its own avalanche hash. Fractional rect edges round to the nearest tile line with exact halves rounding outward, so the canal bank (x 64.5, half a tile) becomes a full stone column and the restaurant landing keeps its width. Rare features read as a grid unless they are placed on purpose: manholes are kept deep inside paving and 14 tiles apart, and the road's patch variant is a gas-main trench stacked down one column per stretch of road. Any feature in a heavily weighted variant shows up as a repeating dot on a big field, so plain variants carry no story detail. Brick only looked right with grey joints and mostly brown-red faces; dusty mauve bricks between orange ones read as confetti.
