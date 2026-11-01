---
id: 26
title: Reject inconsistent saved game states before restoring play
status: todo
priority: high
type: bug
created: 2026-11-01
---

## Why

The independent Astra reviewer reproduced persistent reload softlocks because saved state validation checks field types but admits impossible customer/table and day-completion combinations.

## Done when

- Duplicate/missing tables and impossible served-count/ended combinations cannot restore a stuck game.
- Saved order references match their table and playable level/content; relevant receipt and active-table references are consistent.
- Valid existing saves and journals still reload and progress across days.
- Meaningful validation and browser reload regressions pass silently; invalid-state fallback behavior is recorded.

## Notes

- Reserved centrally by parent; owner Sol 6.1 medium implementation worker with own branch/worktree and strict port.
- Reviewer evidence: `output/playwright/usability-review/invalid-save-empty-table.png` and `invalid-save-four-served-no-end.png`; HEAD `536f9d9`.
- Primary ownership `src/save.ts` and new save tests. Coordinate the minimal App load-site adjustment with audio/UI workers rather than broad App edits.
- All test output must be muted without changing the user's system volume. Preserve actual Pixel Plays and existing offline content/audio.
