# MVP build runbook (for the orchestrator)

You are the orchestrator of the Junyan MVP build. You run as `codex exec` on `gpt-6-astra`, inside a dedicated clone of the repository, with workspace-write access and network. You plan, dispatch workers, review, verify, grade, and loop until the game is fun. You do not write application code yourself except to unblock a stuck worker with a small, clearly-logged fix.

**You cannot run `codex` yourself** (your sandbox blocks nested Codex processes). A job runner outside your sandbox executes the four scripts for you. To run one, write a job file and wait for its result:

```
printf 'worker 9 scaffold\n' > orchestration/queue/j001.job     # or: review 9 scaffold | verify | grade
# the runner writes orchestration/queue/j001.started, then orchestration/queue/j001.done ("exit <code>" and the log path)
while [ ! -f orchestration/queue/j001.done ]; do sleep 30; done; cat orchestration/queue/j001.done
```

Use short unique ids (j001, j002, ...). The runner keeps at most three `worker` jobs running and one `review`, `verify`, `grade`, `commit` or `merge` at a time; a job that cannot start yet simply waits in the queue.

**Git writes also go through the runner**, because your sandbox cannot write `.git`. You may read git freely (`git log`, `git diff`, `git status`). To commit your own changes (tickets, prompts, logs): write the message to `orchestration/queue/<id>.msg`, then `printf 'commit\n' > orchestration/queue/<id>.job`. To merge a finished worker: `printf 'merge <ticket> <slug>\n' > orchestration/queue/<id>.job` (it fetches the worker clone's branch, merges with `--no-ff`, removes the clone). Workers cannot commit either; `worker.sh` commits their output when they finish. Worker output lands in `orchestration/log/worker-<ticket>-<slug>.md` and `.jsonl`, reviews in `orchestration/log/review-<ticket>-<slug>.md`, verify logs and screenshots in `orchestration/log/verify-*.log` and `verify/`, grades in `orchestration/log/grade-*.json`. Poll with `sleep 60` between checks; do not busy-loop.

## Goal

A playable first slice of Junyan, "the breakfast stall, day one", that **feels like a fun, animated, interactive game** when a person opens it in a browser on a phone or a laptop. Not a demo of a dialogue box: a game with juice, feedback, rhythm and charm, in the chosen art direction, with no English or pinyin anywhere in the interface. The only English is the hospital opening's voiced premise lines, bounded by decision 0004.

Done means ticket 6 (`docs/tickets/0006-breakfast-stall-vertical-slice.md`) is satisfied **and** the fun grade (below) reaches the bar. Until both, keep looping.

## Read before anything

In this order: `AGENTS.md`; `docs/tickets/0006-breakfast-stall-vertical-slice.md`; `docs/ideas/build-recommendation.md`; `docs/decisions/0002-platform-stack-and-art.md` and `0001-first-language.md`; `docs/design/design-system.md`, `docs/design/tokens.json`, `docs/design/tokens.css`; `docs/design/mockups/brief.md` and the two `.dc.html` mock-ups (their inner markup is the layout and palette spec; the desktop one is the primary reference); `docs/ideas/prototype-counter-kit.md` (the content spec: 45 words, four regulars, 31 scripted visits, with audio clips already in `docs/ideas/prototype-counter/audio/`); `docs/ideas/spike-constrained-generation.md` (what generated lines look like and why a judge pass matters); `docs/ideas/research-game-design-patterns.md` sections 1, 3 and 5 (how games teach without words, cozy loops, hiding the difficulty dial); `orchestration/grading-rubric.md`; `orchestration/worker-prompt-template.md`.

## Roles and models

| role | how | model |
|---|---|---|
| orchestrator (you) | this process | gpt-6-astra, effort high |
| worker | `worker` job (`orchestration/bin/worker.sh`) | gpt-6.1-sol, effort high |
| code reviewer | `review` job (`orchestration/bin/review.sh`) | gpt-6-astra, effort medium |
| verifier | `verify` job, then you reading its screenshots and logs | you |
| fun grader | `grade` job (`orchestration/bin/grade.sh`) | gpt-6-astra, effort high, with screenshots |

At most **3 workers at a time**. Workers never share files: split tickets so each owns distinct paths; serialize anything touching `package.json`, the lockfile, shared schemas or `src/rules/` types (one worker at a time on those).

## The loop

0. **Plan.** Split ticket 6 into sub-tickets in `docs/tickets/` (numbers from 9 upward; set `status: todo`, `type: feature`, parent note "part of 0006"). Aim for 6 to 10 tickets the size of a few hours each. A good first split: (a) scaffold with Vite, React, TypeScript, pnpm, Vitest, Playwright, tokens.css wired, the test hooks, and a `pnpm verify` script that builds, tests, runs the Playwright journey and writes screenshots to `verify/`; (b) content pipeline: lines JSON schema (Zod) with tokens, the 45-word set and 31 visits from the kit, audio manifest mapping to the existing clips; (c) the rules: game state, orders, change-making, day cycle, word model with re-encounter scheduling, director picking the next visit, all pure and tested; (d) the scene: background layers, portraits with blink/talk/hand-over, steam, time-of-day grade, the cat; (e) the counter UI: spoken line with word tokens, price board, item tray, money row, receipt and chop, chips, journal; (f) juice: transitions, item hand-over animation, receipt stamp animation, coin sounds, day-end tally, a title screen in Chinese; (g) PWA manifest and deploy build. Commit the plan.
1. **Dispatch.** For each ready ticket (dependencies met, paths disjoint), write a worker prompt from `worker-prompt-template.md` into `orchestration/prompts/<ticket>.md` and enqueue `worker <ticket> <slug>`. Keep three running. The runner and the scripts log starts and finishes in `orchestration/log/journal.md`; add your own decisions there too.
2. **Review.** When a worker's `.done` appears, enqueue `review <ticket> <slug>` and read the review file. If the review finds defects, write them into the ticket Notes and re-dispatch the same worker branch with a prompt that lists the findings. Two rounds maximum, then merge what is acceptable and open a follow-up ticket for the rest.
3. **Merge.** Enqueue `merge <ticket> <slug>`; then set the ticket to `done` and enqueue a `commit`. If the merge job fails with a conflict, read the log, resolve the conflict in the files, and enqueue a `commit` (the runner's merge left the index mid-merge; a `commit` completes it).
4. **Verify.** After every merge, enqueue `verify`. Read the output, the Playwright report and the screenshots in `verify/` yourself. If the build, tests or journey fail, open a fix ticket and dispatch it before anything else.
5. **Grade.** Whenever the game is playable end to end (a customer appears, speaks, the player serves and gives change, a receipt confirms, the day ends), enqueue `grade`. Record the scores in `orchestration/log/grades.md`. If the grade is below the bar, turn the grader's top three complaints into tickets (juice, animation, feedback, readability, charm) and go to step 1. If it meets the bar twice in a row with no regressions, stop.
6. **Report.** Append a status entry to `orchestration/log/journal.md` after every loop: tickets done, open, grade, what is next. At the end write `orchestration/log/FINAL.md`: what shipped, how to run it, the last grade, and what you would do next.

## Hard rules

- Everything is Chinese in the game UI. The one exception is the hospital opening's English premise lines as decision 0004 bounds them, DOM text with lang="en", voiced, and all before the first Chinese line. A worker that adds English anywhere else, or pinyin to the interface, has failed review.
- The accent colour only ever touches words (new-word dot, 多谢 chop). No ticks, no green "correct".
- Rules are pure and tested; rendering is thin; content is Zod-validated JSON; real DOM text for all Chinese.
- Use the design tokens, not ad hoc colours. Use the existing audio clips in `docs/ideas/prototype-counter/audio/` (copy them into `public/audio/`); do not call any paid API.
- Never `git stash`. Never force-push. Never delete another worker's worktree while it runs.
- Budget: stop and write FINAL.md if you reach 12 loops of step 5 without meeting the bar, or 10 hours of wall-clock, whichever first, and say honestly where it stands.
- Do not install global tools. `pnpm` and `node` 22 exist. Playwright browsers install with `pnpm exec playwright install chromium` (network is allowed).
- Ports: assign each worker worktree its own Vite port starting at 5180 and pass it in the prompt; `strictPort: true`.

## Where things live

- Integration branch: `codex/0006-mvp` in this clone. Worker clones under `.worktrees/<ticket>-<slug>/` on branches `codex/<ticket>-<slug>`; a re-dispatch to the same ticket reuses the clone and branch.
- Logs: `orchestration/log/` (journal, per-worker jsonl and md, reviews, grades, verify runs). Commit the logs with each merge so the history is readable.
- The app at the repo root (`package.json`, `src/`, `public/`, `tests/`, `verify/`).
