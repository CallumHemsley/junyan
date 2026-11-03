---
id: 47
title: Commit decision 0004 and the spike, and amend the rule texts for the opening
status: done
priority: high
type: chore
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] is accepted, but it and its prototype are untracked, so worker clones (cut from HEAD by `orchestration/bin/worker.sh:15-17`) cannot see them. The project rules still say "no English" everywhere, so every later PR of the hospital opening would fail review against them. `orchestration/bin/verify.sh` also never runs Playwright. This ticket is PR 0047 in the plan `docs/plans/hospital-opening.md` (section PR 0047). It changes no game code and unblocks every other ticket from 0048 to 0056.

## Done when

- [x] `docs/decisions/0004-hospital-opening.md` is committed as accepted.
- [x] `spikes/hospital-opening/` is committed with its code, `content.js` (the final script), `art.js`, `index.html`, `app.js`, `verify.mjs`, `voice/generate.py`, `voice/provenance.json`, `CONTRACT.md` and `shots/`.
- [x] A spike-local `spikes/hospital-opening/.gitignore` excludes `audio/*.wav` and `voice/auditions/`. The audio regenerates with `voice/generate.py`.
- [x] `docs/decisions/0001-first-language.md` gains one line under point 2 that links `[[decisions/0004-hospital-opening]]` as the opening's exception.
- [x] Every rule text that the decision's Consequences section lists is amended, word for word as listed there:
  - `AGENTS.md` "What the game is": the "No English" rule gains the opening exception, and a one-minute hospital opening comes before the breakfast stall.
  - `AGENTS.md` "Verification": the journey reads "open, play the opening, serve three customers, give change, journal a word".
  - `docs/design/design-system.md` "Content fundamentals" (Chinese only) and rule 6 (no English, pinyin or emoji in the game UI) gain the opening as the one exception. UI chrome stays Chinese.
  - `docs/design/design-system.md` "Usage rules" allows a fog style for unrecovered words. The fog values themselves land in 0056.
  - `docs/tickets/0004-pin-down-the-hook.md`: "no English" becomes "no English after the opening".
  - `README.md` ("All game text is simplified Chinese") and `docs/ideas/vision.md` ("from the first second") gain the same exception.
- [x] `orchestration/RUNBOOK.md:19`, `orchestration/RUNBOOK.md:51` and `orchestration/worker-prompt-template.md:16` allow English only in the opening's premise lines, as bounded by decision 0004 point 5.
- [x] `orchestration/bin/verify.sh:18` runs `pnpm test:e2e` when `package.json` has a `test:e2e` script (today it looks for an `e2e` script, which does not exist).
- [x] Unit tests: none are added. `pnpm test` (110 tests) and `pnpm build` stay green.
- [x] Live check: run `orchestration/bin/verify.sh` with this ticket's ports and confirm from its log that the Playwright suite ran and passed.
- [x] Perf budget: no runtime change. The built JS stays at 401 kB.

## Notes

- Depends on: none. Every other hospital-opening ticket (0048 to 0056) depends on this one.
- Owns: `docs/decisions/0004-hospital-opening.md`, `docs/decisions/0001-first-language.md`, `spikes/hospital-opening/**`, `AGENTS.md`, `docs/design/design-system.md` (rule text only), `docs/tickets/0004-pin-down-the-hook.md`, `README.md`, `docs/ideas/vision.md`, `orchestration/RUNBOOK.md`, `orchestration/worker-prompt-template.md`, `orchestration/bin/verify.sh`.
- Must not touch: `src/`, `e2e/`, `public/`, `scripts/`, `package.json`, the lockfile, any other ticket. Leave `.claude/launch.json` out of the commit.
- `AGENTS.md` is a shared instruction file. Changes to it are serialized: no other ticket edits it while this one is open.
- Ports: `JUNYAN_DEV_PORT=5300`, `JUNYAN_PREVIEW_PORT=5301`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D10. This PR commits decision 0004 and the spike (without the WAVs or the auditions), amends the rule texts that the decision lists word for word plus the runner rules, and makes `verify.sh` run `test:e2e`.
- Pointers: rule text list in `docs/decisions/0004-hospital-opening.md` (Consequences, "Rule text to amend"); ticket format `docs/tickets/README.md:7-22`; runner clone `orchestration/bin/worker.sh:15-17`.
- Owner: Claude Code PR owner under the autopilot-stack program. Branch `claude/0047-opening-rules-docs`, cut from `bdac355`. Worktree `.claude/worktrees/agent-aeca60e7a900b8f9c`. Ports `JUNYAN_DEV_PORT=5404`, `JUNYAN_PREVIEW_PORT=5405`, strict, as the plan's verify box names (the 5300 pair above was superseded by the plan).
- Result: `pnpm test` 110 passed. `pnpm build` passed, JS 400.97 kB. `verify.sh` on 5404/5405 ran Playwright and logged `119 passed`, `4 skipped`, `verify exit 0`. The 4 skips are opt-in by design (two need the dedicated audio projects, two need `OFFLINE_RELEASE_REBUILD=1`), so 123 is the total, not the passed count.
- Learned:
  - The `e2e` check in `verify.sh` is on line 19, not 18. Before this change, `verify.sh` never ran Playwright, so earlier "verify exit 0" logs prove only unit tests and the build.
  - `verify.sh` appends to the tracked `orchestration/log/journal.md` and leaves an untracked `orchestration/log/verify-<stamp>.log`. Each run dirties the tree, so a worker must not commit those by accident.
  - In a fresh clone, `spikes/hospital-opening/verify.mjs` finishes all seven runs but exits 1, because every voiced line logs `ERR_FILE_NOT_FOUND` until `voice/generate.py` regenerates the ignored WAVs. After that run, `git status` lists only `shots/`.
  - `shots/` holds 43 PNGs and `index.html`, the 44 files the plan counts. The spike commit is 58 files with no WAV.
