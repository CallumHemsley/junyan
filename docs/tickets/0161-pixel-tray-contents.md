---
id: 161
title: Show what is really on the waiter's tray
status: todo
priority: medium
type: feature
created: 2026-11-10
---

## Why

The waiter's `carry-*` sprites draw a fixed steamer and soy-milk bowl, whatever the player actually picked up. The tray should show the real order.

## Done when

- The tray sprite is drawn without food, and the items actually on the tray are drawn on it from game state (up to three, nearest-first layout), in every facing and walk frame.
- The tray contents come from pure code in `src/world/pixel/cafe.ts` with unit tests; rendering stays thin.
- `tsc -b`, `vitest run` and `e2e/pixel-cafe.spec.ts` pass, headless and silent.

## Notes

- Part of the pixel-art polish pass after ticket 0157. Style rules in `docs/design/pixel-art.md`.
