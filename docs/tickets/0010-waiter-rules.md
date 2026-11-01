---
id: 10
title: Implement pure waiter rules and recall progression
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why
Make collecting and recalling Mandarin orders testable without rendering.

## Done when
Pure deterministic rules implement the shared contracts, with meaningful unit tests.

## Notes
Reserved for Sol 6.1 medium rules worker. Port 5174.

Owner: Sol 6.1 medium implementation worker. Branch: `t3/implement-game-rules`.
Worktree: `/Users/callumhemsley/.t3/worktrees/junyan/t3-76ff49ac`. Port: 5174.
Progress: complete. Implemented `createGame`, `reduceGame`, `getOrder`, `orderTotal`, `isNear` and `canVisitKitchen` against unchanged `src/contracts.ts`; decision 0003 governs gameplay.

Verification: `pnpm exec vitest run src/game.test.ts` passed (21 tests); `pnpm exec tsc --noEmit` and `git diff --check` passed. Fixtures are local to the rules test and independent of the content worker. No browser journey, screenshots or console inspection: this worktree contains the rules/contracts scaffold only, with UI integration owned by the parent.

Learned: four regulars are selected by their fixed table, at exact levels 1 → 2 → 3 (capped), using a deterministic seed cursor. Full-tray matching aggregates duplicate food lines. Kitchen pickup requires at least one collected order; food can be returned only at the kitchen. Invalid positions/actions are ignored; bad food/change stays retryable. Daily served/mistake counts reset, while earnings and lookup journal accumulate. `createGame`/next-day explicitly throw if content lacks a playable order for a table/level; `orderTotal` returns NaN for invalid item/price data. Content schema validation remains the content worker's responsibility.
