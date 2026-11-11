---
id: 184
title: Draw the courtyard's yard items and trees
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The shikumen courtyard behind the moon gate (`src/world/maps/courtyard/map.json`, 48×38) renders in the game, but its own yard kinds draw as placeholder boxes. Neighbours wash, sort, garden and keep cats here; the props are where that life shows.

## Done when

- One `courtyard/<id>` sprite per prop of these kinds, sized to the footprint and anchored on its bottom-centre (`mapProps("all", kind)`, `propSpriteId`):
  - yard items: `basket`, `bowl`, `bucket`, `stool`, `wash-basin`, `water-jar`, `well-cover`, `bird-bath`, `watering-can`, `woven-mat`, `entry-mat`, `resting-mat`, `folding-board`, `sorting-basket`, `broom`, `raised-bed`, `threshold-planter`;
  - floor kinds (`floor` layer): `fallen-leaves`, `pawprints`, `damp-paving`, `runoff-channel`;
  - `courtyard-tree` ×6 (osmanthus, pomegranate, loquat, magnolia, persimmon, a small plane), each with a `courtyard/<id>-shade` floor sprite.
- Whole-map render at 2x and 3x crops around the well and the raised beds reviewed, before and after; `tsc -b` and `vitest run src/pixel src/world/pixel` pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker); branch `claude/0184-courtyard-life` from `claude/0176-outdoor-map-pipeline`; worktree `/Users/callumhemsley/Personal/junyan-px-0184`; no dev server. The courtyard's buildings are another worker's (`src/pixel/sprites/bldg/`).
- 2026-11-11: done. `src/pixel/sprites/plant/courtyard.ts`: six trees and their `-shade` floor sprites (tree-0 osmanthus in flower, tree-1 persimmon in fruit with a picking pole, tree-2 pomegranate with a split fruit, tree-3 southern magnolia, tree-4 a self-sown plane, tree-5 loquat in winter flower), each in its own bed, crowns swaying 4 frames at 2 fps. `src/pixel/sprites/life/courtyard.ts`: baskets, bucket, stools, wash basins, rain jar, bird bath, watering can, folding board, sorting basket, broom. `courtyard-ground.ts`: well head, mats, cat bowl, fallen leaves (each drift takes the litter colours of its nearest courtyard tree), paw prints, damp paving, runoff gutter, all `floor`. `courtyard-beds.ts`: four brick raised beds (bean and loofah trellises, chillies, bok choy, scallions, perilla, mint, coriander) and the two entry troughs (a little pine, chrysanthemums). Two review rounds on the 2x whole map and 3x crops round the well and the herb island.
- `src/world/pixel/courtyard-map.test.ts` now counts drawn shade sprites in its prop total, as the town test already does (it assumed no courtyard tree had a shade).
- Learned: plants set into soil need their own outline (`sticker`), and bok choy read as pale pins until drawn as top-down rosettes. A cat's paw print, like a pair of crate slots, reads as a face unless the toes sit ahead of the pad. The well is a `ground` prop, so it is kept a hand's height tall to sit on the floor layer.
