---
id: 165
title: Draw the town's shopfronts
status: doing
priority: high
type: feature
created: 2026-11-10
---

## Why

The restaurant's street face, the tea house, the workshop and the shops are the town's landmarks.

## Done when

- One `town/<id>` sprite per `building-restaurant`, `building-tea`, `building-workshop`, `building-shop`, `building-shutter`, `awning` prop.
- The restaurant exterior matches the bistro interior; signs are blank boards.
- `tsc -b` and pixel tests pass.

## Notes

- 2026-11-10: owner Claude (pixel worker), branch `claude/0165-pixel-shopfronts`, worktree `/Users/callumhemsley/Personal/junyan-px-0165`, no dev server.

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
