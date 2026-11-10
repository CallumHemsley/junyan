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
