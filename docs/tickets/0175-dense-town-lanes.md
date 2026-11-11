---
id: 175
title: Pack the town into dense lilong lanes
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

Callum: the pixel town feels suburban, big open lawns between buildings. It should read as dense Shanghai lanes (弄堂, lilong) in the former French Concession.

## Done when

- `src/world/maps/town/author-map.py` lays the town out as lanes lined with facades: rows of shikumen houses and small shops back onto each other, lanes 3–5 tiles, alleys 2–3, small courts and paved pockets instead of lawns; grass only as edge verges, the park and canal edges, and a garden or two.
- Every exit, entrance, anchor, landmark and NPC hook, the restaurant, the residence and workshop doors, the moon gate, the canal and the breakfast road are where they were.
- `reachability.py`, `tsc -b`, `vitest run` and the Playwright journeys (pixel-town, neighbourhood, world-journey, waiter) pass; before/after renders in `output/pixel/0175/`.

## Notes

- Owner: Claude worker (Opus). Branch `claude/0175-dense-town-lanes` from `claude/0162-pixel-hospital-town`; worktree `/Users/callumhemsley/Personal/junyan-px-dense`; Vite 5202 strict, preview 5203. Silent, headless only.
- Contracts: [[design/pixel-contracts]]. Map only: no sprite file was touched (another worker is in `src/pixel/sprites/shop/`).

### Layout (2026-11-10)

- **Shape.** Rows of shikumen houses now face south onto brick lanes and back onto the next lane north: a back lane (3 wide) behind the residence, the north lane (4, 3 at North Row), a kitchen alley (2) behind the restaurant, the lantern passage (4, was 5) and a dead-end lantern alley (2), the east lane (4, was 7), a corner alley (4) in front of the corner store, the south lane (4, was 7) and a back street (3.5) along the south edge. Courts instead of lawns: the moon-gate forecourt, the tea terrace, the fig court, the grove court and the service yard. Grass is left at the park edge (west), the canal island (east), the top and bottom verges and a 1-tile verge beside the residence.
- **Buildings.** 15 → 37. New: 23 rows (the row-house sprite at widths 5–9 and depths 4.5–9, so the bays and roofs vary), plus `junction-shop` (tea-house sprite, on the junction), `east-shop`, `fig-shop` (shop sprite), `lantern-shop` and `alley-row` (shutters), `hot-water-house` (utility: a 老虎灶 on the back lane), `fig-house` (residence sprite, 13.5×6) and `canal-end-row` (workshop sprite, by the canal). The road frontage north of the road now runs garden | west store | junction | junction shop | restaurant | lantern passage | lantern shop | tea house | east lane | east shop | workshop.
- **Moved** (fixed things are not): `corner-store` up 1 (4–14) so the corner alley fits in front; `linen-house` left 2; `south-residence` up 0.5; `south-bakery` and `south-studio` up to y 53 (facing the back street); trees `west-shade` (into the west lane, its crown had been off the map), `courtyard-left`, `east-lane`, `river-view` (it stood inside the river store), `east-corner`, `south-grove`; hedges and fences to the edges (several crossed the new lanes); planters 2/4/5/8, bikes 1/3, lamp-3, drains 3/5, gutters 3/4, market verge, the south and alley laundry, the south utility pole. `hedge-9` and `planter-5` stood inside building plots and now stand outside them. Removed: `town.workshop-verge` (its bed is under the canal row). Exits, entrances, anchors, landmarks and NPC hooks are byte-identical.
- **Added life.** 9 lamps down the lanes, 6 washing lines across alleys, 9 pot plants, 4 bikes, 3 crate stacks, a bench in the fig court, 2 gutters.
- **Variants.** `author-map.py` now keeps `variants.json` order stable (existing names keep their index, new ones append), because building seeds and planter fallbacks hang off the index.
- **New test** (`town-map.test.ts`): buildings never overlap, and nothing but an awning stands inside a building plot (the old map failed it: `hedge-9`, `planter-5`, `river-view`).

### Checks (2026-11-10)

- `python3 src/world/maps/town/reachability.py`: every entrance, exit, anchor, landmark and hook point reachable (sampled walkable area 1957.75 tiles²).
- `pnpm exec tsc -b` clean; `pnpm exec vitest run`: 133 files, 862 tests passed.
- Headless Playwright (`--mute-audio`), Vite 5202, preview 5203, desktop and phone: pixel-town, neighbourhood, world-journey, waiter: 18 passed, 2 skipped (pixel-town runs once from the desktop project), 22 min.
- Renders in `output/pixel/0175/`: `town-before.png`, `town-after.png`, `town-after-night.png`, `{before,after}-breakfast-street-2x.png`, `{before,after}-back-lane-2x.png`, `after-south-lanes-2x.png`.

### Known gaps

- Every new row draws the North Row's three bays (AC, quilt, cage), because `lane.ts` falls back to `northRow` for any `building-row`; widths and depths vary but the bay stories repeat. A follow-up art ticket could pick the fallback by variant (`northRow`, `linenHouse`, `southStudio`), and give the shop and shutter fallbacks more than one face (now `bookshop` and `riverStore`).
- Trees have no fallback (`trees.ts` throws for an unknown id), so the town keeps exactly its 12 trees; lining the lanes with more planes needs an art change first.
- New flowerbed ids draw as bare soil (no planting fallback in `beds.ts`), so none were added.
- The breakfast road, the river promenade and the market are still wide open by design (fixed road; the riverbank exit spans y 44.5–50.5).
- Done 2026-11-10. Learned: with sprites generated per footprint, the map alone can turn suburb into lilong; the fallback sprites, not the map, now limit variety.
