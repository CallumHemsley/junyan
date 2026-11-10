---
id: 171
title: Draw the hospital ward's floor, walls and window
status: doing
priority: high
type: feature
created: 2026-11-10
---

## Why

The ward is the first thing a player sees.

## Done when

- `ward/` floor, wall slices, window, door, curtains, radiator, nurse-call panel, clock and notice board, per `docs/design/pixel-contracts.md`.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Owner: Claude Code (pixel worker). Branch `claude/0171-pixel-ward-architecture`, worktree `/Users/callumhemsley/Personal/junyan-px-0171`. No dev server or port: art is checked with `sheet.ts` and a scratch scene under `output/pixel/0171/scratch/`.
- Owns only `src/pixel/sprites/ward/arch-*.ts` and `src/pixel/sprites/ward/_arch.ts`; ticket 0172 draws `ward/furn-*.ts` in parallel.
