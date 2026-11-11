---
id: 189
title: Draw the park and the riverbank in pixel art
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The park and the riverbank still drew with the old painter. The outdoor-map pipeline (PR 74) makes adding a map a registration, so they can join the town and courtyard. To make that worthwhile, their nature needs drawing.

## Done when

- `park` and `riverbank` are registered in `OUTDOOR_MAPS` (`src/pixel/world/maps.ts`) and in `OUTDOOR_PIXEL_MAPS` (`src/world/pixel/maps.ts`). Their landscape tests and exits still pass.
- Their nature kinds draw from new files in `src/pixel/sprites/plant/`: `mature-tree`, the woodland `tree` and `willow` (each with a `<map>/<id>-shade`), `bamboo`, `fern`, `reeds`, `lilies`, `flowers`, `woodland-floor`, `rock`, `seedling-bed` and `harvest-floor`.
- Both maps are rendered whole (before and after, morning and evening) with 2x crops. `tsc -b` and `vitest run` pass, and the pixel-town Playwright spec passes headless and muted.

## Notes

- Owner: Claude Code (pixel worker). Branch `claude/0189-park-riverbank-pixel`, worktree `/Users/callumhemsley/Personal/junyan-px-0189`, Playwright ports 5226/5227.
- **Centred props.** `author.py` positions every landscape prop by its centre; every other map uses the top-left. The registry now reads park and riverbank through an adapter (`centredProps`), so props sit on their colliders.
  - For `tree`, `mature-tree` and `willow`, the authored size is the crown's spread. The adapter narrows the footprint to the trunk, using the trunk collider's width, and keeps the spread as `spread`. These trees therefore depth-sort at the trunk, like the town's.
  - A test checks that every trunk sits on its collider.
- **Files:**
  - `woods.ts`: autumn trees for `mature-tree` and the woodland `tree`. Camphor, plane turning ochre a mass at a time, gold ginkgo, maple in muted rose and orange, a green elm-like understorey tree, and persimmons with fruit in the park orchard. `trees.ts` now leaves `WOODLAND_MAPS` trees to `woods.ts`.
  - `waterside.ts`: weeping willows whose curtain sways, reed beds whose heads sway, water lilies.
  - `understorey.ts`: bamboo clumps (swaying), five kinds of fern, six flower clumps (red spider lilies kept rare).
  - `ground-cover.ts`: woodland litter drifts with moss, mushrooms and fallen branches; orchard soil; a seedling bed; rocks (a taihu scholar's rock, the flat reading stone, river boulders).
  - Shared helpers `domeMasses` and `dappledShade` live in `_helpers.ts`.
- **Floor patches read the map's ground.** Litter and moss stay off water and thin out on paths, and the orchard soil stays off the paths.
- **Still placeholders** (other owners or later tickets): `pavilion` (park/tea-pavilion), `cart` (park/orchard-cart), `shrine`, `boat`, `mooring`, `tied-rope`, `worn-stones`, `picnic`. `stool`, `bench`, `crates`, `laundry` and `steps` already draw through the shared generators.
- **Learned:**
  - A grove reads as autumn when each crown mass picks its own colour (a plane turning bough by bough), not when leaves are speckled.
  - Litter has to drift with large-scale noise or it reads as confetti.
  - A tall rock needs round, overlapping lobes at random heights; even stacking reads as a caterpillar.
- **Verification:**
  - `pnpm exec tsc -b`: clean.
  - `pnpm exec vitest run`: green (138 files).
  - No e2e spec names the park or the riverbank, so I ran `e2e/pixel-town.spec.ts` and `e2e/world-journey.spec.ts` headless and muted on ports 5226/5227: 4 passed, 2 skipped by the specs' own project filters.
