---
id: 152
title: Draw the cafe kitchen and service counter
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

The kitchen is where the food comes from and the liveliest part of the room.

## Done when

- Counter modules, stove and steamers with steam, wok, soy-milk pot, sink, fridge, shelves and wall fittings per the style bible, reviewed in composition.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0152-pixel-kitchen`; worktree `/Users/callumhemsley/Personal/junyan-px-kitchen`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
- 2026-11-09, round 1 (redrawn at the 32px scale after the "nothing generic" note; the 16px pass is in history only). 31 sprites: `src/pixel/sprites/kitchen/{counter,stove,countertop,wall,appliances}.ts`, steam in `src/pixel/sprites/fx/steam.ts`, private helpers in `kitchen/_helpers.ts`. Every sprite's doc comment says whose it is and what happened to it.
- Grid conventions worth knowing: counter modules are 32×52, anchor [16, 51] on the tile's bottom row; the leg of the L is drawn lifted level with the counter top, so `counter-v-top`/`-v-mid` anchors sit below their art. Counter-top pieces anchor 40px below their base (place at counterAnchorY + 1) so they depth-sort in front of the counter; their shadow is lifted with `dy: -41`. Every stove-line piece shares the same 24-row front (steel lip, two tile courses, kick), so the line reads as one range.
- Learned: in three-quarter view a round top needs ry ≈ 0.45 rx; flatter ellipses made the steamers read as bread. Steam reads best as a thin stream breaking into curling puffs on a lazy S, two alpha steps, puffs shrinking before the top edge; blobs and row-cut ribbons both looked wrong.
- Weakest now: `bowl-stack` (reads as a striped jar), the sink's dish rack (bowls on edge read as brackets), the tea-egg broth/eggs at 1×. Palette gaps: no dark seasoned-iron sheen ramp (wok uses blue1/plum1), no amber oil-stain mid-tone between oak4 and gold2, no warm grey for aluminium.
- Review renders: `output/pixel/kitchen-sheet.png`, `output/pixel/steam-sheet.png`, `output/pixel/kitchen-compose.png` (command in the round-1 report).
- 2026-11-09, round 2 (after the coordinator's review): the leg of the L is now three boards with seams, butt joints and nails, end grain at the wall end, a lit west bevel and a shaded east edge, and different wear on each piece (a slide track, cup rings, knife crosshatch, a spatula scorch, the kettle ring). `counter-v-mid-c` is new. The corner is a mitre, and the slide track swings round it. Steamer tiers have a two-row proud lip, a shadow under it and a dark gap between tiers. The lid weave is only suggested now, inside a brighter hoop. Bowls are tapered piles (`bowlStack`). The sink rack holds overlapping plates and bowls with blue rims; the basin has a dark water line and a window reflection; the curtain's check is a step calmer. Steam body is more opaque with soft bright cores. The fridge door has a window reflection, a darker lower door and an oval chrome badge.
- 2026-11-10, round 3 (French Concession bistro): the service counter is now a bistro bar. Every id, anchor and footprint is kept. The run has a zinc top (soft patina, a rolled bead polished bright where forearms rest, dents, a glass ring, a scratch, a soldered patch, a dull slide track), a dark polished front of mitred raised panels with a lit top-left bevel, and a brass foot rail on cast brackets, rubbed bright where shoes rest and tarnished elsewhere, with ball ends. The leg of the L and the corner are a white marble slab with grey veins, tea rings, a chip, a filled crack and a soy blot; a brass cover strip runs where marble meets zinc. The stories stay: the replaced panel (now a redder rose wood), scuffs under the rail, the cloth on the hook. The stove line and wok splash-back are retiled in white metro tile with a black pencil course.
