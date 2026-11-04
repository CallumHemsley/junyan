---
id: 51
title: Write the opening's pure rules and the hand-off to day 1
status: done
priority: high
type: feature
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] makes the opening a phase before day 1 whose step logic is a pure function, tested in Vitest like `src/game.ts`. The waiter loop's `pickup` and `deliver` depend on the kitchen, the tables and the orders, and lead into payment, so the opening cannot reuse them. It reuses their action shapes only. This ticket adds the rules and no UI. It is PR 0051 in the plan `docs/plans/hospital-opening.md` (section PR 0051).

## Done when

- [x] A `Session` wraps the game instead of extending it: `{phase: 'opening'; opening: OpeningState} | {phase: 'day'; game: GameState}`.
- [x] `reduceSession` routes to `reduceOpening` or `reduceGame`. Both are pure. RNG and time are injected.
- [x] `OpeningState` tracks the step index, the tray item in hand, the recovered words and the journal.
- [x] The opening accepts actions with the same shapes as `pickup` and `deliver` for the bedside tray. The right item advances the step. A wrong item (馒头 when 老爷爷 wants 豆浆 or 鸡蛋) produces the `不对，我要…` line and waits.
- [x] A reply action advances the reply step with the chosen option (好 or 谢谢).
- [x] A step's `recover` list is applied when the step completes, and recovered words enter the journal flagged as recovered. A `lookup` during the opening counts as a lookup only.
- [x] The end step returns `{phase: 'day', game: {...createGame(content, seed), journal: opening.journal}}`. A save is always a day session. Nothing in the opening is saved.
- [x] Unit tests in Vitest only, with no React, DOM or storage: step order through the whole variant A script, wrong-item handling, reply handling, recovery per step, lookup without recovery, and the hand-off with the recovered journal on day 1.
- [x] `pnpm test` and `pnpm build` are green.
- [x] Live check: open day 1 in the preview and confirm the game is unchanged, since no UI uses the session yet. The full Playwright suite at head covers the unchanged first screen and journey; see Notes.
- [x] Perf budget: one `reduceOpening` call takes under 1 ms, and the Vitest suite stays under 4 s.

## Notes

- Depends on: 0048 (the `recovered` journal field) and 0050 (the `opening` content).
- Owns: new `src/opening.ts` and `src/opening.test.ts`. Put `Session` and `OpeningState` there.
- Must not touch: `src/game.ts`, `src/save.ts`, `src/App.tsx`, `src/content/`, `src/scene/`, `e2e/`. If `src/contracts.ts` needs a type, the change is serialized: no other ticket may edit it at the same time.
- Ports: `JUNYAN_DEV_PORT=5308`, `JUNYAN_PREVIEW_PORT=5309`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D4 (opening part). In the opening, words recover from each step's `recover` list, and a lookup alone recovers nothing.
- Pointers: `src/contracts.ts:48-74` GameState, Customer and Action; `src/game.ts:133` `reduceGame`; `src/game.ts:66-100` seeded RNG in `startDay`; `src/game.ts:197-211` `pickup` and `src/game.ts:226-253` `deliver` for the action shapes; `spikes/hospital-opening/app.js` for the prototype state machine.
- Progress (2026-11-04): owner Claude Code (Opus 5.5), branch `claude/0051-opening-rules` stacked on `claude/0050-opening-content`, worktree `.claude/worktrees/agent-a1616e29af83a9cbb`, ports 5308 and 5309. Baseline `pnpm test` at the 0050 head: 7 files, 129 tests.
- Done (2026-11-04). `src/opening.ts` holds `OpeningState`, `Session`, `OpeningAction`, `SessionAction`, `NEXT_BED`, `createOpening`, `createSession`, `reduceOpening`, `handoffJournal` and `reduceSession`. The types live there, not in `src/contracts.ts`, so `contracts.ts` is untouched. `src/game.ts` exports `recordLookup`, shared by both reducers, and `recoverWords` now ignores a time that is not finite and non-negative.
- Verified: `pnpm test` 8 files, 141 tests (129 at the 0050 head, plus 11 opening cases and 1 recoverWords case), suite about 3.4 s. `pnpm build` green. Eight hand mutations of `src/opening.ts` each fail at least one opening test. The purity greps over `src/opening.ts` print nothing. Full `pnpm test:e2e` on ports 5308 and 5309: 128 passed, 4 skipped, 3 phone specs timed out at 90 s while the machine load average was about 27. Those 3 (`save.spec.ts` duplicate-tables and four-served-no-end, `startup-focus.spec.ts` queued open) passed on rerun at the same head, 10 of 10 in 30 s.
- Perf, 10 alternating rounds of 1000 replays: day-session median per action 0.48 us at head against 0.51 us at trunk; opening per action median 0.13 us, p95 0.5 us (near the timer step); full opening replay median about 3.3 us; handoff median about 1.1 us.
- Learned: recovery is kept as `recovered: wordId -> step index` during the opening and only written into the journal at the handoff, because only `advance` carries a time; `deliver` has none. `recoverWords` then stays the only writer of the `recovered` flag. A word in two recover lists keeps the first step's index. `pickup` after a wrong delivery clears the `wrong-food` feedback, as in the day.
- Follow-ups: none in scope. `createOpening` takes `content` per the plan's signature but does not read it; 0055 may drop the argument.
