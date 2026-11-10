---
id: 157
title: Play the waiter loop in the new pixel cafe
status: doing
priority: high
type: feature
created: 2026-11-10
---

## Why

The cafe is redrawn as top-down pixel art (tickets 0149–0156) and composed as `src/pixel/scenes/cafe.ts`, but the playable game still renders the old isometric restaurant. Callum wants to play the new cafe.

## Done when

- Entering the restaurant in the real game renders the pixel cafe through `src/pixel/engine` (`PixelView`), with the waiter walking on cardinal keys, tap-to-move, collision from the scene.
- Customers appear seated at their tables from game state, the waiter shows `carry-*` while the tray holds food, served food appears on tables, the kitchen pickup and tables are the interaction points.
- All Chinese text stays DOM, positioned via the camera; no text in canvas.
- Rules tests and the existing browser journey pass, adjusted only where the camera change requires.

## Notes

- Owner: Claude worker (Opus). Branch `claude/0157-pixel-cafe-integration`; worktree `/Users/callumhemsley/Personal/junyan-px-integration`; port 5192 strict. Silent: no audio, headless browser only.
