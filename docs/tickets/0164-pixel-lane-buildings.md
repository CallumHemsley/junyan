---
id: 164
title: Draw the town's lane houses
status: todo
priority: high
type: feature
created: 2026-11-10
---

## Why

Residences, row houses and the pump house make up most of the town; they must feel lived in, not tiled.

## Done when

- One `town/<id>` sprite per `building-residence`, `building-row`, `building-utility`, `steps`, `open-door-leaf`, `threshold-mat` prop, per `docs/design/pixel-contracts.md`.
- Shikumen stone-gate details, roofs from above, doors where the map's exits are.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
