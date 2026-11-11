---
id: 187
title: Draw the rooftop garden's items
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The rooftop garden is drawn by the pixel engine since [[tickets/0186-rooftop-pixel]], but its small things still draw as placeholder boxes: the border pots, the tea table under the pergola, the trees, the care corner, and the garden's own pots, which change as the player tends them.

## Done when

- One `rooftop/<id>` sprite per static prop: `border-pot-0..5`, `care-residue`, `care-soil`, `care-tray`, `central-shrub-island`, `compost`, `hose`, `loose-tools`, `orchard`, `south-climbers`, `sun-clock`, `tap-basin`, `tea-table`, `terrace-tree`, `trellis-bed`, `wash-bowl`, generated per kind over `mapProps("all", kind)`.
- Run-time props: `rooftop/garden-<plant>` for every plant in `plantIds`, one sprite whose frames are every growth, droop and care state in the order `projectGarden`'s `variant` uses (`growth * 6 + drooping * 3 + care`), pinned by a unit test; plus `rooftop/garden-shade` and `rooftop/garden-crate-a`/`-b`.
- Full-map renders before and after (with the garden's pots), a 3x crop of the pergola tea corner and a sheet of every garden plant's frames reviewed; `tsc -b` and `vitest run src/pixel src/world src/features/garden` pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker); branch `claude/0187-rooftop-garden-items` from `claude/0186-rooftop-pixel`; worktree `/Users/callumhemsley/Personal/junyan-px-0187`; no dev server. The orchestrator is editing the rooftop's map.json and ground on 0186 in parallel; this ticket does not touch them.
- 2026-11-11: done.
  - `src/pixel/sprites/life/rooftop.ts`: border pots (celadon, terracotta and concrete, a different plant in each of the six), the terrazzo tap basin, two pallet compost bins, the timber trellis planters (bitter melon and beans on the north one, morning glory on the south, kitchen rows and scallions), the elm tea table with a purple-clay pot, cups, tea tin, thermos and two bamboo stools, an equatorial sundial, the wash bowl, the hose, the loose tools, the care tray, the compost sack and the spill (`floor`).
  - `src/pixel/sprites/plant/rooftop.ts`: the tree beds: the brick orchard (satsuma in fruit, fig, jujube, marigolds and strawberries, stepping stones), the terrace maple in amber in a gravel box, the stone-edged shrub island (box balls, a camellia in flower, a little pine).
  - `src/pixel/sprites/life/rooftop-garden.ts`: `rooftop/garden-flower|climber|tree` (a pot chrysanthemum, a butterfly pea on a cane wigwam, a kumquat sapling), 24 frames each in `projectGarden`'s variant order (`growth * 6 + drooping * 3 + care`, care dry/ready/extra), exported as `gardenFrame`/`gardenState`; `rooftop/garden-shade` (a reed blind lifted on poles high enough that the pot shows beneath it) and `rooftop/garden-crate-a|b`. `rooftop-garden.test.ts` pins the ids, the frame count and order against `projectGarden`, the footprints and anchors, and that growth shows.
  - The courtyard's bed and vegetable drawers moved unchanged into `src/pixel/sprites/life/_beds.ts` so the rooftop reuses them.
- Checks: `tsc -b`; `vitest run src/pixel src/world src/features/garden` 100 files, 521 tests passed.
- Learned: run-time props with many states read best when each state changes one thing (care in the soil and saucer, droop in the leaves, growth in the plant), and droop works as a generic warp over a plant canvas. A canopy over a pot must sit above the pot's tallest state or the pot vanishes under it. `over()` with `faded()` repaints existing pixels at that alpha, so a translucent shadow goes `under()` only.
