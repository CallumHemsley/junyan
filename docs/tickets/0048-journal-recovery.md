---
id: 48
title: Record word recovery on journal entries
status: done
priority: high
type: feature
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] makes a word "recovered" when the player acts on it correctly, and the journal (本子) becomes the list of recovered memories. Today a journal entry is only `{lookups, lastSeen}`, and `lookup` rebuilds each entry from scratch, so any new field would be dropped. This ticket adds the recovery field to the state and the save format, with no UI change. It is PR 0048 in the plan `docs/plans/hospital-opening.md` (section PR 0048).

## Done when

- [ ] The journal entry type in `src/contracts.ts` gains an optional `recovered` flag. The exact shape follows the plan section PR 0048.
- [ ] `lookup` in `src/game.ts:138-159` spreads the previous entry, so it keeps `recovered` and any later field. A lookup alone never sets `recovered`.
- [ ] `stateSchema` in `src/save.ts:9-40` accepts `recovered` on journal entries (today it strips unknown keys). Saves without the field still validate.
- [ ] Legacy rule: when `validateSavedGame` (`src/save.ts:42-101`) loads a save with no recovery flags, every word already in the journal counts as recovered.
- [ ] The localStorage checkpoint `junyan-waiter-pending-v1` round-trips `recovered` the same way as the IndexedDB `v1` save.
- [ ] Unit tests in `src/game.test.ts` and `src/save.test.ts` cover these cases: a lookup on a recovered word keeps the flag, a lookup on a new word does not set it, a save with flags round-trips, and a legacy save marks every journal word recovered on load.
- [ ] `pnpm test` and `pnpm build` are green.
- [ ] Live check: in the production preview, load a day-1 save written by the current build and confirm the game opens on that day with the same journal and no save warning.
- [ ] Perf budget: the Vitest suite stays under 3 s and save validation adds no measurable startup time.

## Notes

- Depends on: 0047.
- Owns: `src/contracts.ts` (journal entry type only), `src/game.ts` (`lookup` only), `src/save.ts`, `src/game.test.ts`, `src/save.test.ts`.
- Must not touch: `src/App.tsx`, `src/content/`, `src/scene/`, `e2e/`, `public/`. Do not change `deliver` or `pickup`: restaurant recovery lands in 0056.
- `src/contracts.ts` and the save schema are shared. Changes to them are serialized: no other ticket edits them while this one is open.
- Ports: `JUNYAN_DEV_PORT=5302`, `JUNYAN_PREVIEW_PORT=5303`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product defaults this ticket implements, which Callum may overrule:
  - D4 (legacy part). A save with no recovery flags treats every word already in the journal as recovered on load.
  - D5 (data part). The journal holds both recovered and looked-up words. The display change lands in 0056.
- Pointers: `src/contracts.ts:48-74` GameState; `src/game.ts:133` `reduceGame`; `src/game.ts:138-159` `lookup`, the only journal writer; `src/save.ts:35-38` journal entry schema; IndexedDB `junyan-waiter` v1, store `saves`, key `v1`; checkpoint write `src/App.tsx:79-88`, read `src/App.tsx:115-126`.
- Owner: Claude Code (autopilot-stack owner, taking over a stopped owner). Branch `claude/0048-journal-recovery`, worktree `.claude/worktrees/agent-a1995f2ca82a73ccd`, ports 5302 and 5303. Based on `claude/0047-opening-rules-docs`.
- Progress: done. `JournalEntry` in `src/contracts.ts`, `lookup` spreads the previous entry, `recoverWords(journal, wordIds, now)` in `src/game.ts` is the only recovery writer, the save schema defaults a missing flag to `true`, and the startup effect in `src/App.tsx` writes a validated checkpoint back. Unit and e2e tests cover each case in the plan, and "treats a journal word saved without a recovery flag as recovered" in `src/save.test.ts` names the legacy rule.
- The plan section overrides two lines above. It edits `src/App.tsx` and `e2e/save.spec.ts`, and the in-memory flag is required, not optional. Only the saved form is optional.

## Learned

- `recovered: z.boolean().default(true)` in `stateSchema` holds the whole legacy rule. A map over the journal after validation would not type-check, because `getOrder` needs a `GameState` before the final return.
- A legacy checkpoint changes shape on load, so the autosave compare (`localStorage` string equals `JSON.stringify(state)`) never matched and never cleared it. The write-back fixes that. The e2e case "legacy checkpoint is rewritten and cleared after autosave" fails on both projects without it.
