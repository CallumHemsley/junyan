---
id: 185
title: Draw the courtyard's white and black story cats
status: doing
priority: high
type: feature
created: 2026-11-11
---

## Why

The courtyard story has two cats whose colour is a clue (the white cat and the black cat), but both draw as the grey street tabby (`critter/cat-tabby`).

## Done when

- `critter/cat-white` and `critter/cat-black` exist with the tabby's actions (`idle`, `walk`, `sleep`) in down/left/right, same scale and conventions.
- The pixel game maps the story cats (`white-cat`, `black-cat`) to them; any other cat stays the tabby. Pure mapping, unit-tested.
- `tsc -b` and `vitest run src/pixel src/world` pass.

## Notes

- Owner: Claude Code (pixel worker). Branch `claude/0185-story-cats`, worktree `/Users/callumhemsley/Personal/junyan-px-0185`, base `claude/0176-outdoor-map-pipeline`. No dev server (offline renders only).
