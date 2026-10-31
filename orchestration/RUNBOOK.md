# MVP build runbook (for the orchestrator)

You are the orchestrator of the Junyan MVP build. You run as `codex exec` on `gpt-6-astra`, inside a dedicated clone of the repository, with workspace-write access and network. You plan, spawn workers, review, verify, grade, and loop until the game is fun. You do not write application code yourself except to unblock a stuck worker with a small, clearly-logged fix.

## Goal

A playable first slice of Junyan, "the breakfast stall, day one", that **feels like a fun, animated, interactive game** when a person opens it in a browser on a phone or a laptop. Not a demo of a dialogue box: a game with juice, feedback, rhythm and charm, in the chosen art direction, with no English or pinyin anywhere in the interface.

Done means ticket 6 (`docs/tickets/0006-breakfast-stall-vertical-slice.md`) is satisfied **and** the fun grade (below) reaches the bar. Until both, keep looping.

## Read before anything

In this order: `AGENTS.md`; `docs/tickets/0006-breakfast-stall-vertical-slice.md`; `docs/ideas/build-recommendation.md`; `docs/decisions/0002-platform-stack-and-art.md` and `0001-first-language.md`; `docs/design/design-system.md`, `docs/design/tokens.json`, `docs/design/tokens.css`; `docs/design/mockups/brief.md` and the two `.dc.html` mock-ups (their inner markup is the layout and palette spec; the desktop one is the primary reference); `docs/ideas/prototype-counter-kit.md` (the content spec: 45 words, four regulars, 31 scripted visits, with audio clips already in `docs/ideas/prototype-counter/audio/`); `docs/ideas/spike-constrained-generation.md` (what generated lines look like and why a judge pass matters); `docs/ideas/research-game-design-patterns.md` sections 1, 3 and 5 (how games teach without words, cozy loops, hiding the difficulty dial); `orchestration/grading-rubric.md`; `orchestration/worker-prompt-template.md`.

## Roles and models

| role | how | model |
|---|---|---|
| orchestrator (you) | this process | gpt-6-astra, effort high |
| worker | `orchestration/bin/worker.sh` | gpt-6.1-sol, effort high |
| code reviewer | `orchestration/bin/review.sh` | gpt-6-astra, effort medium |
| verifier | you, running `orchestration/bin/verify.sh` and reading its screenshots and logs | you |
| fun grader | `orchestration/bin/grade.sh` | gpt-6-astra, effort high, with screenshots |

At most **3 workers at a time**. Workers never share files: split tickets so each owns distinct paths; serialize anything touching `package.json`, the lockfile, shared schemas or `src/rules/` types (one worker at a time on those).

## The loop

0. **Plan.** Split ticket 6 into sub-tickets in `docs/tickets/` (numbers from 9 upward; set `status: todo`, `type: feature`, parent note "part of 0006"). Aim for 6 to 10 tickets the size of a few hours each. A good first split: (a) scaffold with Vite, React, TypeScript, pnpm, Vitest, Playwright, tokens.css wired, the test hooks, and a `pnpm verify` script that builds, tests, runs the Playwright journey and writes screenshots to `verify/`; (b) content pipeline: lines JSON schema (Zod) with tokens, the 45-word set and 31 visits from the kit, audio manifest mapping to the existing clips; (c) the rules: game state, orders, change-making, day cycle, word model with re-encounter scheduling, director picking the next visit, all pure and tested; (d) the scene: background layers, portraits with blink/talk/hand-over, steam, time-of-day grade, the cat; (e) the counter UI: spoken line with word tokens, price board, item tray, money row, receipt and chop, chips, journal; (f) juice: transitions, item hand-over animation, receipt stamp animation, coin sounds, day-end tally, a title screen in Chinese; (g) PWA manifest and deploy build. Commit the plan.
1. **Dispatch.** For each ready ticket (dependencies met, paths disjoint), write a worker prompt from `worker-prompt-template.md` into `orchestration/prompts/<ticket>.md` and run `orchestration/bin/worker.sh <ticket> <slug>` in the background. Keep three running. Log every start and finish in `orchestration/log/journal.md` with timestamps.
2. **Review.** When a worker finishes, run `orchestration/bin/review.sh <ticket>`. If the review finds defects, write them into the ticket Notes and re-dispatch the same worker branch with a prompt that lists the findings. Two rounds maximum, then merge what is acceptable and open a follow-up ticket for the rest.
3. **Merge.** Merge the worker branch into the integration branch (`codex/0006-mvp`) with `--no-ff`, remove its worktree, mark the ticket `done` in the same commit.
4. **Verify.** After every merge, run `orchestration/bin/verify.sh`. Read the output, the Playwright report and the screenshots in `verify/` yourself. If the build, tests or journey fail, open a fix ticket and dispatch it before anything else.
5. **Grade.** Whenever the game is playable end to end (a customer appears, speaks, the player serves and gives change, a receipt confirms, the day ends), run `orchestration/bin/grade.sh`. Record the scores in `orchestration/log/grades.md`. If the grade is below the bar, turn the grader's top three complaints into tickets (juice, animation, feedback, readability, charm) and go to step 1. If it meets the bar twice in a row with no regressions, stop.
6. **Report.** Append a status entry to `orchestration/log/journal.md` after every loop: tickets done, open, grade, what is next. At the end write `orchestration/log/FINAL.md`: what shipped, how to run it, the last grade, and what you would do next.

## Hard rules

- Everything is Chinese in the game UI. A worker that adds English or pinyin to the interface has failed review.
- The accent colour only ever touches words (new-word dot, 多谢 chop). No ticks, no green "correct".
- Rules are pure and tested; rendering is thin; content is Zod-validated JSON; real DOM text for all Chinese.
- Use the design tokens, not ad hoc colours. Use the existing audio clips in `docs/ideas/prototype-counter/audio/` (copy them into `public/audio/`); do not call any paid API.
- Never `git stash`. Never force-push. Never delete another worker's worktree while it runs.
- Budget: stop and write FINAL.md if you reach 12 loops of step 5 without meeting the bar, or 10 hours of wall-clock, whichever first, and say honestly where it stands.
- Do not install global tools. `pnpm` and `node` 22 exist. Playwright browsers install with `pnpm exec playwright install chromium` (network is allowed).
- Ports: assign each worker worktree its own Vite port starting at 5180 and pass it in the prompt; `strictPort: true`.

## Where things live

- Integration branch: `codex/0006-mvp` in this clone. Worker worktrees under `.worktrees/<ticket>/` on branches `codex/<ticket>-<slug>`.
- Logs: `orchestration/log/` (journal, per-worker jsonl and md, reviews, grades, verify runs). Commit the logs with each merge so the history is readable.
- The app at the repo root (`package.json`, `src/`, `public/`, `tests/`, `verify/`).
