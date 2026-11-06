---
id: 117
title: Initialize restored interaction targets at the saved world clock
status: done
priority: medium
type: bug
created: 2026-11-06
---

## Why

The actual full-service/both-reading-places journey restored a player beside the earned reader. Rendering starts from saved life time, but interaction targets initialize at zero until the first half-second clock update. That briefly samples the resident at home while the scene samples her earned reading position, so immediate greeting can miss its actual target.

## Done when

- Initial target sampling uses the same saved clock as the existing render clock; subsequent updates and map changes keep the existing behavior.
- The normal-input full service, both earned arrangements, return-before-edit, map leaving/reentry and immediate restored greeting journey passes without forced clicks or state injection.
- Existing focused world/life checks remain green and the one-line change receives independent review.

## Notes

- Root owns branch codex/0117-restored-target-clock; worktree /private/tmp/junyan-world-restored-clock; integration preview5542 is used after intake for exact ordinary-input verification.
- No new state/schema/timing mechanism, actor moves, save changes or deferred test-only workaround. The target clock should start from the existing saved life.elapsedMs, exactly like the render elapsed ref.
- All new raw QA stays private0102/combined-normal-use and0117.

- Independent no-edit review confirmed both initial clocks now agree without altering cadence or map behavior. 144 focused world/life/save/reading tests, TypeScript/build pass; exact ordinary-input opening→all four releases→both earned arrangements→return→hall reentry→phone/reduced motion→immediate restored greeting now passes cleanly with the original greeting helper and no timing workaround.
