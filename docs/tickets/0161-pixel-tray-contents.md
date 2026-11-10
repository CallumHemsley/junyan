---
id: 161
title: Show what is really on the waiter's tray
status: done
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
- 2026-11-10: doing. Owner Claude Code; branch `claude/0161-pixel-tray-contents` (from `claude/0149-pixel-art-foundation`); worktree `/Users/callumhemsley/Personal/junyan-px-tray`; Vite port 5194 (`strictPort`).
- 2026-11-10: done. The rig's `_tray.ts` now draws only the board and hands. Seven tray-scale dishes (`food/tray-<foodId>/carry-{idle,walk}-down`, `src/pixel/sprites/food/carried.ts`, 11×12 boxes) keep their table serving's crockery so they read as the same dish. `trayDishes`, `traySlot`, `TRAY_SLOTS`, `trayActors` and `waiterActors` in `src/world/pixel/cafe.ts` map `game.tray` to up to three actors (distinct foods first, then repeats, nearest first), with per-facing offsets, left mirrored from right; `CafeView` only calls `waiterActors`. Unit tests in `cafe-map.test.ts`.
- Learned: the cheapest way to make a separate actor follow the walk bob is to give it the waiter's action, distance and phase and bake the bob (`ACTIONS[action].frames[i].body`) into frames of the same count and fps, so the engine's frame choice keeps them in step without engine changes; a test pins the frame counts and fps to the player's. Odd-width dishes on the waiter's even-symmetric frame mirror as `dx → −1 − dx`. Facing up, the dishes sort just behind the waiter and sit at the board's ends so a rim peeps out beside the body; a clean fix would draw the up-facing board as its own actor so dishes could sit between it and the body. In profile three dishes overlap heavily on the 17-px board; the back two stand two rows higher so they show over the near one.
- Evidence: `output/pixel/polish-0161/` (sheet, dish sheet, desktop 1440×900 and phone 390×844 game captures with one and three dishes, walking left and facing down).
