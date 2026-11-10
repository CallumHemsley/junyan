---
id: 163
title: Draw the town's ground
status: todo
priority: high
type: feature
created: 2026-11-10
---

## Why

The town needs paving, road, brick lanes, stone, grass and canal water that read as worn French Concession lanes, with edges where materials meet.

## Done when

- `ground/<material>-a..d` for grass, paving, road, brick, stone, water (animated), plus edge/kerb tiles.
- `src/pixel/town/groundLayers()` produces variants, kerbs and transitions over the whole 80×64 map.
- Renders of the whole map and close-ups reviewed; `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
