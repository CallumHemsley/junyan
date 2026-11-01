---
id: 26
title: Reject inconsistent saved game states before restoring play
status: done
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

- Implementation: Sol 6.1, branch `t3/saved-state-validation`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-ad4e4be1`; strict dev port 5184 and preview port 5188.

- Reserved centrally by parent; owner Sol 6.1 medium implementation worker with own branch/worktree and strict port.
- Reviewer evidence: `output/playwright/usability-review/invalid-save-empty-table.png` and `invalid-save-four-served-no-end.png`; HEAD `536f9d9`.
- Primary ownership `src/save.ts` and new save tests. Coordinate the minimal App load-site adjustment with audio/UI workers rather than broad App edits.
- All test output must be muted without changing the user's system volume. Preserve actual Pixel Plays and existing offline content/audio.
- Added pure `validateSavedGame(value, content)` at the IndexedDB read boundary. Checks complete unique tables, table/level/content-specific playable orders, tray IDs, served phases/count/completion, day/level, navigable player positions, safe finite numeric bounds, earned totals and active-table/receipt references. App changes are confined to the load effect.
- Learned: earnings carry across days; receipts can legitimately survive movement, pickups, returns and a wrong delivery to a different active table. Do not require a receipt to match the active table or current feedback. Historical journal word IDs remain intact and finite fractional lookup timestamps remain valid.
- Invalid-save tradeoff: return `null`, retain App's fresh playable day-one fallback, then replace the corrupt save through normal autosave. This deliberately does not salvage the invalid save's journal or progress; valid saves/journals are preserved.
- Verification: `pnpm test` passes 69 tests (31 new save cases, including every reducer-produced checkpoint across five days for four seeds, wrong food/change, full trays and stale receipts). `pnpm build` passes; existing upstream Zod/Rollup annotation warnings only.
- Silent browser command: `pnpm exec playwright test --config playwright.save.config.ts` passes 14 desktop/phone tests: eight real IndexedDB save regressions plus six existing waiter journeys. Chromium always launches with `--mute-audio`; no system volume changes. The dedicated config uses strict dev port 5184. Production preview/offline tests were not rerun; 5188 remains reserved for preview.
- Evidence inspected at desktop and phone widths: `output/playwright/save-desktop-four-served-no-end.png`, `save-phone-duplicate-tables.png`; additional screenshots for each corrupt fixture and next-day journal are in the same directory. Corruption regressions and full waiter journeys assert a clean browser console. Art, WAVs, content, contracts, dependencies and lockfile unchanged. Parent owns integration and independent review.
