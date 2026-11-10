---
id: 168
title: Draw the town's trees, hedges and flowerbeds
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

Plane trees are the signature of the French Concession; the town's greenery frames every lane.

## Done when

- One `town/<id>` sprite per `tree`, `hedge`, `flowerbed` prop, plus `plant/` extras.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Owner: Claude Code (pixel worker). Branch `claude/0168-pixel-town-plants`, worktree `/Users/callumhemsley/Personal/junyan-px-0168`, no dev server (renders through Node tools).
- Done: `src/pixel/sprites/plant/` — `trees.ts` (12 `town/<id>` trees: ten London planes, the junction camphor, the south fig; 4-frame crown sway at 2 fps), `hedges.ts` (12 hedges, boxwood and privet), `beds.ts` (2 raised brick flowerbeds, layer `floor`), `extras.ts` (`plant/weeds-a..d`, `plant/moss-a..c`, `plant/leaves-a..c`, `plant/leaf`, `plant/bamboo-pot`, `plant/ivy-curtain`, `plant/ivy-climb`, `plant/ivy-drape`), `_helpers.ts` (canopy, bark, grates, hedge faces, soil stickers).
- Trees are wider than their footprint: the footprint is the trunk's pit or grate, the crown spreads 4–5 tiles and rises to about 5.5. The canvas is centred on the trunk, so the anchor is still the footprint's bottom-centre; `foot` covers only the trunk.
- Learned: a crown reads as a tree only when it is built from a few separate masses on limbs (with a dark inner mass behind the limbs), not one cloud of equal clumps; clumps inside a mass must melt together (seams only between masses) or it looks like bubble wrap. Plane limbs must climb steeply into the inner side of each mass, or they fan out like umbrella ribs. Hedge faces need rounded tufts lit on their upper left, not 2px leaves, which read as noise. Plants set into soil need their own outline pass (`sticker`), because a whole-sprite outline never finds their edges.
- Map notes for the scene (not changed here): `town.hedge-6` overlaps the base of `town.south-fig`; flowerbeds are `floor`, so they have no collider and the scene must block them; `town.hedge-0` and `town.hedge-1` overlap at their corner and join cleanly.
