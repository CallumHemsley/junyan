---
id: 108
title: Frame the active furniture brief on narrow screens
status: doing
priority: high
type: bug
created: 2026-11-06
---

## Why

The normal-input gameplay audit completed both briefs but found that the second window and editable floor were offscreen on a narrow view. The player's stationary position kept the camera at the first bay while editing disabled movement, leaving the grid as a workaround for missing scene context.

## Done when

- Opening and switching furniture briefs show the relevant window and usable floor, with native placement previews inside the actual space left by the interaction panel on phone and desktop.
- Derive presentation focus from explicit project state and geometry. Preserve player position, collision, saved progress, accurate production picking, panel/word-card recovery, reduced motion and closed-room exploration framing.
- Actual native pointer/touch placement in both bays, brief switching and close/reopen prove the change; focused geometry/framing checks catch the original cropped context. No new unvoiced visible copy.

## Notes

- Centrally reserved after 0107. Owner GPT-6.1 Sol High; branch `codex/0108-brief-framing`, worktree `/private/tmp/junyan-world-brief-framing`, strict ports 5558/5559.
- Lease a small pure reading-room view-focus selector/tests, a narrow generic WorldViewport presentation-focus input/camera hookup, App wiring, and corresponding production-camera test callers. No map/anchor movement, actor resize, teleport, progression/schema or dependency changes.
- Propose the exact interface before implementation. Account for actual panel dimensions, valid placement extents and the window's height; do not just move the existing interaction anchor again or add a screenshot-specific pixel offset.
- 0107 independently owns target-label wording. Keep all raw QA private and do not push or merge from the worker.
