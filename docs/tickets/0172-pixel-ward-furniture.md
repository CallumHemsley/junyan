---
id: 172
title: Draw the hospital ward's beds and equipment
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The beds, bedside cabinet, drip and monitor carry the opening's scene and its tutorial (the bedside cabinet works as the kitchen).

## Done when

- `ward/` beds and blankets on the shared bed geometry, cabinets, drip, monitor and visitor things, per `docs/design/pixel-contracts.md`.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: owner Claude (0172 worker), branch `claude/0172-pixel-ward-furniture`, worktree `/Users/callumhemsley/Personal/junyan-px-0172`. No port (sprites only).
- 2026-11-10: done. 21 sprites in `src/pixel/sprites/ward/furn-{beds,cabinet,equipment,things}.ts`, helpers in `_furn.ts`.
  - Beds and blankets are 48×96, anchor [24, 94], on the contract geometry (`BED` in `_furn.ts`). Blankets have no `foot` or shadow, so they never collide.
  - The cabinet's food slots are exported as `CABINET_TOP` from `_furn.ts` (offsets from the cabinet's anchor, plus a `sortDy` for each slot), sized for `food/milk`, `food/bread` and `food/egg`.
  - Animated: `ward/iv-stand` (8 frames, 4 fps drip) and `ward/monitor` (18 frames, 9 fps sweep, no digits). `ward/basin` and `ward/slippers` are `layer: "floor"`.
  - Learned: on a canvas that will be outlined, erasing pixels inside the art (rounded corners) punches holes that `outline()` then fills with dark dots. Draw such shapes on their own `Px` and blit them. Outline a blanket before its turned-down band, or the band's wavy edge picks up outline dots.
  - Learned: white sheets on a white frame need a mid-value blanket (blue5/jade5) to give the bed a value structure. Pale check on white read as one flat rectangle at play zoom.
  - Learned: a crease crossing the leg valley made a "+" on the blanket, which reads as a medical cross. The creases now stop where the body lifts the cloth.

