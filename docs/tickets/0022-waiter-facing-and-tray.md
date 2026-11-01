---
id: 22
title: Improve waiter proportions and facing-relative carried objects
status: todo
priority: high
type: bug
created: 2026-11-01
---

## Why

Callum's first public playtest requests reliable first-dialogue audio, better character design and correct tray occlusion, plus a usability break review.

## Done when

- Requested behavior is verified against a repeatable reproduction or inspected render, with appropriate regression coverage.
- Applicable rules/browser checks pass; visual changes are inspected at phone and desktop sizes.
- Evidence, limitations and review findings are recorded before integration/publication.

## Notes

- Reserved centrally by parent on `codex/0018-character-voices`; writer must record own branch, worktree and strict port.
- Owner: Astra visual orchestrator; Sol 6.1 medium implementation worker.
- Four deterministic render angles at player (6,6) show fixed-world tray/food while body turns; stiff long limbs and disconnected raised arm match user screenshots. Evidence: output/playwright/diagnosis/waiter-before-directions.png and four RGBA buffers. Preserve actual Pixel Plays rasterizer, DOM Chinese, authored personalities.
