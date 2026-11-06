---
id: 97
title: Resolve clock serialization and duplicate voice notices
status: done
priority: high
type: bug
created: 2026-11-06
---

## Why

Final browser verification found an idle repaint caused by life-field serialization order and duplicate failure notices outside the restaurant.

## Done when

Clock-only restoration preserves reduced-motion idle rendering regardless of life object key order. A failed voice shows exactly one notice with an activity open. Focused regressions and independent review pass before integration.

## Notes

- Centrally reserved after world/0096. Owner GPT-6.1 Sol High, branch `codex/0097-final-world-regressions`, worktree `/private/tmp/junyan-world-final-fixes`, strict ports 5524/5525.
- Exclusive files: `src/App.tsx`, `src/world/render-invalidation.ts`, `src/world/render-invalidation.test.ts`, this ticket. No other production, E2E, shared contract, dependency or audio edits.
- Root integration is running its independent 88-case batch; keep these fixes isolated until handback. New generated QA remains private.
- Independent source and live review passed: first-clock idle rendering remains quiet, preference changes and real movement repaint, and the console is clean. The combined integration passed 612 source tests; desktop and phone native voice-failure/replay checks passed with one notice. The four strict scheduling checks passed without relaxed waits or tolerances.
- Implemented: compare non-clock life values in a fixed field order, so constructor versus Zod key order cannot dirty an idle scene. Floating voice failures are hidden while the contextual activity owns the notice.
- Regression reproduced before the fix with `createWorld` → `restoreWorld` → `reduceWorld(world-clock)`. Added coverage retaining repaint on reactions, resident pauses and service departures; existing movement, discovery and gameplay coverage remains green.
- Node 22.23.4 verification: 33 tests passed across render invalidation, frame cadence, life rendering and presence; `pnpm build` passed including TypeScript. Existing Zod annotation/chunk-size warnings remain. Independent review and integrated browser verification are pending; status remains `doing` until those gates pass.
