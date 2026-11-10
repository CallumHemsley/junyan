---
id: 158
title: Give the lacquer chairs and banquette their wear
status: done
priority: medium
type: feature
created: 2026-11-10
---

## Why

In play the black-lacquer bentwood chairs read as flat black silhouettes: the wear that gives them a history barely shows. The banquette's draped coat is a flat slab with no folds.

## Done when

- `furn/chair-bentwood-b-*` (all four facings) show lacquer worn through to brown wood at the hand and knee points, with a highlight along the bent hoop, readable at play zoom (3x).
- The banquette's coat has fabric folds, a collar and a sleeve, and drapes over the backrest edge.
- Nothing else in `furn/` changes size or anchor; `tsc -b` and the pixel tests pass.

## Notes

- Part of the pixel-art polish pass after ticket 0157. Style rules in `docs/design/pixel-art.md`.
- 2026-11-10: owner Claude Code; branch `claude/0158-pixel-polish-furniture` (from `claude/0149-pixel-art-foundation`); worktree `/Users/callumhemsley/Personal/junyan-px-polish-furn`; no port (Node renders only). Before renders in `output/pixel/polish-0158/before-*.png`.
- 2026-11-10 done. Lacquer chairs: a lacquer-only finish pass re-lights every member from the upper left (plum black on lit edges, cool black on shaded ones), hand-places a steel shine along the hoop's upper-left arc, the posts and the seat rim, and wears through to `wood2`–`wood5` on the hoop top, the seat front edge, both knees and the front of the stretcher, per facing. The biggest single win was outlining only the outside of the silhouette: the old outline ringed every member and every hole in ink, which is what made the chair a black blob; with the holes left clear the floor shows through the openwork. Walnut chairs are unchanged. Coat: redrawn as a camel Chesterfield hung by its shoulders over the rail (velvet collar, plum lining in the lapel V, three buttons, pocket flaps with gloves in one, a suede elbow patch), one sleeve hanging past the seat front, the other ending at the seat, the skirt folded onto the cushion with a lining flash at the hem, plus its shadow on the leather. Learned: for a dark material, interior outlines cost more readability than any highlight buys back; and `relight` (edge lighting from transparency) is a reusable trick worth promoting to `_helpers.ts` if other dark openwork appears. Before/after renders: `output/pixel/polish-0158/`.
