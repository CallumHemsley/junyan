---
id: 153
title: Draw the cafe dining furniture and table settings
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

Tables are where customers sit and where most play happens.

## Done when

- Tables, stools, chairs, benches, table-top condiments and front-of-house furniture per the style bible, with variants, reviewed in composition.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0153-pixel-furniture`; worktree `/Users/callumhemsley/Personal/junyan-px-furniture`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
- 2026-11-09, round 1 (32px tile): 42 sprites in `src/pixel/sprites/furn/` (`tables.ts`, `stools.ts`, `chairs.ts`, `tabletop.ts`, `front.ts`; private `_helpers.ts`, `_scene.ts`). The 16px drafts were dropped after the resolution doubled. Awaiting the art director's feedback round.
  - Tables: `table-1` (pegged breadboard ends, butterfly key, wired leg, stuck drawer), `table-2` (yellow gingham oilcloth, cigarette burn, taped tear), `table-3` (mint formica, chrome edge), `table-4` (rosewood, carved aprons, hoof feet), `table-small` (hanging drop leaf), `table-round` (pedestal, two butterfly keys). All 64×57 with anchor [32, 55] except small (40×45, [20, 43]) and round (64×64, [32, 62]).
  - Seats: `stool-turned`, `stool-bamboo`, `stool-plastic`, `stool-plastic-jade`, `stool-square`, `stool-child`, `bench`, `stool-stack` (not a seat); chairs `chair-painted-*` and `chair-folding-*` in four facings, `chair-jacket-down|up`. Sitter anchor offsets are in each doc comment (stools (0, -4), chairs (0, -4) / (±2, -4), `-up` (0, -6) drawn behind the chair back).
  - Table-top: tin, vinegar, chili jar, pink napkin box, teapot, `teacup`, `teacup-empty`, toothpick pot, menu stand (overlay area x 3–10, y 3–11), `condiment-set-1|2|3`.
  - Front of house: sideboard (64×60 with bowls and spoons on top), water dispenser (4-frame bubbles), coat rack, umbrella stand, newspaper rack, bin.
- Learned: table-top pieces cannot be judged with `compose.ts`, because it sorts by anchor y only and a piece standing on a table always sorts behind the table. `_scene.ts` accepts `id@x,y^N` to depth-sort a sprite N px further south. The engine (0150) needs the same: an object resting on another sorts with it.
- Learned: hash-placed grain from a `boards()` helper plus hand-placed story details reads well at 64px. Small sprites need everything hand-placed, and accidental faces (a dent plus a reflection, a cross on a pot) are the main failure to look for.
- Composition check: `output/pixel/furn-dining-corner.png` (command in the round-1 report). `pnpm exec tsc -b` clean.
- 2026-11-10, round 2 (art director's notes): every chair 6px shorter at the back, now 28×45 with anchor [14, 43] (sitter offsets unchanged); side views turned toward the camera so the back's face shows; jacket chairs redrawn with collar, lapels, sleeve folds and corduroy ticks; `stool-bamboo` with knuckled nodes, lashing, an over-under weave and the snapped strip breaking the silhouette; `stool-square` redrawn as a chamfered slab with wedged through-tenons and three claw scores; `table-2` gingham quietened to cream, gold5 and cream3; coat-rack jacket hung by its hood with sleeves; umbrella pot band brushed instead of the lotus; new `furn/bill-holder` (14×11, anchor [7, 10], overlay area x 4–8, y 2–5). `furn/highchair` not drawn (optional).
- 2026-11-10, round 3 (French Concession bistro): merged the foundation; the room is now a 1930s Shanghai bistro. New `bistro.ts` and `bentwood.ts`.
  - `table-1`…`table-4` redrawn with the same ids, size, anchor [32, 55] and foot, plate room still dy −49…−27: 1 round marble top on iron scroll feet (grey vein, chip mended with filler), 2 round marble top on four splayed legs with ball feet (teapot ring, card under a foot), 3 square marble top on arched iron feet (corner glued back, ashtray ring), 4 zinc top with a rolled, dented edge on a dark wood frame with turned legs.
  - New: `table-bistro-small` (40×45, [20, 43]); `banquette-left`, `-mid` (split seam, stuffing), `-mid-b`, `-right` (coat left on it), 32×41 modules with anchor [16, 40], sitter (0, −4); `chair-bentwood-{down,up,left,right}` (walnut, cane) and `chair-bentwood-b-*` (black lacquer worn brown, split cane), 28×45 with anchor [14, 43] and the usual sitter offsets; `hat-stand-bentwood` (32×88, fedora and scarf); `bud-vase` (9×21, a magnolia bud).
  - `furn/sideboard` is now the bistro dresser: 64×86, anchor [32, 84], marble top, glazed upper doors full of Chinese crockery.
  - Kept as they were: the Chinese stools, the earlier chairs, `table-small`, `table-round`, the table-top set, the condiment sets, `coat-rack`, `water-dispenser`, `umbrella-stand`, `newspaper-rack`, `bin`.
  - Compose: `output/pixel/furn-bistro-corner.png` at 2× (play scale), rendered with `_scene.ts`.
