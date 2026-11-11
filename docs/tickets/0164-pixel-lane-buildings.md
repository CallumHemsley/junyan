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
- 2026-11-10, round 2 (orchestrator review): pantiles now take a per-tile brightness level from smooth fields (sun-bleached toward the ridge and west end, darker toward the eave), re-laid strips of warmer or cooler tiles, damp as a one-step stain (`DAMP_TILES`, never black), a few single replaced or slipped tiles; lichen in clusters; dormers cast a short soft wedge (`shadowWedge`). Residence ground storeys got bicycle-worn brick, a painted repair, a hose reel, a stool with a basin, a meter cluster on one conduit, a glazed pot. Open leaves: lit stile edge, panel rails and recess, hinge knuckles; shop leaves stay 64 px tall.
- Learned: per-tile jitter above about 0.15 of a level turns a gradient into a patchwork; keep variation in smooth fields and let only the zone edges be ragged.
- 2026-11-11, round 3 (Callum: roofs too linear, hard to see where they start): `_lane.ts` roofs rebuilt for every caller. Tiles are horizontal staggered courses with scalloped dark lips and a ridge-to-eave value falloff (the far slope foreshortened to 4px courses); the eave is a row of round drip-tile ends over a dark underside with a soft 3-row cast shadow; the ridge has a dark break and a bright lime cap with end horns. `laneRoof` takes `ends: "hip" | "gable" | "square"` (default from `roofStyle.ends`, now `hip`): hip ends slope back as lit west / shaded east faces under diagonal hip ridges; gable ends are lime-washed walls whose copings climb diagonally to the ridge, with a vent. Signatures of `pantiles`, `eave` and `laneRoof` unchanged.
- Learned: in a true three-quarter view a gable end has no diagonal at all; the slope only reads once the silhouette has one, which a hip gives honestly. Light horizontal course lines plus a dark eave line do more for "this is a slope" than any tile detail.

