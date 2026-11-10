---
id: 149
title: Rebuild the game graphics from the ground up as detailed top-down pixel art
status: done
priority: high
type: feature
created: 2026-11-09
---

## Why

Callum: the graphics are a proof of concept and worse than before. Rebuild them from the ground up to Stardew Valley quality or better, starting with the cafe, in a way every other level and future work reuses.

## Done when

- A code-authored pixel-art pipeline (palette, kit, sprite contract, contact-sheet and compose tools) and a binding style bible exist.
- A pure-TypeScript top-down renderer draws scenes from sprites, in Node and the browser.
- The cafe is redrawn to the new bar and Callum has reviewed screenshots.
- The cafe is wired into the playable game; other maps follow in later tickets.

## Notes

- Owner: Claude Code (orchestrator, art direction). Branch `claude/0149-pixel-art-foundation`; worktree `/Users/callumhemsley/Personal/junyan-pixel-art`; port 5190 strict.
- Style bible: [[design/pixel-art]]. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Worker tickets: 0150 engine, 0151 architecture tiles, 0152 kitchen, 0153 furniture, 0154 decor, 0155 food, 0156 characters. Workers branch from this ticket's foundation commit and merge back here after review.

- Done 2026-11-10: merged to main with the pixel cafe (Shanghai bistro) and the 0158–0161 polish pass. Learned: art as deterministic code over one palette lets workers iterate by rendering PNGs headless; depth sorting of table items and seated actors needs explicit sortY.
