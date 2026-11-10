---
id: 167
title: Draw the town's market and daily-life props
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The market stall, laundry, crates and baskets are where the town feels inhabited.

## Done when

- One `town/<id>` sprite per market-and-life prop listed in `docs/design/pixel-contracts.md`, plus `life/` extras.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: started. Owner Claude (pixel worker), branch `claude/0167-pixel-market-life`, worktree `/Users/callumhemsley/Personal/junyan-px-0167`, no dev server (renders via `src/pixel/tools`).
- 2026-11-10: done. 22 `town/` sprites (market-stall, market-baskets, crates-0..3, three laundry lines, tea-stone-table, book-delivery-ledge, junction-rest-bag, planter-0..9) and 8 `life/` extras (folding-chair, stool-stack, birdcage, mop, bucket, delivery-box, bricks, kumquat). Helpers in `src/pixel/sprites/life/_helpers.ts`. Three look-and-fix rounds on sheets and on a scratch town crop with `char/player` for scale.
- Learned: footprint-bound sprites are easiest as one `townFrame(prop, rise)` per instance, with per-instance stories keyed by prop id and a variant fallback. Laundry reads only when garments are near true size (shirt 18×22, trousers 13×30) and lines hold each item once before repeating; door spans come from the map's exits and steps, and only small items hang over them. Plastic-crate slots in pairs read as faces; a full lattice reads as a crate. `cloth()` paints each garment on its own canvas so prints never bleed onto what hangs behind.
- Coordination: `town/junction-rest-bag` assumes the bench seat is about 13 px above the ground row (it sits on `town.bench-0`, which sorts in front of it). Laundry has no `foot` (walk-under) and animates (4 frames, 2 fps). The stall's hanging bulb sits at about (28, 42) in sprite px if the scene wants a glow light there.
