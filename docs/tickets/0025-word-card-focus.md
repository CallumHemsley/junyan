---
id: 25
title: Fix word card focus and in-game home navigation
status: todo
priority: high
type: bug
created: 2026-11-01
---

## Why

The independent Astra reviewer reproduced focus escaping an open word card and Escape dismissing both the card and its parent table dialog.

The reviewer also confirmed that the production brand link uses `/` and leaves the `/junyan/` game for an unrelated personal homepage. Include this small navigation correction in the same App UI change.

## Done when

- Opening a word card moves focus into it; Tab and Shift+Tab stay within the top overlay.
- Escape closes only the word card, returning focus to its triggering word; subsequent Escape can close the parent dialog.
- The home link resolves to the deployed game base path and keeps production navigation within `/junyan/`.
- Relevant browser regressions pass with all test output muted, and no audio logic changes overlap ticket 0021.

## Notes

- Reserved centrally by parent on `codex/0018-character-voices`; writer records own worktree, branch and strict port.
- Reviewer evidence: `output/playwright/usability-review/desktop-word-focus.png`, HEAD `536f9d9`, App.tsx parent focus effect around 190–220 and word card around 748–783.
- Reproduction: open table 1, tap first greeting word; focus lands on underlying table close, Tab reaches underlying replay, Escape closes both overlays.
- Owner: Sol 6.1 medium implementation worker. All tests must be silent without changing system volume.
- Additional production evidence: `output/playwright/usability-review/production-home-leaves-game.png`; App.tsx brand link around line 326.
