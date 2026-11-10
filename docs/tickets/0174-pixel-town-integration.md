---
id: 174
title: Walk the town in pixel art
status: doing
priority: high
type: feature
created: 2026-11-10
---

## Why

The town still renders through the old isometric painter.

## Done when

- A `town` pixel scene compiled from `map.json` (ground layers, one sprite per prop, lights, marks), rendered in the game for the town map.
- Walking, exits, NPCs and DOM labels work; rules tests and the Playwright journey pass; headless screenshots at phone and desktop.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Owner: Claude worker (Opus). Branch `claude/0174-pixel-town-integration`; worktree `/Users/callumhemsley/Personal/junyan-px-0174`; Vite port 5198 strict (preview 5199 for production journeys). Silent: no audio, headless browser only.
