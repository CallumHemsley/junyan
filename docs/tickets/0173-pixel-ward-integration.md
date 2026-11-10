---
id: 173
title: Play the hospital opening in the pixel ward
status: doing
priority: high
type: feature
created: 2026-11-10
---

## Why

The opening still renders the old ward scene.

## Done when

- `HospitalOpening` renders the pixel `ward` scene through `PixelView`, driven by `wardFrame`; DOM text and controls unchanged.
- Rules tests and the opening's Playwright journey pass; headless screenshots at phone and desktop.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: owner Claude Code (worker), branch `claude/0173-pixel-ward-integration`, worktree `/Users/callumhemsley/Personal/junyan-px-0173`, Vite dev port 5196 (preview 5197), both `strictPort`.
