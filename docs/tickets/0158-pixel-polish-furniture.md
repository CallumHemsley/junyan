---
id: 158
title: Give the lacquer chairs and banquette their wear
status: todo
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
