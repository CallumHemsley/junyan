---
id: 166
title: Draw the town's street furniture
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

Lamps, bollards, benches, bicycles and drains carry the town's period and daily life.

## Done when

- One `town/<id>` sprite per street-furniture prop listed in `docs/design/pixel-contracts.md`, plus `street/` extras.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: owner Claude (pixel worker), branch `claude/0166-pixel-street-furniture`, worktree `/Users/callumhemsley/Personal/junyan-px-0166`, no dev server.
- 2026-11-10: done. `src/pixel/sprites/street/`: `lamps.ts` (7 lamps, 8 bollards, the milestone), `benches.ts` (4), `bikes.ts` (4 bicycles plus `street/e-scooter`), `ground.ts` (6 drains, 5 gutters, `street/water-meter`, `street/manhole`, all `floor`), `fences.ts` (12 fences, the moon gate, the closed yard gate), `utility.ts` (2 poles, the pump pipes, `street/ac-unit-a`, `street/ac-unit-b`, `street/postbox`, `street/cable-spool`, `street/hydrant`). The parameterised draw functions are in `_helpers.ts`: `lampPost`, `bollard`, `bench`, `bicycle`, `grate`, `gutter`, `railingH/V`, `bambooH/V`, `strip`, `across/column/rod`. All 52 map instances have sprites anchored per the contract. `tsc -b` and `vitest run src/pixel` (56 tests) pass.
- Learned: a north–south fence in this camera collapses to a line, so it needs a wide lit kerb and a band with posts and finials to read at all. Drawing a strip horizontally and transposing it keeps the upper-left light correct for vertical drains and gutters. Running `autoOutline` over a bicycle fills the gaps between the spokes, so bikes get no outline.
- Deviations and map questions for the integrator: (1) the utility poles are 48 px wide, centred on their anchor, because the crossarm and transformer cannot fit a 10 px footprint. (2) `town.river-rail-left` lies on the closed yard gate's line, so where the gate stands it draws only its kerb, as a sill. (3) `town.bike-3`'s footprint (x 64.6–66.4, y 53) sits over the canal water (x 65–67). (4) The lamps' glass is unlit: put a `glow` about 3 tiles above each lamp's anchor (the glass is at art y 19–32 of a 120 px sprite). `street/ac-unit-b` is wall-mounted, so sort it with its facade.
- 2026-11-10, round 2 (orchestrator review): lamps redrawn at 22 px wide, centred on the anchor, under the same exception as the poles (the post stays on its 11 px footprint). Each now has a two-step plinth, a fluted bell base, a tapered shaft with a collar, a ladder-rest crossbar (scrolled on some) and a proper head: a four-pane lantern with a pointed cap and crockets, or an opal globe in a four-strap cage. Paint wear is calmer. Benches have a five-row open gap between seat and backrest. The share bike's basket sits on its bars on a head-tube bracket, and the bamboo child seat rests on its carrier. Learned: widening the lamp by eleven pixels did more for it than any amount of detail at 11 px.
