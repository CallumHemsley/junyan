---
id: 165
title: Draw the town's shopfronts
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The restaurant's street face, the tea house, the workshop and the shops are the town's landmarks.

## Done when

- One `town/<id>` sprite per `building-restaurant`, `building-tea`, `building-workshop`, `building-shop`, `building-shutter`, `awning` prop.
- The restaurant exterior matches the bistro interior; signs are blank boards.
- `tsc -b` and pixel tests pass.

## Notes

- 2026-11-10: owner Claude (pixel worker), branch `claude/0165-pixel-shopfronts`, worktree `/Users/callumhemsley/Personal/junyan-px-0165`, no dev server.

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10 done. Sprites in `src/pixel/sprites/shop/`: `restaurant.ts`, `tea.ts`, `workshop.ts`, `shops.ts` (corner store, market house, bakery, bookshop), `shutters.ts` (west store half open, river store closed for good), `awnings.ts`; shared draw kit in `_front.ts`; contract test `shop.test.ts` (one sprite per prop, footprint sizes and anchors, restaurant door at 160..224, deterministic frames, opaque facade foot).
- Doorways: the restaurant's and workshop's openings are 64 px tall (orchestrator note for the 0164 open-door leaves); the restaurant's left half stands open where the leaf is (x ~161), its right leaf is shut. The breakfast awning's hem clears z 64.
- Awnings hang from heights each building leaves for them (`AWNING_MOUNT` in `_front.ts`); their sprites are footprint-wide, rise from the pavement line, and carry a translucent wall shadow.
- Sign fields (DOM text) are listed in each file's doc comment.
- Learned: `p.faded` over existing pixels inside one sprite punches see-through holes to the ground; steam, glow and shade over solid art must step colours along their ramps instead (`step`, `shade`, `softLayer` in `_front.ts`, worth promoting to the kit). Hash-driven per-pixel texture (bleach, slipped tiles, grime) reads as speckle at play zoom; whole rows or shaped clusters read as material. A sawtooth roof with ridges running away from the street reads as a folding screen from above; ridges along the street, each tooth a band of glazing, reads as a roof.
- 2026-11-10 round 2 (orchestrator review): pitched roofs (corner store, bakery, bookshop, river store, market-house and west-store lean-tos, the tea house's slopes) now use the lane houses' `laneRoof`/`pantiles`/`eave`/`lichen`/`moss` from `src/pixel/sprites/bldg/_lane.ts`, imported read-only, so the town's roofs share one language; the tea house's hip faces are cut from that tiling, the east hip a step darker, eave tiles laid column by column along the upturned curve. Story details sized for 2x: a real-size satellite dish, the aerial with a snagged bag, the baker's cat on the ridge by the flue, a winnowing tray of chillies by the bookshop dormer, a paper-mulberry sapling and grass on the river store, a 30 px kite with a bowed tail on the tea house. Bigger bakery cake under its dome, bigger flue smoke, bigger weeds. Workshop: one tooth re-roofed (new sheets, polycarbonate glazing), rust blooms, moss, a sparrows' nest, an aluminium ladder.
- 2026-11-10 round 3 (Callum: "something about the roof isn't quite right... keep the shanghai vibes"): the restaurant's flat beige deck is gone. Now a stepped Art Deco parapet (fluted end piers, a three-step crest round the jade roundel, pots on the coping, a hard shadow line behind the coping), a narrow tiled terrace with the household's life in two groups (pigeon loft and scallion boxes west; the cook's whites, folding chair and thermos east), each casting a short shadow down-right, and over it a grey pantile roof from the lanes' kit (`laneRoof`, `tigerWindow` read-only) with the kitchen's brick chimney steaming at the east end. Learned: a roof the same value as the facade reads as nothing; the pantile slope's grey against the cream render gives the building a top, and clustering props reads as life where scattering reads as stickers.
- 2026-11-11 round 4 (dense lanes, 0175): unnamed `building-shop` and `building-shutter` props no longer fall back to the bookshop / river store. `_lane-shop.ts` generates them from id hash, `variant` and footprint: the lanes' hipped pantile roof with one or two roof things, a brick or rendered upper storey with lane windows and an AC unit or laundry pole, and a ground floor by trade (kiosk, tailor, noodle shop, fruit, hardware, barber, pharmacy, repair stall), each with a blank sign, its own awning or none, a display and a story detail; lock-ups half up on the owner's legs, down under abstract posters, open on a parked scooter, or down with a hand-painted repair (two bays when wide). Today: east-shop is a tobacco kiosk, fig-shop a noodle shop, lantern-shop a painted repair plus legs bay, alley-row a scooter garage. Landmarks unchanged.
