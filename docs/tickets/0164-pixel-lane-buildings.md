---
id: 164
title: Draw the town's lane houses
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

Residences, row houses and the pump house make up most of the town; they must feel lived in, not tiled.

## Done when

- One `town/<id>` sprite per `building-residence`, `building-row`, `building-utility`, `steps`, `open-door-leaf`, `threshold-mat` prop, per `docs/design/pixel-contracts.md`.
- Shikumen stone-gate details, roofs from above, doors where the map's exits are.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: doing. Owner Claude (pixel worker), branch `claude/0164-pixel-lane-buildings`, worktree `/Users/callumhemsley/Personal/junyan-px-0164`, no dev server (Node renders only).
- 2026-11-10: done. `src/pixel/sprites/bldg/`: `_lane.ts` (brick, pantile roofs, eaves, copings, stone gates with pediments, windows with shutters/cages/bars, AC units, laundry poles, tiger windows, tanks, solar heater, pigeon loft, terraces, cast shadows), `lane.ts` (6 buildings, one composition each, foot = full footprint, no contact shadow), `thresholds.ts` (4 steps, 4 mats/sills as `floor`, 3 open leaves). `tsc -b` and `vitest run src/pixel` green.
- Learned: a big roof seen from above is the hardest surface in the town. Random per-tile weathering reads as holes; damp has to come in soft blobs, and lit north slopes take only a one-step darkening. 8px tile columns with 6px courses read as pantiles at 2x; 6px read as fabric. A one-plane facade looks flat; set-back storeys (timber front behind a gate wall, a rendered third storey behind a front roof), fire walls down the slope and cast shadows from roof objects give the depth.
- Open: the open-door leaf is 6px wide by contract, so edge-on it reads as a post more than a door. Leaf heights (restaurant/workshop 64px) are guesses that 0165's door heights should match. Brick and roof helpers could be promoted to a shared town helper if 0165 wants them.

