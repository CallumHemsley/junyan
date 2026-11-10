---
id: 154
title: Draw the cafe decor and small life
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

Lived-in detail is the difference between a proof of concept and a place.

## Done when

- Plants, lanterns, wall decor, small appliances, clutter and a cat per the style bible, with gentle animation where it earns it, reviewed in composition.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0154-pixel-decor`; worktree `/Users/callumhemsley/Personal/junyan-px-decor`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
- 2026-11-09, round 1 (ready for art-director review). First drawn at 16px tiles, then redrawn from scratch at 32px tiles after the "nothing generic" direction (merged `claude/0149-pixel-art-foundation`). 31 sprites in `src/pixel/sprites/decor/`: `plants.ts` (7), `lanterns.ts` (2), `cat.ts` (2), `clutter.ts` (10), `wall.ts` (10), helpers in `_helpers.ts`. Each sprite's doc comment says whose it is and what happened to it.
- Anchors: floor objects at the middle of their foot; wall pieces (layer `floor`) at their nail, the wall fan at its bracket screw; lanterns (layer `over`) at the hook on top of the cord. Board overlay rectangles: `decor/shop-sign` x 12–83, y 8–23; `decor/chalkboard` x 6–41, y 8–32; `decor/calendar` x 4–19, y 12–25.
- Animated: lantern-red and lantern-small (4 @ 3 fps), plant-hanging (4 @ 2), cat-sleep (2 @ 1, a one-pixel breath), cat-sit (4 @ 4, tail flick and ear twitch), lucky-cat (4 @ 3 beckon), wall-fan (3 @ 8).
- Review renders: `output/pixel/decor-all.png` (sheet), `output/pixel/decor-room.png` (room compose; the command is in the round-1 report).
- Learned: at 32px, leaf stamps with a per-leaf dark rim (outline painted before fill) give clean overlaps; at 16px the same rim swamped the leaf. Per-material outlines (`autoOutline`) save a lot of masking. Hand maps still beat procedural shading for faces and fur; procedural shading is fine for spheres (lantern, kettle) when ribs or reflections break the bands.
- Known weak: mop-bucket (mop head reads as a whisk), boxes (still plain for their size), cat-sleep's tail (busy where it meets the belly). Compose cannot put table-top pieces (thermos, radio, kettle, lucky cat, small plants) on a table, because it depth-sorts by anchor, so they were reviewed on the floor.
- 2026-11-10, round 2 (ready for review). Redrawn: `mop-bucket` (a sodden string mop slumped over the rim, strands down the side, a drip, a translucent puddle ring), `boxes` (top box clearly twisted, torn tape strip hanging, water-wrinkled corner, flap-fold shadow, corrugated edges, a box cutter on top), `cat-sleep` (a true curl with the head tucked into the round of the back and the tail along the front, tip under the chin; plain ringed tail; now 8 frames at 2 fps, a slow breath and an ear flick on the last frame), `wall-fan` (darker steel cage and blades, jade enamel motor housing and bracket), `plant-snake` (leaves fanned at different angles and heights). New: `decor/slippers` (22×14, floor), `decor/umbrella-wet` (18×46, object, anchor [9,43], 4 frames at 3 fps, a drip into a translucent puddle), `decor/sun-catcher` (10×20, floor, anchor at the cord top, 4 frames at 2 fps, a turning jade disc), `decor/cat-loaf` (24×21, object, anchor [12,19], 3 frames at 1 fps, a slow blink). 35 decor sprites in all.
- Learned: draw translucent puddles inside `p.under()` after outlining. Otherwise `autoOutline` treats faded pixels as solid and rings them in ink.
