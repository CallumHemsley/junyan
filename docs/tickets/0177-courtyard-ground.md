---
id: 177
title: Draw the courtyard's ground
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The shikumen courtyard behind the moon gate (`src/world/maps/courtyard/map.json`, 48×38) is an intimate shared yard between row houses, old and lived in. Its terrain uses five materials the town tiles don't cover: `brick-paving`, `courtyard-stone`, `moss-earth`, `threshold-stone` and `worn-stone`.

## Done when

- `src/pixel/sprites/ground/courtyard.ts` draws seamless `ground/<material>-a..d` for all five materials and the `ground/edge-…` overlays where they meet, in the town ground's muted palette (round 2 of [[tickets/0163-pixel-town-ground]]).
- `src/pixel/town/ground-courtyard-legend.ts` exports a material → base variants and edge rules table that the generalised `groundLayers` can consume, documented at the top. `ground.ts` and the existing `ground-*.ts` are untouched.
- A whole-map render at 1x and 3x close-ups have been reviewed; `tsc -b` and the pixel tests pass.

## Notes

- 2026-11-11: doing. Owner Claude Code; branch `claude/0177-courtyard-ground`; worktree `/Users/callumhemsley/Personal/junyan-px-0177`; no dev server. Another worker is generalising `src/pixel/town/ground.ts`; the orchestrator wires the legend in once both land.
- 2026-11-11: done. `courtyard.ts` draws `brick-paving` (grey 青砖 basket weave), `courtyard-stone` (warm granite slab courses whose joints fall at x 15 or 31 by variant, so slab lengths vary and no grid shows; a drain and a jar-ring variant), `moss-earth` (damp earth with moss cushions, stones, a dropped clothes peg), `threshold-stone` (long sills; the no-joint variant is weighted heaviest so sills run several tiles) and `worn-stone` (cobbles on a fixed layout, polished highlights, two puddle variants), plus `edge-moss-*`, `edge-brick-paving-*`, `edge-cobble-*` and `edge-sill-*` with corners. `src/pixel/town/ground-courtyard-legend.ts` exports `COURTYARD_GROUND` (base weights and edge rules with `outer`/`inner`/`both` corner modes), with a test that it covers the map's materials and only names drawn sprites.
- Learned: a one-tile-square slab reads as a tile grid however it is shaded; varying where a course's joints fall by variant gives random slab lengths for free. Long features (sills, slabs) come from a heavily weighted no-joint variant, not from longer sprites. The ticket number 0177 was assigned by the orchestrator; another branch, `claude/0177-shadow-theatre`, uses the same number.

