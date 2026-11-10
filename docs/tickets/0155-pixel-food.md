---
id: 155
title: Draw the breakfast foods and tableware
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

Food is what the player carries and what customers ask for; it must be appetising and instantly recognisable.

## Done when

- Each menu food as a table-scale plate and a large icon, plus tray, empty dishes and steam, per the style bible.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0155-pixel-food`; worktree `/Users/callumhemsley/Personal/junyan-px-food`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
- 2026-11-09, round 1 at the doubled scale (TILE 32), merged `claude/0149-pixel-art-foundation`. Sprites in `src/pixel/sprites/food/` (`icons.ts`, `servings.ts`, `tableware.ts`, `till.ts`, private `_helpers.ts` and `_ware.ts`) and `src/pixel/sprites/fx/steam-wisp.ts`.
  - Hero icons 48×48 (`food/<id>-icon`), each a small still life: bun steamer with woven band, liner and one bun torn open; two mantou on the dotted plate, one bitten; tea eggs (crackle from cell edges round seeds), a halved egg with a grey-green ring, star anise, tea leaf, tea pool; soy milk in the peony bowl with a skin forming, blue-rimmed spoon, dunked 油条; congee in the carp bowl with century-egg wedges, pickle, peanuts, scallion, sesame oil; twinned blistered 油条 on oil-spotted paper; six pork-and-chive crescents (one bitten) and a vinegar dish with a chili-oil ring.
  - Servings (`food/<id>`) 22–28 × 15–19, anchor at the dish's bottom-centre. Tabletop items must sort with their table, not by their own anchor (engine note for 0150).
  - Tableware and till: tray 44×25, plate/bowl/steamer empties, chopsticks, spoon, soy dish, coins, notes, receipt (DOM overlay x 3–8, y 3–12). `fx/steam-wisp` 16×24, 8 frames at 5 fps, `layer: over`.
  - Learned: procedural dome shading plus field-based pleats reads as mush on dough; hand-placed grids (bun, mantou, dumpling, half egg) are what made them read. Bowl bodies must take the shallowest ring that reaches a pixel or patterns land in the wrong place. Motifs on porcelain read only in the deepest blues.
  - Palette gap: a warm dough shadow between `cream3` and `cream2` (cream2 drifts grey-mauve under buns).
- 2026-11-10, round 2 (art director's review of round 1):
  - Soy milk (`food/milk-icon`, `food/milk`) is now a tall ribbed glass tumbler on a saucer, with a skin, a sheen and a meniscus, a bead of milk down the glass, and the spoon on the saucer (icon) or standing in the glass (serving). The fried-dough stick is gone: the 豆浆 picture must not contain 油条. The glass is drawn by the new `tumbler()` in `_ware.ts`; the glass is translucent and the milk is solid.
  - Tea egg (`food/egg-icon`, `food/egg`): a clean egg shape that narrows at the top, a paler tea-brown, a crackle web one pixel wide (the borders between cells) instead of mottling, and one strong glint. A hand-drawn eight-point star anise, a plain dish, and no tea pool.
  - `food/bun-icon`: the steamer's near rim is a real strip now (the `steamer()` lip keeps its width at the front), with rattan lashings over it and a split strip in the band; the liner fills the well with folds.
  - `food/plate-empty` (now 31×14): chopsticks across the near rim so the vinegar smear and crumbs show. `food/bowl-empty`: a rice-water tide line, a cloudy puddle and a spoon left in it.
  - `fx/steam-wisp`: one stem, thick and bright at the base, curling over and thinning; no fork.
  - New: `food/bun-eaten`, `food/youtiao-eaten`, `food/dumpling-eaten` (one bun left; one stick bitten short; three dumplings and a vinegar smear).
