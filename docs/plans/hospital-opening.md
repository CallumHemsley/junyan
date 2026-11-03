# Hospital opening plan

New players of Junyan wake on a hospital ward before day 1. The doctor explains the premise in four voiced English lines, then speaks only Chinese. The old man in the next bed asks for 豆浆 and 鸡蛋, the aunt offers work at her shop, and an end card hands over to day 1 at 早安小馆. Returning players never see the opening.

The program enforces one rule from decision 0004. English appears only in the opening's `say-en` steps, before the first Chinese line, and never returns. Content validation, a content test, and the Playwright journey each check it.

The PRs stack in dependency order, 0047, 0048, 0049, 0052, 0054, 0050, 0053, 0051, 0055, 0056.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/autopilot-stack.md`. The root builds one linear stack of ten PRs, and Callum reviews and lands it. Nobody else merges. PRs 0053, 0055, and 0056 change an interaction, so each stops at merge-ready until Callum reviews its screenshots and video in chat. The same tickets can instead be drained by the Codex runner in `orchestration/RUNBOOK.md`, one ticket per worker, after 0047 lands.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to Callum, then stop. Start execution only on Callum's explicit go.
- [ ] Read these from trunk at program start. Re-read them at every tick. Today `origin/main` holds only docs, and the shipped game lives on `codex/0030-overnight-pstack`. Until Callum merges that branch into `main`, replace `origin/main` with `origin/codex/0030-overnight-pstack` in every read below and base the stack on that branch.
  - [ ] `git show origin/main:AGENTS.md`
  - [ ] `git show origin/main:docs/plans/hospital-opening.md`
  - [ ] `git show origin/main:docs/decisions/0004-hospital-opening.md`, present once 0047 lands. Before that, read the untracked copy in the main checkout.
  - [ ] `git show origin/main:docs/tickets/README.md` and the ticket for each active PR.
  - [ ] `git show origin/main:orchestration/RUNBOOK.md`
- [ ] Read the pstack skills from the installed plugin, because pstack is not part of this repo. Set `PSTACK=~/.claude/plugins/cache/cursor-plugins/pstack/<version>` to the highest installed version. Re-read them at every tick.
  - [ ] `$PSTACK/skills/poteto-mode/playbooks/autopilot-stack.md` and `$PSTACK/skills/poteto-mode/playbooks/autopilot-full.md`, which it builds on.
  - [ ] `$PSTACK/skills/swarm/SKILL.md`
  - [ ] `$PSTACK/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `$PSTACK/skills/poteto-mode/playbooks/shipping.md`, for the patch-id rule.
  - [ ] `$PSTACK/skills/show-me-your-work/SKILL.md`, `$PSTACK/skills/how/SKILL.md`, `$PSTACK/skills/interrogate/SKILL.md`, `$PSTACK/skills/no-comments/SKILL.md`, and `$PSTACK/skills/ketchup/SKILL.md`.
  - [ ] No control skill exists for this repo. Lanes drive the app with Playwright from `playwright.config.ts`, per the boot recipe below. Appendix C records the gap.
- [ ] On Callum's go, arm the audit tick as `/loop 1h` with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On Callum's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle that `autopilot-stack.md` names. Each owner works in its own worktree on the branch `claude/<id>-<slug>`, with the slug from the ticket. Owners report STACK-READY, never merge-ready, and never rebase, retarget, or merge.
- [ ] Run at most three owners at once, in these waves. Start a wave only when every dependency of its PRs has a clean verdict.
  - [ ] Wave 1 is 0047.
  - [ ] Wave 2 is 0048, 0049, and 0052. Start 0054 when the first of them reaches a clean verdict.
  - [ ] Wave 3 is 0050 and 0053.
  - [ ] Wave 4 is 0051.
  - [ ] Wave 5 is 0055.
  - [ ] Wave 6 is 0056.
- [ ] Follow this dependency graph. An owner branches from the stack link that already holds all of its dependencies.
  - [ ] 0047 is first. It branches from `codex/0030-overnight-pstack`, or from `main` once Callum has merged that branch.
  - [ ] 0048, 0049, 0052, and 0054 each depend only on 0047.
  - [ ] 0050 after 0049.
  - [ ] 0051 after 0048 and 0050.
  - [ ] 0053 after 0052.
  - [ ] 0055 after 0051, 0053, and 0054.
  - [ ] 0056 after 0055.
  - [ ] The stack order is 0047, 0048, 0049, 0052, 0054, 0050, 0053, 0051, 0055, 0056. It is not the id order, because 0050 adds WAVs that break the hard-coded counts until 0054 replaces them. That order satisfies every edge above.
- [ ] Hold the file boundaries. Every PR also edits its own ticket file under `docs/tickets/`.
  - [ ] 0047 touches only `docs/**`, `AGENTS.md`, `README.md`, `orchestration/RUNBOOK.md`, `orchestration/worker-prompt-template.md`, `orchestration/bin/verify.sh`, and `spikes/hospital-opening/**`.
  - [ ] 0048 touches only `src/contracts.ts`, `src/game.ts`, `src/save.ts`, and their Vitest files.
  - [ ] 0049 touches only `scripts/content-audio.py`, `src/content/voices.json`, and a test fixture beside the script.
  - [ ] 0050 touches only `src/content/**` and `public/audio/**`.
  - [ ] 0051 touches only new pure rule modules under `src/` and their Vitest files. It touches nothing under `src/App.tsx`, `src/scene/`, or `e2e/`.
  - [ ] 0052 touches only `src/scene/**`.
  - [ ] 0053 touches only `src/scene/**` and the accessory enum in `src/content/index.ts`.
  - [ ] 0054 touches only `e2e/**`, `playwright*.config.ts`, the skip parameter in `src/App.tsx`, `src/scene/record-demo.mjs`, and `src/scene/renderer.visual.pw.ts`.
  - [ ] 0055 touches only `src/App.tsx`, a new opening component under `src/`, its styles, and `e2e/**`.
  - [ ] 0056 touches only `src/App.tsx`, `src/game.ts`, the app styles, `docs/design/tokens.json`, `docs/design/tokens.css`, and `docs/design/design-system.md`.
  - [ ] Serialize the shared files. `src/content/index.ts` changes in 0050 and then 0053. `src/App.tsx` changes in 0054, then 0055, then 0056. `src/game.ts` changes in 0048 and then 0056.
- [ ] Hold the review gate. 0053, 0055, and 0056 change an interaction. They wait for Callum's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Resolve the forge once. The forge is `gh` against `github.com/CallumHemsley/junyan`. Record that `command -v origin` finds no Origin CLI. Never require `gt`.
- [ ] Open the PR ready, never draft, per **Opening a PR**. Run `gh pr create --base <parent-branch>`. 0047 targets `codex/0030-overnight-pstack`, or `main` once Callum has merged that branch. Every other PR targets the branch of the link below it.
- [ ] Run `pnpm test && pnpm build` once before the PR-facing push. The repo has no separate lint script, and `pnpm build` runs `tsc -b`. Push with hooks on.
- [ ] Skip `/deslop`. The `cursor-team-kit` plugin is not installed. Record the skip in the decision trail.
- [ ] Run `/no-comments` before review.
- [ ] Bugbot triage is skipped in Claude Code. The repo has no Bugbot, no security reviewer, and no CI workflow, so no bot comments arrive. Record the skip in each PR body.
- [ ] Owners never rebase. The root rebases the chain bottom-up before each code-ready report, keeps that base through fix rounds, and rebases again only at merge prep or on a `git merge-tree` conflict with the parent link.

### Verdict and merge, for every PR

- [ ] A full swarm runs once, at the code-ready head. Another full swarm runs only for new behavior, a redesign, or a large new diff. A rebase, a merge-conflict resolution, or a minor fix gets a single verifier at the new head. Run each full swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the STACK-READY report before the verdict.
- [ ] The gates lane runs `pnpm test`, `pnpm build`, and `pnpm test:e2e` at the head on its own port pair.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh verdict, except for results that stay valid under the patch-id rule in `playbooks/shipping.md`.
- [ ] Append each clean PR to the stack in the stack order above. Set its base to the link below it with `gh pr edit <pr> --base <parent-branch>`. Only the root rebases or retargets a link.
- [ ] Before Callum lands, compare `git patch-id` at each verdict SHA with the current head. Keep a lane's result only when the patches match or differ only in tests, docs, or lint config, per `playbooks/shipping.md`. Rerun the rest.
- [ ] Callum lands the stack bottom-up with `gh pr merge <pr> --squash`. After each merge, the root retargets the next link to trunk with `gh pr edit <pr> --base <trunk>`, moves its patch onto the merge result, and pushes with `--force-with-lease`. Nobody else writes to the chain once landing starts.

### Boot recipe, for every live lane

Port numbers written inside a PR section are examples. The port rule in this recipe governs every lane, so two lanes never share a port.

Each live lane runs in its own git worktree at the PR head. Claude Code has no cloud VMs. Drive the app with Playwright only.

- [ ] Create the lane worktree with `git worktree add --detach /tmp/swarm-<pr-id>/worker-<n>/tree`.
- [ ] In that worktree, run `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] Run `pnpm install --frozen-lockfile`.
- [ ] Pick a unique port pair from 5300 up. Lane n of the swarm in slot k takes `JUNYAN_DEV_PORT=5300+20k+2(n-1)` and `JUNYAN_PREVIEW_PORT` one above it. Never use 5173 or 5177, which `playwright.config.ts` refuses.
- [ ] Start the dev server with `pnpm dev --host 127.0.0.1 --port $JUNYAN_DEV_PORT --strictPort`.
- [ ] Start the production preview with `pnpm build && pnpm exec vite preview --base /junyan/ --host 127.0.0.1 --port $JUNYAN_PREVIEW_PORT --strictPort`.
- [ ] Wait for ready. `curl -sf http://127.0.0.1:$JUNYAN_DEV_PORT/` and `curl -sf http://127.0.0.1:$JUNYAN_PREVIEW_PORT/junyan/` both return 200.
- [ ] Deliver input only through Playwright, at phone 390x844 and at desktop 1280x900 or 1440x1000. For a recording, use a scratch config with `use.video` set to `on`, after the pattern in `src/scene/playwright.visual.config.ts`.
- [ ] Read diagnostics without writing state. In the DEV build, call `window.__TEST__.getState()` only. Capture every console message and page error with `page.on('console')` and `page.on('pageerror')`. Never call a `__TEST__` action that changes state unless the lane's scenario names it.
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.
- [ ] Stop both servers and remove the worktree with `git worktree remove /tmp/swarm-<pr-id>/worker-<n>/tree`, without force.
## Amend the rules and commit the decision (0047)

**Depends on.** None.

**Files.**

- [ ] Add `docs/decisions/0004-hospital-opening.md`, untracked at program start.
- [ ] Add `spikes/hospital-opening/` with `CONTRACT.md`, `index.html`, `app.js`, `art.js`, `content.js`, `verify.mjs`, `audio/manifest.js`, the 44 files in `shots/`, and `voice/generate.py`, `voice/analyze.py`, `voice/lines.mjs`, `voice/probe-playback.mjs` and `voice/provenance.json`.
- [ ] Create `spikes/hospital-opening/.gitignore`.
- [ ] Edit `AGENTS.md`.
- [ ] Edit `docs/design/design-system.md`.
- [ ] Edit `docs/decisions/0001-first-language.md`.
- [ ] Edit `docs/tickets/0004-pin-down-the-hook.md`.
- [ ] Edit `README.md`.
- [ ] Edit `docs/ideas/vision.md`.
- [ ] Edit `orchestration/RUNBOOK.md`.
- [ ] Edit `orchestration/worker-prompt-template.md`.
- [ ] Edit `orchestration/bin/verify.sh`.
- [ ] Commit `docs/tickets/0047-opening-rules-docs.md` through `docs/tickets/0056-fog-everywhere.md`. They were written with the plan and already sit untracked in the working tree.

**Build.**

- [ ] Write `spikes/hospital-opening/.gitignore` with two lines, `audio/*.wav` and `voice/auditions/`. The WAV files (5.5 MB) and the auditions (5.0 MB) stay local. `voice/generate.py` regenerates both, and `audio/manifest.js` stays tracked so the page still maps every line to its clip name.
- [ ] Commit the spike and decision 0004 in one commit. `orchestration/bin/worker.sh` clones the repo with `git clone -q "$root" "$dir"`, so a Codex worker sees neither file until it is committed.
- [ ] In `AGENTS.md` "What the game is", replace `The player runs a breakfast stall (早餐店)` with `The player wakes on a hospital ward for a one-minute opening (decision 0004), then runs a breakfast stall (早餐店)`.
- [ ] In the same section, replace `No English, no pinyin on screen (pinyin only on tap)` with `No English after the opening's premise lines, which decision 0004 bounds, and no pinyin on screen (pinyin only on tap)`.
- [ ] In `AGENTS.md` "Verification", replace `(open, serve three customers, give change, journal a word)` with `(open, play the opening, serve three customers, give change, journal a word)`.
- [ ] In `docs/design/design-system.md` line 15 ("Content fundamentals"), replace `**Chinese only.** No English, no pinyin. Every string is simplified Chinese and every spoken line is voiced.` with `**Chinese only.** No English, no pinyin. Every string is simplified Chinese and every spoken line is voiced. The one exception is the hospital opening's voiced English premise lines ([[decisions/0004-hospital-opening]]).`
- [ ] In `docs/design/design-system.md` line 115, rule 6, replace `**No English, pinyin or emoji in the game UI.**` with `**No English, pinyin or emoji in the game UI.** The opening's English premise lines are story text, not UI, and decision 0004 bounds them.`
- [ ] In `docs/design/design-system.md` line 86 ("Usage rules"), replace ``A new word adds the `word-marker` dot and nothing else: no colour, no bold, no gloss.`` with ``A newly recovered word adds the `word-marker` dot and nothing else (no colour, no bold, no gloss). An unrecovered word wears the fog style, which ticket 0056 adds to the tokens.``
- [ ] In `docs/decisions/0001-first-language.md`, add one line under point 2 that reads `Amended for the hospital opening only by [[decisions/0004-hospital-opening]].`
- [ ] In `docs/tickets/0004-pin-down-the-hook.md` line 19, replace `no English)` with `no English after the opening)`.
- [ ] In `README.md` line 14, replace `All game text is simplified Chinese;` with `All game text is simplified Chinese, apart from the opening's four voiced English premise lines (decision 0004);`.
- [ ] In `docs/ideas/vision.md` line 20, replace `The game is in the target language from the first second.` with `The game is in the target language from the first second, apart from the opening's English premise lines (decision 0004).`
- [ ] In `orchestration/RUNBOOK.md` line 19, replace `with no English or pinyin anywhere in the interface.` with `with no English or pinyin anywhere in the interface. The only English is the hospital opening's voiced premise lines, bounded by decision 0004.`
- [ ] In `orchestration/RUNBOOK.md` line 51, replace `Everything is Chinese in the game UI. A worker that adds English or pinyin to the interface has failed review.` with `Everything is Chinese in the game UI. The one exception is the hospital opening's English premise lines as decision 0004 bounds them, DOM text with lang="en", voiced, and all before the first Chinese line. A worker that adds English anywhere else, or pinyin to the interface, has failed review.`
- [ ] In `orchestration/worker-prompt-template.md` line 16, replace `Chinese only in the UI, no pinyin on screen, no English;` with `Chinese only in the UI, no pinyin on screen, no English except the hospital opening's premise lines that decision 0004 bounds;`.
- [ ] In `orchestration/bin/verify.sh` line 19, replace `grep -q '"e2e"' package.json && { pnpm e2e 2>&1 || code=1; }` with `grep -q '"test:e2e"' package.json && { pnpm test:e2e 2>&1 || code=1; }`. `package.json` names the script `test:e2e`, so today the line never runs Playwright.
- [ ] In `docs/decisions/0004-hospital-opening.md` "Consequences", replace `This draft does not edit these files.` with `Ticket 0047 applied these amendments.`
- [ ] Keep the ten ticket files at `status: todo`, except `docs/tickets/0047-opening-rules-docs.md`, which this change sets to `done` with what was learned.

**You see.**

- [ ] `git ls-files docs/decisions/0004-hospital-opening.md spikes/hospital-opening | wc -l` prints the decision plus every spike file named under Files, and `git ls-files spikes/hospital-opening | grep -c '\.wav$'` prints `0`.
- [ ] `git status --short` in a fresh checkout of the head, after `node spikes/hospital-opening/verify.mjs` writes its screenshots, lists only changed `shots/` files and no `audio/` or `voice/auditions/` path.
- [ ] `JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405 sh orchestration/bin/verify.sh` writes `orchestration/log/verify-<stamp>.log` that contains Playwright's `123 passed` line and ends with `verify exit 0`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] No test file gains a case. Run `pnpm test`. Pass when Vitest reports 110 passed, the trunk count.
- [ ] Run `pnpm build`. Pass when `tsc -b` and `vite build` both exit 0.
- [ ] Run `sh -n orchestration/bin/verify.sh`. Pass when it exits 0.
- [ ] Run `git check-ignore -v spikes/hospital-opening/audio/00-doctor-en.wav spikes/hospital-opening/voice/auditions/x.wav`. Pass when both paths match a line of `spikes/hospital-opening/.gitignore`.
- [ ] Run `grep -l "0004" AGENTS.md README.md docs/design/design-system.md docs/decisions/0001-first-language.md docs/ideas/vision.md orchestration/RUNBOOK.md orchestration/worker-prompt-template.md`. Pass when it prints all seven paths.
- [ ] Run `JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405 pnpm test:e2e`. Pass when Playwright reports 123 passed, the trunk count.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe. Lane n serves the head on `JUNYAN_DEV_PORT=$((5400 + 2 * n))` and `JUNYAN_PREVIEW_PORT=$((5401 + 2 * n))`. Lane 1 serves trunk on 5450 and 5451.

- [ ] Lane 1. Regression lane against trunk. At trunk and at the head, open `/?seed=42` on the dev server at desktop 1440x1000, click `开门迎客`, serve table 1 with the right food and change, then tap one word token in its line. Save `0047-regression-trunk.png` and `0047-regression-head.png`. Pass when both sides reach the same table 1 receipt, the tapped word appears in `本子` at both, and neither side logs a console error.
- [ ] Lane 2. Open the production preview at `/junyan/` on phone 390x844, dismiss the `怎么玩` help with `开门迎客`, and read `document.body.innerText`. Save `0047-phone-first-screen.png`. Pass when the canvas shows, the text matches no `/[A-Za-z]/`, and the console is clean.
- [ ] Lane 3. Clone the head into `/tmp/swarm-0047/worker-3/clone` with `git clone -q` and `git checkout <head SHA>`, as `orchestration/bin/worker.sh` does. Open `spikes/hospital-opening/index.html` from that clone over `file://` at phone 390x844 and play variant A to the end card. Save `0047-spike-clean-clone-end.png`. Pass when the end card reads `第一天 · 早安小馆` and no `pageerror` fires.
- [ ] Lane 4. In the clean clone from Lane 3, run `node spikes/hospital-opening/verify.mjs`. Save `0047-spike-verify-sheet.png` from `shots/index.html`. Pass when all seven runs print `done` and every console error, if any, names a missing `audio/*.wav` file.
- [ ] Lane 5. Open the committed `spikes/hospital-opening/shots/index.html` from the head checkout at desktop 1280x900 and scroll to the A rows. Save `0047-contact-sheet.png`. Pass when every `img` element has `naturalWidth > 0`.
- [ ] Lane 6. In the clean clone, list `docs/decisions/0004-hospital-opening.md`, `spikes/hospital-opening/content.js` and the ten files `docs/tickets/0047-*.md` to `docs/tickets/0056-*.md`, then open the spike at desktop 1280x900 with the fog toggle on. Save `0047-worker-clone-fog.png`. Pass when every listed file exists and unrecovered tokens render with the spike's fog style.
- [ ] Lane 7. Run `JUNYAN_DEV_PORT=5414 JUNYAN_PREVIEW_PORT=5415 sh orchestration/bin/verify.sh` at the head. Copy `output/playwright/desktop-journal.png` from that run. Save `0047-verify-journey-journal.png`. Pass when the log has Playwright's `123 passed` line and `verify exit 0`.
- [ ] Lane 8. Run `JUNYAN_DEV_PORT=5173 sh orchestration/bin/verify.sh` at the head, a port `playwright.config.ts` refuses. Open the log over `file://` in the browser. Save `0047-verify-fails-loud.png`. Pass when the log shows `Unsafe verification port` and `verify exit 1`, which proves the Playwright step now runs and its failure reaches the exit code.
- [ ] Lane 9. Open the production preview at desktop 1440x1000, wait for the service worker, list every URL in every `caches` entry, then go offline and reload. Save `0047-offline-reload.png`. Pass when no cached URL contains `spikes/`, the offline reload shows `开门迎客`, and the console is clean.
- [ ] Lane 10. Open `/?seed=42` on the dev server at phone 390x844 and serve all four tables to the day summary. Save `0047-phone-day-end.png`. Pass when the `今日小结` dialog shows with `明天见` focused and the console is clean.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Wall time of `pnpm build` and the bytes and SHA-256 of every file under `dist/`, at trunk and at the head.
- [ ] Probe. In a trunk worktree and a head worktree, alternate five runs each of `/usr/bin/time -p pnpm build`, trunk first. After each run, record `cat dist/assets/*.js | wc -c` and `find dist -type f -exec shasum -a 256 {} + | sort -k2`.
- [ ] Baseline. Record the trunk build time median and the trunk JS bytes first. The brief measured 2.4s and 401 kB.
- [ ] Rule. 0047 changes no file under `src/`, so any `dist/` hash that differs from trunk fails. A head build median more than 20% above the trunk median fails.

**Review gate.** None. 0047 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because this repo has no Bugbot. Record that line in the merge-ready report.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged. Compare `git diff <base>..<head> | git patch-id --stable` before and after.
- [ ] The root appends 0047 as the stack root, with its base set to `codex/0030-overnight-pstack` until Callum merges that branch, then `main`, by `gh pr edit <pr> --base <base-branch>`. Callum lands the stack bottom-up.

## Record word recovery in the journal (0048)

**Depends on.** 0047.

**Files.**

- [ ] Edit `src/contracts.ts`.
- [ ] Edit `src/game.ts`.
- [ ] Edit `src/save.ts`.
- [ ] Edit `src/App.tsx`.
- [ ] Edit `src/game.test.ts`.
- [ ] Edit `src/save.test.ts`.
- [ ] Edit `src/content/content.test.ts`.
- [ ] Edit `e2e/save.spec.ts`.
- [ ] Edit `docs/tickets/0048-journal-recovery.md`.

**Build.**

- [ ] In `src/contracts.ts`, export `type JournalEntry = { lookups: number; lastSeen: number; recovered: boolean }` and change `GameState.journal` (line 63) to `Record<string, JournalEntry>`. In memory, `recovered` is always present.
- [ ] In `src/game.ts`, change the `lookup` branch of `reduceGame` (lines 149 to 157) to write `{ ...previous, lookups: (previous?.lookups ?? 0) + 1, lastSeen: action.now, recovered: previous?.recovered ?? false }`. The spread keeps `recovered` and any later field, and a lookup alone never recovers a word (D4).
- [ ] In `src/game.ts`, export the pure function `recoverWords(journal, wordIds, now)`. It returns a journal where each listed id has `recovered: true`. A new entry gets `lookups: 0` and `lastSeen: now`, and an existing entry keeps its `lookups` and `lastSeen`. It returns the same journal object when every id is already recovered. 0051 and 0056 call it, so `src/game.ts` stays the only journal writer.
- [ ] In `src/save.ts`, change the journal entry in `stateSchema` (lines 35 to 38) to `z.object({ lookups: ..., lastSeen: boundedNumber, recovered: z.boolean().optional() })`. `stateSchema` is a non-strict `z.object`, so trunk strips an unknown `recovered` key and a head save still loads on trunk.
- [ ] In `validateSavedGame` in `src/save.ts`, replace the final `return state` (line 100) with a return that maps every journal entry to `{ ...entry, recovered: entry.recovered ?? true }`. That is the D4 legacy rule. A saved entry with no flag predates recovery, and a word already in the journal counts as recovered. Entries the head writes always carry the flag, so a looked-up word saved by the head stays `recovered: false` across reloads.
- [ ] In the startup effect in `src/App.tsx` (lines 115 to 120), after `validateSavedGame` accepts the checkpoint, write `JSON.stringify(checkpoint)` back to `checkpointKey` inside the same `try`. The autosave at lines 145 to 157 clears the checkpoint only when the stored string equals `JSON.stringify(state)`. Without the write-back, a legacy checkpoint gains `recovered: true` on load and is never cleared, and a later move-only session loses its position to the stale checkpoint on reload.
- [ ] Change no rendering. `tokens()` keeps its dot rule `!state.journal[w.id]` (line 375), and the journal panel keeps `听过 {lookups} 次` (line 780). 0056 changes both.
- [ ] Set `docs/tickets/0048-journal-recovery.md` to `done` with what was learned.

**You see.**

- [ ] A trunk save `{ bun: { lookups: 2, lastSeen: 1.5 } }` in IndexedDB `junyan-waiter`, store `saves`, key `v1`, reads back after the 350ms autosave as `{ bun: { lookups: 2, lastSeen: 1.5, recovered: true } }`, and `本子` still lists `包子` with `听过 2 次`.
- [ ] A word first tapped on the head saves as `recovered: false` and still reads `recovered: false` after a reload.
- [ ] The screen is unchanged. The same tokens carry the `new-word` dot as on trunk.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/game.test.ts` lines 351, 353 and 371 expect `recovered: false` in each `toEqual`. Run `pnpm test`.
- [ ] `src/content/content.test.ts` line 47 expects `{lookups: 1, lastSeen: 123, recovered: false}`. Run `pnpm test`.
- [ ] `src/game.test.ts` gains "lookup keeps a recovered word recovered and counts the lookup". It seeds `bun` as `{ lookups: 0, lastSeen: 5, recovered: true }`, dispatches `lookup` with `now: 9`, and expects `{ lookups: 1, lastSeen: 9, recovered: true }`. Run `pnpm test`.
- [ ] `src/game.test.ts` gains "a lookup alone never recovers a word". Ten lookups of `bun` leave `recovered: false`. Run `pnpm test`.
- [ ] `src/game.test.ts` gains "recoverWords marks words recovered without touching lookups". It covers a new id, an id with lookups, an id already recovered with an identical result object, and a frozen input that stays unmutated. Run `pnpm test`.
- [ ] `src/save.test.ts` line 134 ("returns the committed read with its journal and stale receipt intact") expects the legacy `retired-word` entry back with `recovered: true`. Type its legacy fixture with a local `LegacyJournal` type, so `tsc -b` accepts the missing flag. Run `pnpm test`.
- [ ] `src/save.test.ts` line 149 ("restores the v1 progress format from product baseline 5dfad15") expects `historical` with `bun` at `{ lookups: 2, lastSeen: 1.5, recovered: true }`. Drop the `GameState` annotation on `historical` at line 150 for the legacy type. Run `pnpm test`.
- [ ] `src/save.test.ts` line 234 ("retains old journal word IDs and non-integer finite timestamps") expects the legacy `retired-word` entry with `recovered: true`. It also gains an entry `{ lookups: 0, lastSeen: 0, recovered: false }` that stays `false`. Run `pnpm test`.
- [ ] `src/save.test.ts` corruptions list, next to `negative timestamp` at line 272, gains `["non-boolean recovered flag", (state) => { state.journal.word = { lookups: 1, lastSeen: 0, recovered: "yes" } }]` through the legacy type, rejected by `it.each(corruptions)`. Run `pnpm test`.
- [ ] `src/save.test.ts` non-finite case at line 300 gains the same two journal checks with `recovered: true` present, still `toBeNull()`. Run `pnpm test`.
- [ ] `src/save.test.ts` line 189 ("accepts every reducer state across five days") passes unchanged, which proves a head save round-trips with `recovered: false` intact through `validateSavedGame`. Run `pnpm test`.
- [ ] Run `pnpm build`. Pass when `tsc -b` accepts the test fixtures and the build exits 0.
- [ ] `e2e/save.spec.ts` gains "legacy IndexedDB journal loads as recovered and keeps counting lookups". It installs a trunk-shape save through `installSave`, waits for the autosave, reads `stored(page)`, and expects `bun.recovered === true` with `lookups` unchanged. Run `JUNYAN_DEV_PORT=5442 JUNYAN_PREVIEW_PORT=5443 pnpm test:e2e e2e/save.spec.ts`.
- [ ] `e2e/save.spec.ts` gains "legacy checkpoint is rewritten and cleared after autosave". It sets `junyan-waiter-pending-v1` to a trunk-shape state, loads `/?seed=42`, and polls until the key is `null` and IndexedDB holds `recovered: true`. Run `JUNYAN_DEV_PORT=5442 JUNYAN_PREVIEW_PORT=5443 pnpm test:e2e e2e/save.spec.ts`.
- [ ] Run `JUNYAN_DEV_PORT=5442 JUNYAN_PREVIEW_PORT=5443 pnpm test:e2e`. Pass when every spec passes, the trunk count of 123 plus four for the two new cases on both projects.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe. Lane n serves the head on `JUNYAN_DEV_PORT=$((5460 + 2 * n))` and `JUNYAN_PREVIEW_PORT=$((5461 + 2 * n))`. Lane 1 serves trunk on 5490 and 5491. Each lane installs saves the way `installSave` in `e2e/save.spec.ts` does, and reads them the way `stored` does.

- [ ] Lane 1. Regression lane against trunk. At trunk and at the head, install the day-1 save from the `restores the v1 progress format` test with journal `{ bun: { lookups: 2, lastSeen: 1.5 } }`, open `/?seed=42` at desktop 1440x1000, click `开门迎客`, open `本子`, and read IndexedDB after one second. Trunk has no recovery, so the lane gates what the diff adds and the end state the player sees. Save `0048-regression-trunk.png` and `0048-regression-head.png`. Pass when both sides list `包子` with `听过 2 次`, trunk stores no `recovered` key, and the head stores `recovered: true`.
- [ ] Lane 2. Start with empty storage at `/?seed=42` on desktop 1440x1000, click `开门迎客`, open `怎么玩`, tap the `厨房` token, close the word card, wait one second, and reload. Save `0048-lookup-unrecovered-reload.png`. Pass when IndexedDB `journal.kitchen` is `{ lookups: 1, recovered: false }` with its `lastSeen`, before and after the reload.
- [ ] Lane 3. Clear IndexedDB, set `localStorage["junyan-waiter-pending-v1"]` to a trunk-shape day-1 state whose journal holds `bun`, and open `/?seed=42` at desktop 1440x1000. Save `0048-legacy-checkpoint.png`. Pass when `本子` lists `包子`, the checkpoint key reads `null` within two seconds, and IndexedDB holds `bun.recovered === true`.
- [ ] Lane 4. Install a save whose journal mixes `bun` without a flag and `egg` with `recovered: false`. Open `/?seed=42` on phone 390x844 and open `本子`. Save `0048-mixed-journal.png`. Pass when IndexedDB holds `bun.recovered === true` and `egg.recovered === false`, and both words show in `本子`.
- [ ] Lane 5. Install a save whose `bun` entry carries `recovered: "yes"`, and open `/?seed=42` at desktop 1440x1000. Save `0048-bad-flag-fresh-day.png`. Pass when the game opens a fresh day 1 on `怎么玩` and `开门迎客`, `本子` shows its empty text, and IndexedDB holds a fresh state with an empty journal.
- [ ] Lane 6. Install the completed day from `completedDay()` in `e2e/save.spec.ts` after adding `egg` as `recovered: true` to its journal, open `/?seed=42`, click `明天见`, and reload. Save `0048-next-day-keeps-flags.png`. Pass when IndexedDB holds `day: 2` and its journal equals the installed journal, flags included.
- [ ] Lane 7. Open the production preview at `/junyan/?seed=42` on phone 390x844 with the trunk-shape save installed on that origin, click `开门迎客`, and open `本子`. Save `0048-preview-legacy-phone.png`. Pass when `window.__TEST__` is `undefined`, `包子` shows `听过 2 次`, IndexedDB holds `bun.recovered === true`, and the console is clean.
- [ ] Lane 8. Open `/?test=1&seed=42` at desktop 1440x1000, call `window.__TEST__.dispatch({ type: "lookup", wordId: "bun", now: 1 })`, read `window.__TEST__.getState().journal.bun`, then call `window.__TEST__.reset()`. Save `0048-test-hook-lookup.png`. Pass when the entry equals `{ lookups: 1, lastSeen: 1, recovered: false }` and the journal is empty after `reset()`.
- [ ] Lane 9. At trunk and at the head, open `/?test=1&seed=42` at desktop 1440x1000 with `reducedMotion: "reduce"`, open table 1, and screenshot the `.spoken` line. Then tap its first token and screenshot it again. Save `0048-dot-trunk-head.png` side by side. Pass when the `.spoken` screenshots are byte-identical between trunk and head at both moments, and the `.new-word` count matches.
- [ ] Lane 10. Install the trunk-shape save, open `/?seed=42`, open `本子`, and tap `包子` once. Wait one second and read IndexedDB. Save `0048-legacy-lookup-spreads.png`. Pass when `bun` reads `{ lookups: 3, recovered: true }` with a new `lastSeen`, which proves the `lookup` branch spreads the previous entry.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Two numbers at trunk and at the head. First, the mean time per `validateSavedGame` call on a day-5 state with a 200-entry journal. Second, the time from navigation start to the first `IDBObjectStore.put` of key `v1`, which is the first autosave, on the production preview with a legacy save installed.
- [ ] Probe. Copy a scratch `save.bench.ts` into `src/` of the trunk and head worktrees and run `pnpm exec vitest bench --run src/save.bench.ts` in each, trunk first, three times each, interleaved. Delete the file afterwards. Then run a scratch Playwright script at `/tmp/swarm-0048/perf/autosave.mjs` that wraps `IDBObjectStore.prototype.put` with `page.addInitScript` to record `performance.now()` and the time `开门迎客` becomes visible. Run it ten times per side against the two previews, alternating trunk and head.
- [ ] Baseline. Record the trunk bench mean and the trunk median time to first `put` first.
- [ ] Rule. A head bench mean above 1.5 times the trunk mean, or above 0.5ms, fails. A head median time to first `put` more than 50ms above the trunk median fails. A first `put` less than 350ms after `开门迎客` becomes visible fails on either side.

**Review gate.** None. 0048 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because this repo has no Bugbot. Record that line in the merge-ready report.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged. Compare `git diff <base>..<head> | git patch-id --stable` before and after.
- [ ] The root appends 0048 to the base-branch stack with its base set to the 0047 branch, `claude/0047-opening-rules-docs`, by `gh pr edit <pr> --base claude/0047-opening-rules-docs`. Callum lands the stack bottom-up.
## Teach the voice pipeline English and per-cast voices (0049)

**Depends on.** 0047. The PR changes no game content and no app behaviour. It changes `scripts/content-audio.py`, adds voice presets, and proves both on a committed fixture.

**Files.**

- [ ] Edit `scripts/content-audio.py`.
- [ ] Edit `src/content/voices.json`.
- [ ] Edit `src/content/index.ts`. Only `voicePreset` changes.
- [ ] Edit `src/content/content.test.ts`. Only the voices case changes.
- [ ] Create `scripts/fixtures/opening-audio.json`.
- [ ] Edit `docs/content-audio.md`.
- [ ] Edit `docs/tickets/0049-voice-pipeline-english.md`.

**Build.**

- [ ] In `scripts/content-audio.py`, add `MAX_ATTEMPTS = 8` and loop `generate_clip` over `range(MAX_ATTEMPTS)`. Keep the seed formula `(int(content_digest[:8], 16) + attempt * 1000) % 2**32`, so attempts one to three use today's seeds. The final error reads `f"{MAX_ATTEMPTS} rejected takes: {attempts}"`.
- [ ] Give a voice preset an optional `loudness` object `{"targetActiveRmsDbfs": -20, "peakCeilingDbfs": -1}`. `validate_presets` accepts a target from -40 to -6 and a ceiling from -12 up to, but not including, 0. Mirror the same bounds in the `voicePreset` Zod schema in `src/content/index.ts` as `loudness: z.strictObject({...}).optional()`. The preset dict is part of the job identity, so the four existing presets keep their filenames and the 85 committed clips stay cached.
- [ ] Add five Qwen presets to `src/content/voices.json`, each pinned to `mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit` at revision `08c72cad5e2fd0f41730c8bd1f28149585e46361`, speed 1, instructions null, and loudness -20 and -1. They are `ryan-en` (speaker `Ryan`, language `English`), `ryan-zh` (`Ryan`, `Chinese`), `vivian` (`Vivian`, `Chinese`), `uncle-fu-levelled` (`Uncle_Fu`, `Chinese`), and `serena-levelled` (`Serena`, `Chinese`). Leave `serena`, `uncle-fu`, `yunxi`, `xiaobei`, and `wordVoice` byte-identical. The casting is the spike's, recorded in `spikes/hospital-opening/voice/provenance.json` under `cast`.
- [ ] Route `content["opening"]` in `collect_jobs`. Exclude the `opening` key from the generic walk. Build a cast map from `opening.cast` by `id`. A `say-en` step becomes one job of kind `english` with text `step["en"]` and the preset `cast[who].voices.en`. An `end` step walks with `wordVoice`. Every other step walks with `cast[who].voices.zh`, so its lines take the speaker's preset and its tokens and option words take `wordVoice`. Raise `ValueError` for an unknown `who`, a `say-en` speaker with no `voices.en`, or a preset id missing from `voices`.
- [ ] In `add`, take the spoken text from `target["text"]` when the target has one. That is the opening's phrase shape, with punctuation folded into the text. Otherwise join the token hanzi as today. An `english` job has pronunciation `{"normalization": PRONUNCIATION, "authored_pinyin": None}` and the filename `english-<digest>.wav`. Lines with no `text` key keep their identity and filename.
- [ ] Add a standard-library `speech_metrics(samples, sample_rate)` in `scripts/content-audio.py`. Port it from `analyze` in `spikes/hospital-opening/voice/analyze.py` without numpy. It uses 30 ms frames, counts a frame as active when it is within 35 dB of the loudest frame, and returns active RMS dBFS, peak dBFS, and the speech span from the first to the last active frame. `--self-check` must still import no numpy, torch, mlx, kokoro, or mlx_audio.
- [ ] Add `level(samples, preset)`. When the preset has `loudness`, it applies the gain `min(target - active_rms_dbfs, ceiling - peak_dbfs)` to the float samples before PCM16 quantisation. `generate_clip` calls it before writing the WAV. The manifest entry gains `level` with `gain_db`, `before`, and `after`, and `postprocessing` names the target and the ceiling. A preset with no `loudness` keeps `"PCM16 quantization only; no gain, normalization, trim or resampling"`.
- [ ] Add the syllable-scaled duration check for kind `word`. `generate_clip` rejects a take whose speech span exceeds `0.6 + 0.5 * syllables` seconds, where syllables is the count of Han characters in the text. The take then retries on the next seed. Run the check at accept time only, not in `cache_valid`, so no committed clip loses its cache.
- [ ] Record `generation_seconds` per accepted clip in its manifest entry, timed around the accepted attempt and every rejected one.
- [ ] Keep a failed clip blocking. `run` already returns 1 on any failure and never writes a reference to a missing clip. Do not copy the spike's `SKIP word` path from `spikes/hospital-opening/voice/generate.py`.
- [ ] Extend `self_check()` with the mock-engine cases listed under Verify, unit. Append `english routing, cast presets, loudness, syllable duration, eight seeds` to its final `Self-check passed` line.
- [ ] Create `scripts/fixtures/opening-audio.json`, a minimal content file in the 0050 `opening` shape. Its cast is `doctor` (`ryan-en`, `ryan-zh`), `nurse` (`vivian`), `elder` (`uncle-fu-levelled`), and `aunt` (`serena-levelled`). Its steps are one `say-en` line ("Ah, you're awake. Don't try to sit up yet."), the doctor's `人醒了。`, the nurse's `好的，王医生。`, an elder request `我要豆浆。` with wrong `不对，我要豆浆。` and ok `谢谢你！`, an aunt reply with the option word 好 and the answer `太好了！明天见。`, and an end title `第一天·早安小馆`. That gives 8 line jobs and 19 word jobs. Every `audio` starts as `/audio/pending.wav`.
- [ ] Document the `english` kind, the cast routing, `loudness`, `MAX_ATTEMPTS`, and the syllable check in `docs/content-audio.md`. Add the venv recipe with `HF_HUB_OFFLINE=1`.
- [ ] Reserve the next free ticket number centrally and file `relevel-restaurant-audio`. Today's restaurant lines are not levelled, so day 1 can sound up to about 6 dB quieter than the opening. Levelling them changes 85 filenames and needs a listening pass. That work is out of scope here.

**You see.**

- [ ] `python3 -S scripts/content-audio.py --self-check` ends with `Self-check passed: routing, deduplication, invalidation, plan CLI, mixed-engine cache, missing/corrupt assets, provenance, locking, limits, interrupted writes, input edit guards, signal guards, english routing, cast presets, loudness, syllable duration, eight seeds`.
- [ ] `python3 scripts/content-audio.py --plan` on production content prints 85 rows, every one with `"cached": true`.
- [ ] The real-model smoke prints `Generated /audio/english-<hash>.wav Ah, you're awake. Don't try to sit up yet.` and ends with `27 attempted, 0 failed, 27 available, 0 pending`.
- [ ] `git diff` against the parent link shows no change under `public/audio/` and none in `src/content/content.json`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `self_check()` gains these mock-engine cases. Run `python3 -S scripts/content-audio.py --self-check`.
  - [ ] An `opening` fixture yields one `english` job on the `ryan-en` preset, every zh line on its speaker's `voices.zh` preset, the end title on `wordVoice`, and every token and option word on `wordVoice`.
  - [ ] A `say-en` step whose speaker has no `voices.en`, an unknown `who`, and an unknown preset id each raise `ValueError` before any synthesis.
  - [ ] A phrase with `text` uses that text, punctuation included, as the job text. The legacy fixture's four filenames equal literals pinned from the parent link.
  - [ ] A mock tone at -30 dBFS active RMS on a levelled preset writes a WAV measuring -20 dBFS active RMS within 0.2 dB. A tone with a high crest factor stops at a -1 dBFS peak. A preset with no `loudness` writes its samples unchanged.
  - [ ] A mock word with 2.5 s of speech for one syllable is rejected. A mock that babbles for four seeds and then speaks is accepted on attempt five with five `attempts` recorded. A word with 1 s of leading silence and 0.5 s of tone passes.
  - [ ] A mock that always babbles makes `run` return 1 after eight rejected takes, leaves the content file byte-identical, and leaves the job pending in `--plan`.
  - [ ] No heavy module is imported. The existing `sys.modules` assertion still passes.
- [ ] `src/content/content.test.ts` "casts each regular" gains three `voicesSchema` rejections, for `loudness` with a target of 0, a ceiling of 1, and an unknown key. It also gains one acceptance, for `ryan-en` as shipped. Run `pnpm test`.
- [ ] Run `pnpm build`. Pass when `tsc -b && vite build` exits 0.
- [ ] Run `python3 scripts/content-audio.py --plan | grep -c '"cached": true'`. Pass when it prints 85.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe. Lane n uses `JUNYAN_DEV_PORT=5298+2n` and `JUNYAN_PREVIEW_PORT=5299+2n`, so 0049 owns ports 5300 to 5319. A command-line lane writes its output to `<slug>.txt` and saves `<slug>.png` with `pnpm exec playwright screenshot file:///tmp/swarm-0049/worker-<n>/<slug>.txt <slug>.png`. Real-model lanes create the venv once with `python3.12 -m venv /tmp/junyan-qwen-venv && /tmp/junyan-qwen-venv/bin/python -m pip install -r /Users/callumhemsley/Personal/junyan/output/voice-samples/qwen/runtime-requirements.txt`. That file is untracked, so worktrees lack it, and the absolute path is required. Every real-model command runs with `HF_HUB_OFFLINE=1`.

- [ ] Lane 1. Regression lane against trunk. Run `JUNYAN_DEV_PORT=5300 JUNYAN_PREVIEW_PORT=5301 pnpm exec playwright test e2e/waiter.spec.ts --project=desktop --project=phone` at trunk and head. Trunk has no English kind, so the lane also gates that the head journey is unchanged. Save `journey-head.png`, copied from the journey's final desktop screenshot. Pass when both runs are green with the same test count.
- [ ] Lane 2. Run `python3 scripts/content-audio.py --plan` on production content at head. Save `plan-production.png`. Pass when it prints 85 rows, every row has `"cached": true`, and `git diff <parent>..HEAD --stat -- public/audio src/content/content.json` is empty.
- [ ] Lane 3. Run `python3 -S scripts/content-audio.py --self-check` at head. Save `self-check.png`. Pass when the exit code is 0 and the last line ends with `english routing, cast presets, loudness, syllable duration, eight seeds`.
- [ ] Lane 4. Copy `scripts/fixtures/opening-audio.json` to `/tmp/swarm-0049/worker-4/content.json`. Run `HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv/bin/python scripts/content-audio.py --content /tmp/swarm-0049/worker-4/content.json --voices src/content/voices.json --output /tmp/swarm-0049/worker-4/audio --engine qwen --write-content`. Save `smoke-generate.png`. Pass when the exit code is 0, the last line is `27 attempted, 0 failed, 27 available, 0 pending`, and no `audio` in the copied content still reads `/audio/pending.wav`.
- [ ] Lane 5. Measure the loudness spread of lane 4's output. Read `level.after.active_rms_dbfs` and `level.after.peak_dbfs` for the 7 entries that carry `level`, the English line and the six cast lines, in `/tmp/swarm-0049/worker-4/audio/manifest.json` with `node -e`. Save `loudness-spread.png`. Pass when every line not limited by its peak sits within 1 dB of -20 dBFS, every peak is at or below -1 dBFS, and the line spread is at most 2 dB. The spike's raw spread was about 12 dB.
- [ ] Lane 6. Serve lane 4's audio with `python3 -m http.server 5311 --directory /tmp/swarm-0049/worker-4/audio`. Open `http://127.0.0.1:5311/` in Playwright Chromium and WebKit. For each WAV, load it with `new Audio()` and read `duration`. Save `clips-decode.png`. Pass when every clip fires `loadedmetadata` in both engines and its duration matches `wav_metrics.duration_seconds` within 0.05 s.
- [ ] Lane 7. Rerun lane 4's command against the same output directory. Save `smoke-rerun.png`. Pass when it prints `0 attempted, 0 failed, 27 available, 0 pending` and the manifest bytes are unchanged.
- [ ] Lane 8. Copy the fixture and `src/content/voices.json` to `/tmp/swarm-0049/worker-8/`. Set `vivian`'s `revision` to forty `f` characters in the copy, so the offline model lookup fails on every seed. Run lane 4's command against the copies with a fresh output directory. Save `failure-blocks.png`. Pass when the exit code is 1, stderr has `FAILED line-` for the nurse line, the nurse line's `audio` still reads `/audio/pending.wav`, and `--plan` shows that job with `"cached": false`.
- [ ] Lane 9. Run `JUNYAN_DEV_PORT=5316 JUNYAN_PREVIEW_PORT=5317 pnpm exec playwright test -c playwright.audio.config.ts --project=audio-chromium --project=audio-webkit` at head. Save `audio-suite.png`, copied from a WebKit test screenshot. Pass when every test is green, including the 85-WAV check in `e2e/audio.spec.ts`.
- [ ] Lane 10. Run `JUNYAN_DEV_PORT=5318 JUNYAN_PREVIEW_PORT=5319 pnpm exec playwright test e2e/overnight-offline.spec.ts e2e/offline.spec.ts --project=desktop` at head. Save `offline-390.png`, copied from the spec's `offline-390.png` output. Pass when both specs are green and the precache holds 85 WAVs.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Seconds per accepted clip, with the model already loaded, measured by the same probe at trunk and head on Chinese lines whose preset has no `loudness`. The diff adds English synthesis and the `level` pass. Measure those at head alone, as the English clip median, the `level` time per clip, and the wall time of the whole lane 4 run with model load.
- [ ] Probe. Write `/tmp/swarm-0049/perf/probe.py`. It loads `scripts/content-audio.py` from the worktree path it is given through `importlib`, as `spikes/hospital-opening/voice/generate.py` does. It runs one warm-up job through `LocalEngines`, then times `generate_clip` on six fixed `uncle-fu` lines and prints the median and the p95. At head it also times `level` on each lane 4 clip. Run it under `HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv/bin/python` as trunk, head, trunk, head, each with a fresh output directory. Time the lane 4 command with `/usr/bin/time -p`.
- [ ] Baseline. Record the trunk median and p95 seconds per clip first, from both trunk runs.
- [ ] Rule. Fail when the head median exceeds the trunk median by more than 15 percent on the shared lines. Fail when the English clip median exceeds 4.0 s or its p95 exceeds 8.0 s. Fail when `level` takes more than 0.25 s on any clip. Fail when the lane 4 wall time exceeds 150 s. The spike voiced 17 lines in 28 s.

**Review gate.** None. 0049 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because Bugbot does not run on this repo.
- [ ] The root rebases the link onto its parent after the verdict, with the patch-id unchanged per `playbooks/shipping.md`.
- [ ] The root appends `claude/0049-voice-pipeline-english` to the base-branch stack on `codex/0030-overnight-pstack`, or on `main` once Callum merges that branch, with the PR base set to the branch of the link below it. Callum lands the stack bottom-up.

## Add the opening script and its voiced audio to content (0050)

**Depends on.** 0049. Stack it above 0054 as well. This PR adds 40 WAVs, which breaks the hard-coded 85 at `e2e/audio.spec.ts:196` and `e2e/overnight-offline.spec.ts:51` until 0054 derives those counts from the manifest.

**Files.**

- [ ] Edit `src/contracts.ts`.
- [ ] Edit `src/content/index.ts`.
- [ ] Edit `src/content/words.ts`.
- [ ] Edit `src/content/content.json`.
- [ ] Edit `src/content/content.test.ts`.
- [ ] Edit `public/audio/manifest.json`.
- [ ] Create 40 files `public/audio/(english|line|word)-<content digest>.wav`, written by the pipeline only.
- [ ] Create `spikes/hospital-opening/to-content.mjs`.
- [ ] Edit `docs/characters.md`.
- [ ] Edit `docs/tickets/0050-opening-content.md`.

**Build.**

- [ ] In `src/contracts.ts`, add `Phrase = Line & { text: string }` and `CastMember = { id: string; name: string; voices: { zh: string; en?: string } }`. Add `OpeningStep` as a union on `type` with five members. `say-en` is `{ who; en; audio }`. `say` is `{ who; line: Phrase; recover: string[] }`. `request` is `{ who; line: Phrase; want: string; wrong: Phrase; ok: Phrase; recover: string[] }`, where `want` is a food id. `reply` is `{ who; options: { word: Word; answer: Phrase; recover: string[] }[] }`. `end` is `{ title: Phrase }`. Every step except `end` may carry `enter?: string[]` and `leave?: string[]` cast ids. Add `Opening = { cast: CastMember[]; tray: string[]; steps: OpeningStep[] }` and `Content.opening: Opening`.
- [ ] In `src/content/index.ts`, add `phraseSchema`, which is `lineSchema`'s fields plus `text` matching `/^[\p{Script=Han}，。！？·]+$/u`. Add `castSchema` as `z.strictObject({ id, name: Han-only, voices: z.strictObject({ zh: id, en: id.optional() }) })`. Add `openingStepSchema` as `z.discriminatedUnion('type', [...])` over the five members, then `openingSchema`, and add `opening: openingSchema` to `contentSchema`. Punctuation never becomes a token, because `wordSchema` stays Han-only.
- [ ] Extend the `contentSchema` `superRefine` with these rules, each with its own issue path.
  - [ ] Cast ids are unique, and every `who`, `enter`, and `leave` names a cast id.
  - [ ] Every `voices.zh` and `voices.en` names a preset in `voices.voices`. An `en` preset has language `English`, and a `zh` preset has language `Chinese`.
  - [ ] A `say-en` step's speaker has `voices.en`. Its `en` matches `/^[\x20-\x7E]{1,180}$/`.
  - [ ] Every `say-en` step comes before the first step of any other type. This is the English bound from D9.
  - [ ] For every phrase, `text` with `，。！？·` removed equals its token hanzi joined.
  - [ ] Every `recover` id is the id of a token or the option word in the same step.
  - [ ] `tray` ids are food ids in `content.foods`. A request's `want` is in `tray`, and the wanted food's `word` appears in both `line` and `wrong` tokens.
  - [ ] A `reply` has at least two options with distinct word ids.
  - [ ] Exactly one `end` step exists, and it is last.
- [ ] In `src/content/words.ts`, export `contentLines(content)` that returns today's lines followed by every opening phrase, in step order. Rebuild `contentWords` from `contentLines` plus the food words and the reply option words, so lookups in `src/game.ts:139` accept opening words and the journal order in `src/App.tsx:387` keeps existing words first. Replace the duplicated `lines` and `words` lists at `src/content/content.test.ts:8-11` with `contentLines(content)` and `contentWords(content)`, so the list lives in one place.
- [ ] Write `spikes/hospital-opening/to-content.mjs`. It reads variant A's intro and the shared steps from `spikes/hospital-opening/content.js` and drops steps marked `only: 'B'`. It splits zh strings on spaces and folds `，。！？` into `text`. It maps each hanzi to the existing `Word` object from `contentWords(content)` and fails if a hanzi maps to two ids. It mints the new words with pinyin and gloss from the spike's `words` table and writes `opening` into `src/content/content.json` with every `audio` set to `/audio/pending.wav`. The cast is `doctor` 王医生 (`ryan-zh`, `ryan-en`), `nurse` 护士 (`vivian`), `elder` 老爷爷 (`uncle-fu-levelled`), and `aunt` 小姨 (`serena-levelled`). `tray` is `milk`, `egg`, `bread`. Recover lists follow the spike, mapped to ids. The first request recovers `milk`, the second recovers `egg` and `thank-you`, the 好 reply recovers `good`, and the 谢谢 reply recovers nothing.
- [ ] Reuse existing `Word` objects for 24 opening hanzi. They are 了=`le`, 我=`i`, 明天=`tomorrow`, 再=`again`, 来=`bring`, 看看=`look`, 早上好=`good-morning`, 请=`please`, 给=`give`, 一=`one`, 杯=`cup`, 豆浆=`milk`, 不=`no`, 对=`right`, 要=`want`, 谢谢=`thank-you`, 你=`you`, 想=`think`, 个=`piece`, 鸡蛋=`egg`, 馒头=`bread`, 慢慢=`slowly`, 见=`see`, and 呀=`ha`.
- [ ] Add 22 new words. Twenty come from the variant A tokens. They are 人=`person`, 醒=`wake`, 好的=`okay`, 王=`wang`, 医生=`doctor`, 年轻人=`young-person`, 还=`still`, 记得=`remember`, 吗=`ma`, 是=`be`, 小姨=`aunt`, 别=`dont`, 担心=`worry`, 店=`shop`, 里=`inside`, 帮=`help`, 好=`good`, 太好了=`great`, 谢=`thank`, and 什么=`what`. Two come from the end title, 第一天=`day-one` and 早安小馆=`shop-name`.
- [ ] Generate every clip with 0049, then check the plan. The commands are `python3 scripts/content-audio.py --plan`, then `HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv/bin/python scripts/content-audio.py --engine qwen --write-content`, then `python3 scripts/content-audio.py --plan` again. That gives 4 `english` clips, 14 `line` clips, and 22 `word` clips. A clip that fails all eight seeds blocks the PR. Fix the take by editing the text or the cast's preset, never by skipping the clip.
- [ ] Add the four opening cast members and their presets to `docs/characters.md`. Keep `review_status` pending. Native listening review of the new clips is still open.

**You see.**

- [ ] The second `--plan` prints 125 rows, every one with `"cached": true`. That is 85 existing rows plus 40 new ones.
- [ ] `ls public/audio/*.wav | wc -l` prints the same number as the clip count in `public/audio/manifest.json` and the count of distinct `/audio/` paths in `src/content/content.json`. The test derives that number and never hard-codes it.
- [ ] The app looks and plays exactly as on the parent link. Nothing renders `content.opening` until 0055.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/content/content.test.ts` "validates the shared contract" gains opening mutations that must fail to parse. Run `pnpm test`.
  - [ ] A `say-en` step moved after the first `say` fails.
  - [ ] A `who` of `ghost` fails, and a `say-en` spoken by `nurse` fails.
  - [ ] `voices.zh` set to `ryan-en` fails.
  - [ ] A phrase `text` with `OK` in it fails, and a `text` that differs from its tokens fails.
  - [ ] A token with hanzi `。` fails.
  - [ ] A `recover` id not in its step fails.
  - [ ] A `want` of `bun`, which is not in `tray`, fails.
  - [ ] An `end` step that is not last fails, and a second `end` step fails.
  - [ ] A duplicate cast id fails.
- [ ] A new case, "keeps English inside the premise steps", walks `content` and collects every displayed string. That means phrase `text`, token `hanzi`, option word `hanzi`, cast `name`, and every restaurant line's hanzi. It asserts that none matches `/[A-Za-z]/`. It also asserts that exactly four steps are `say-en` and that they are steps 0 to 3. Run `pnpm test`.
- [ ] A new case, "reuses restaurant words and adds 22", asserts that the opening tokens for 来, 想, 个, 呀, 豆浆, 鸡蛋, and 馒头 `toEqual` the restaurant's `Word` objects with the ids `bring`, `think`, `piece`, `ha`, `milk`, `egg`, and `bread`. It also asserts that exactly 22 opening word ids are absent from the restaurant's words. The existing "stable word IDs" case at `content.test.ts:133` then covers every opening token through `contentWords`. Run `pnpm test`.
- [ ] The manifest case at `content.test.ts:145` gains the opening. A `say-en` audio record has `text` equal to `en` and `voice` equal to `voices.voices[cast.voices.en]`. A phrase record has `text` equal to the phrase `text`, punctuation included, and the speaker's `voices.zh` preset. The end title and every word use `wordVoice`. Run `pnpm test`.
- [ ] The WAV format case at `content.test.ts:168` widens its filename pattern to `/^\/audio\/(english|line|word)-[a-f0-9]+\.wav$/` and covers every opening path. Run `pnpm test`.
- [ ] A new case asserts that the WAV count in `public/audio`, the manifest clip count, and the distinct audio paths in content are equal, with no literal number. Run `pnpm test`.
- [ ] A new case looks up `doctor` through `reduceGame` and gets an entry matching `{ lookups: 1, lastSeen: 123 }`. Run `pnpm test`.
- [ ] Run `pnpm build` and `python3 -S scripts/content-audio.py --self-check`. Pass when both exit 0.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe. Lane n uses `JUNYAN_DEV_PORT=5318+2n` and `JUNYAN_PREVIEW_PORT=5319+2n`, so 0050 owns ports 5320 to 5339. A command-line lane writes its output to `<slug>.txt` and saves `<slug>.png` with `pnpm exec playwright screenshot file:///tmp/swarm-0050/worker-<n>/<slug>.txt <slug>.png`. The preview build serves at `http://127.0.0.1:<preview port>/junyan/`.

- [ ] Lane 1. Regression lane against trunk. Run `JUNYAN_DEV_PORT=5320 JUNYAN_PREVIEW_PORT=5321 pnpm exec playwright test e2e/waiter.spec.ts e2e/learning-help.spec.ts --project=desktop --project=phone` at trunk and head. Trunk has no opening content, so the lane also gates that the opening data leaves the day-1 journey and the Latin-free Help unchanged. Save `journey-head.png`, copied from the journey's final phone screenshot. Pass when both runs are green with the same test count.
- [ ] Lane 2. Build and serve the preview at head with `JUNYAN_PREVIEW_PORT=5323`. From a page at the preview URL, fetch `./audio/<file>` for every `/audio/` path that `content.opening` references. The app resolves audio the same way, through `BASE_URL` at `src/App.tsx:95`. Hash each body with SHA-256. Save `opening-clips-fetch.png`. Pass when all 40 return 200 and every hash equals its manifest `sha256`.
- [ ] Lane 3. Run `python3 scripts/content-audio.py --plan` at head, then `JUNYAN_DEV_PORT=5324 JUNYAN_PREVIEW_PORT=5325 pnpm exec playwright test e2e/audio.spec.ts --project=desktop -g "raw repository WAVs"`. Save `manifest-integrity.png`. Pass when the plan prints 125 rows, all with `"cached": true`, and the spec is green with the count derived from the manifest by 0054.
- [ ] Lane 4. Read `level.after` for the 17 levelled opening entries in `public/audio/manifest.json`. Those are the 4 `english` clips and the 13 cast lines. The end title uses the unlevelled `wordVoice`. Save `loudness-spread.png`. Pass when the line spread is at most 2 dB, every peak is at or below -1 dBFS, and every clip has `attempts` of at most eight with the last one accepted.
- [ ] Lane 5. Open the preview at head on port 5329 in Chromium. Wait for `navigator.serviceWorker.ready`. List the keys of the `junyan-` cache. Then go offline and fetch the first `say-en` clip and the end title clip. Save `offline-precache.png`. Pass when the cache holds every one of the 40 opening clip URLs and both offline fetches return 200 with the manifest hash.
- [ ] Lane 6. Open `http://127.0.0.1:5330/?test=1&seed=42` at trunk and head on desktop at 1440x1000 and phone at 390x844, with reduced motion. Save `day1-desktop.png` and `day1-phone.png`. Pass when the first screen shows 怎么玩 and 开门迎客 at both, and the DOM text of `main` is identical at trunk and head.
- [ ] Lane 7. At head on port 5332, dispatch `{type: 'lookup', wordId: 'doctor', now: 1}` and then `{type: 'lookup', wordId: 'bring', now: 2}` through `window.__TEST__.dispatch`. Open the journal (本子). Save `journal-opening-word.png`. Pass when the journal lists 医生 and 来, and `__TEST__.getState().journal.doctor` is `{lookups: 1, lastSeen: 1}`. At trunk, the `doctor` lookup leaves the journal unchanged.
- [ ] Lane 8. At head on the dev server at port 5334, click 开门迎客 once to unlock audio. Then play each of the four `say-en` clips and the end title clip from the page with `new Audio('./audio/' + file)`. Save `english-playback.png`. Pass when each fires `ended`, no `error` event fires, the console is clean, and each duration matches `wav_metrics.duration_seconds` within 0.05 s.
- [ ] Lane 9. Run `JUNYAN_DEV_PORT=5336 JUNYAN_PREVIEW_PORT=5337 pnpm exec playwright test -c playwright.audio.config.ts --project=audio-webkit --project=audio-chromium` at head. Then decode every opening clip in WebKit through the same page pattern as lane 8. Save `webkit-decode.png`. Pass when the suite is green and every opening clip fires `loadedmetadata` in WebKit.
- [ ] Lane 10. Run `JUNYAN_DEV_PORT=5338 JUNYAN_PREVIEW_PORT=5339 pnpm exec playwright test e2e/overnight-offline.spec.ts e2e/offline.spec.ts --project=desktop` at head. Save `offline-390.png`, copied from the spec's own output. Pass when both specs are green and the precached WAV count equals the manifest clip count.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Three numbers at trunk and head. They are the median milliseconds of `contentSchema.parse(data)` at module load, the bytes under `dist/audio`, and the bytes of the built JS in `dist/assets`. The service worker precaches all of `dist`, so the added audio is also the first-visit download. Trunk has no opening, so also measure the diff-added work at head alone, as `generation_seconds` across the 40 new manifest entries.
- [ ] Probe. Write `/tmp/swarm-0050/perf/parse.test.ts` in the style of `/tmp/hospital-plan/seed.test.ts`. It imports `contentSchema` and `content.json` from the worktree by absolute path, runs 20 warm-up parses, then times 200 parses and logs the median. Run `pnpm exec vitest run /tmp/swarm-0050/perf/parse.test.ts` at trunk, head, trunk, head. After `pnpm build` at each side, sum bytes with `find dist/audio -type f -exec stat -f %z {} + | awk '{s+=$1} END {print s}'`, and do the same for `dist/assets/*.js`. Read `generation_seconds` from the manifest with `node -e`.
- [ ] Baseline. Record the trunk parse median, the trunk `dist/audio` bytes (about 8.1 MB today), and the trunk JS bytes (about 401 kB) first.
- [ ] Rule. Fail when the head parse median exceeds the trunk median by more than 3 ms, or exceeds 10 ms. Fail when `dist/audio` grows by more than 6.0 MB. The spike's opening audio was 5.5 MB with 37 words, so the estimate is about 4.8 MB. Fail when the JS grows by more than 30 kB. Fail when the median `generation_seconds` of the new clips exceeds 3.0 s, or any one exceeds 30 s.

**Review gate.** None. 0050 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because Bugbot does not run on this repo.
- [ ] The root rebases the link onto its parent after the verdict, with the patch-id unchanged per `playbooks/shipping.md`.
- [ ] The root appends `claude/0050-opening-content` to the base-branch stack above 0049 and 0054, with the PR base set to the branch of the link below it. Callum lands the stack bottom-up.
## Add the opening rules as a pure reducer (0051)

**Depends on.** 0048 and 0050. 0048 gives journal entries the `recovered` flag and makes `lookup` spread the previous entry. 0050 gives `content.opening` its step union.

**Files.**

- [ ] Edit `src/contracts.ts`.
- [ ] Edit `src/game.ts`.
- [ ] Create `src/opening.ts`.
- [ ] Create `src/opening.test.ts`.
- [ ] Edit `docs/tickets/0051-opening-rules.md`.

**Build.** Name the data shapes first. The opening wraps the day and never extends `GameState`. A save stays a day session, so nothing here reaches `src/save.ts`. The opening actions reuse the `pickup`, `return-food`, `deliver` and `lookup` shapes from `Action` and add only `advance` and `reply`.

```ts
export type OpeningState = {
  seed: number;                        // normalised like createGame, carried to day 1
  step: number;                        // index into content.opening.steps
  tray: string[];                      // foodIds from the bedside table, at most one
  feedback: "none" | "wrong-food" | "thanks";
  reply: number | null;                // chosen option on the current reply step
  recovered: Record<string, number>;   // wordId to the step index that recovered it (D5 dots)
  journal: GameState["journal"];       // lookups made during the opening
};
export type Session =
  | { phase: "opening"; opening: OpeningState }
  | { phase: "day"; game: GameState };
export type OpeningAction =
  | Extract<Action, { type: "pickup" | "return-food" | "deliver" | "lookup" }>
  | { type: "advance"; now: number }
  | { type: "reply"; option: number };
export type SessionAction = Action | OpeningAction;
```

- [ ] Add `OpeningState`, `Session`, `OpeningAction` and `SessionAction` to `src/contracts.ts`, as above. Add `NEXT_BED = 1`, the table number the elder's bed answers to.
- [ ] Extract the body of the `lookup` branch in `reduceGame` (`src/game.ts:138-159`, as 0048 leaves it) into an exported `recordLookup(journal, action, content)`. `reduceGame` calls it, so its behaviour does not change.
- [ ] Write `createOpening(content, seed)` in `src/opening.ts`. It returns step 0, an empty tray, `feedback: "none"`, `reply: null`, and empty `recovered` and `journal`. It normalises `seed` the way `createGame` does (`src/game.ts:102-104`).
- [ ] Write `createSession(content, seed, start)` with `start` either `"opening"` or `"day"`. The `"day"` branch wraps `createGame(content, seed)`. 0055 picks `start` from what startup finds in storage (D2).
- [ ] Write `reduceOpening(state, action, content)` in `src/opening.ts` as a `switch` on the current step's `type`. A `say-en` or `say` step moves to the next step on `advance` and adds its `recover` list to `recovered` at the current index.
- [ ] Handle the `request` step in `reduceOpening`. `pickup` puts a known foodId on an empty tray and is a no-op when the tray holds one. `return-food` with index 0 empties the tray. A `deliver` to any table but `NEXT_BED` is a no-op.
  - [ ] A `deliver` whose tray is exactly the step's wanted food sets `feedback: "thanks"`, empties the tray and adds the step's `recover` list to `recovered`.
  - [ ] Any other non-empty tray sets `feedback: "wrong-food"`, empties the tray (the elder hands the item back), keeps `step`, and recovers nothing. 0055 shows the step's wrong line, 不对，我要….
  - [ ] `advance` leaves the step only when `feedback` is `"thanks"`, then resets `feedback` and the tray.
- [ ] Handle the `reply` step in `reduceOpening`. The first `reply` with a valid option index sets `reply` and adds that option's `recover` list. Later `reply` actions are no-ops. `advance` leaves the step only when `reply` is set.
- [ ] Route `lookup` in the opening to `recordLookup` on `opening.journal`. A lookup never recovers a word (D4).
- [ ] Write `handoffJournal(opening, now)`. It starts from `opening.journal` and gives each recovered word `recovered: true`. It keeps the entry's `lookups` and `lastSeen`, or writes `lookups: 0, lastSeen: now` for a word recovered without a lookup.
- [ ] Write `reduceSession(session, action, content)`. A day session calls `reduceGame` and ignores `advance` and `reply`. An opening session ignores `move`, `interact`, `pay` and `next-day`, and sends everything else to `reduceOpening`. On the `end` step, an `advance` with a finite `now` of at least 0 returns `{ phase: "day", game: { ...createGame(content, opening.seed), journal: handoffJournal(opening, now) } }`.
- [ ] Keep `src/opening.ts` free of React, DOM, storage, `Date.now` and `Math.random`. It imports only `./contracts`, `./game` and `./content/words`.
- [ ] Set the ticket to `doing` with owner, branch, worktree and port in Notes. Set it to `done` in the last commit, with what was learned.

**You see.**

- [ ] `pnpm exec vitest run src/opening.test.ts` ends with `Test Files  1 passed (1)` and no skipped tests.
- [ ] `pnpm test` stays green, with the count the 0050 head printed plus the cases below.
- [ ] `rg -n "from ['\"](react|react-dom|\./save|\./App)" src/opening.ts` prints nothing, and `rg -n "Date\.now|Math\.random|localStorage|indexedDB|document|window" src/opening.ts` prints nothing.
- [ ] The app is unchanged. `/?test=1&seed=42` still opens on the 怎么玩 help panel with its 开门迎客 button, because nothing mounts the opening until 0055.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/opening.test.ts` gains "walks the variant A script in content order and hands off to day 1". Correct picks and the 好 reply visit every step index once, in order. The result is `phase: "day"`, `day: 1`. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "a wrong item gets wrong-food feedback, keeps the step and recovers nothing". It delivers 馒头 on the 豆浆 request and asserts `feedback: "wrong-food"`, an empty tray, the same `step`, and an unchanged `recovered`. A following 豆浆 delivery gives `"thanks"`. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "recovers each step's list at that step's index". After every step, `recovered` equals the union of the `recover` lists of the settled steps, each keyed to its own step index. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "the 好 and 谢谢 replies take their own branch". 好 recovers `好`. 谢谢 adds nothing new to `recovered`. A second `reply` is a no-op. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "advance waits for an unsettled request or reply". It also asserts that `pickup` outside a request step, a `deliver` to a table other than `NEXT_BED`, and a second `pickup` are no-ops. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "the handoff equals createGame plus the recovered journal". The day `game` deep-equals `{ ...createGame(content, seed), journal }`. Every recovered word has `recovered: true`. A word that was looked up keeps its `lookups` count. A word recovered without a lookup has `lookups: 0` and `lastSeen` equal to the end step's `now`. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "a lookup in the opening counts but does not recover". Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "replays deterministically from the injected seed and time". Two replays with seed 42 deep-equal. Seeds 42 and 7 differ only in `game.seed` and `game.customers`. `vi.spyOn(Date, "now")` and `vi.spyOn(Math, "random")` throw if called. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "does not mutate frozen session or content". It deep-freezes both and replays the opening and the waiter day through `reduceSession`. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/opening.test.ts` gains "a day session routes to reduceGame unchanged". The `completedDay` action list from `e2e/save.spec.ts:8-27` gives deep-equal states through `reduceSession` and `reduceGame`. `advance` and `reply` on a day session return the same object. Run `pnpm exec vitest run src/opening.test.ts`.
- [ ] `src/game.test.ts` stays green with `recordLookup` extracted. Run `pnpm test` and `pnpm build`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run `pnpm exec playwright test e2e/waiter.spec.ts` at trunk and at head on the lane's port pair, then open `/?test=1&seed=42` at 1440x1000 with reduced motion and screenshot the first screen on both. Trunk has no opening, and neither does head until 0055, so the lane gates the unchanged first screen and journey. Save `regression-first-screen.png`. Pass when both runs are green and both first screens show the 怎么玩 help panel with 开门迎客 and no ward or tap-to-wake.
- [ ] Lane 2. On the head dev server, open `/audio/manifest.json` so the app does not boot. Import `/src/opening.ts` and `/src/content/index.ts` in `page.evaluate`, and replay the whole variant A script with the right foods and the 好 reply. Write the per-step transcript into a `<pre>` on the page. Save `golden-transcript.png`. Pass when the transcript lists every step in content order, ends in `phase: "day"` on day 1, and the journal holds 豆浆, 鸡蛋, 谢谢 and 好 with `recovered: true`.
- [ ] Lane 3. Use the same page and imports as lane 2. Deliver 馒头 on the 豆浆 request, then 豆浆. Save `wrong-item.png`. Pass when the first delivery shows `wrong-food`, the same step, an empty tray and no new recovered word, and the second shows `thanks` with 豆浆 recovered at that step's index.
- [ ] Lane 4. Use the same page and imports as lane 2. Replay with the 谢谢 reply in place of 好. Save `reply-thanks-branch.png`. Pass when the handoff journal has no `好` entry and still holds 豆浆, 鸡蛋 and 谢谢 as recovered.
- [ ] Lane 5. Use the same page and imports as lane 2. Send `advance` twice on each request and reply step before settling it, and twice after the handoff. Save `advance-gating.png`. Pass when every early `advance` leaves the step unchanged and the session after the handoff stays on day 1 with an unchanged `game`.
- [ ] Lane 6. Use the same page and imports as lane 2. Look up a fogged word in the doctor's first Chinese line twice, then finish the script. Save `lookup-not-recovery.png`. Pass when that word has `lookups: 2` and no `recovered` flag before the handoff, and keeps `lookups: 2` in the day-1 journal.
- [ ] Lane 7. Use the same page and imports as lane 2. Replay the golden script twice with seed 42 and once with seed 7. Save `determinism.png`. Pass when the two seed-42 sessions are equal as JSON and the seed-7 session differs only in `game.seed` and `game.customers`, which equal `createGame(content, 7)`.
- [ ] Lane 8. Use the same page and imports as lane 2. Replay `completedDay` from `e2e/save.spec.ts:8-27` through `reduceSession` on a day session and through `reduceGame`. Save `day-routing.png`. Pass when the final states are equal as JSON and `advance` or `reply` on the day session returns the identical object.
- [ ] Lane 9. Use the same page as lane 2. Before the imports, replace `Date.now`, `Math.random`, `localStorage.setItem` and `indexedDB.open` with functions that throw, then replay the golden script. Save `purity.png`. Pass when the replay completes with no thrown error, `localStorage.length` is 0 and `indexedDB.databases()` lists no `junyan-waiter`.
- [ ] Lane 10. Build with `pnpm build` and serve the production preview on the lane's preview port. Load it at 390x844 with a seeded day-3 save installed per `installSave` in `e2e/save.spec.ts:46-65`, then reload. Save `phone-saved-player.png`. Pass when the day-3 save loads with its journal, the console is clean, and no opening code runs.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Both sides produce the median per-action cost in microseconds of the `completedDay` journey, through `reduceGame` at trunk and through `reduceSession` on a day session at head. Trunk lacks the opening, so head also reports the median and p95 per-action cost of a full opening replay, and the cost of the `end` step's handoff, the state the player waits for before day 1.
- [ ] Probe. Put an uncommitted `src/perf-opening.test.ts` in each worktree. It runs 100 warm-up replays, then 1000 timed replays with `performance.now`, and prints one JSON line. Run `pnpm exec vitest run src/perf-opening.test.ts` at trunk and head alternately, 10 times each, trunk first on odd rounds.
- [ ] Baseline. Record the trunk median per-action `reduceGame` cost first.
- [ ] Rule. Fail when the head day-session median exceeds the trunk median by more than 10%. Fail when the head opening per-action p95 exceeds 50 microseconds, a full opening replay median exceeds 1 ms, or the handoff median exceeds 2 ms on the Mac.

**Review gate.** None. 0051 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because Bugbot does not run on this repo.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends 0051 to the base-branch stack on its parent branch with `gh pr edit <pr> --base <parent-branch>`. Callum lands the stack bottom-up.

## Give the renderer a scene object and move the restaurant into it (0052)

**Depends on.** 0047.

**Files.**

- [ ] Edit `src/scene/renderer.js`.
- [ ] Edit `src/scene/renderer.d.ts`.
- [ ] Create `src/scene/restaurant-scene.js`.
- [ ] Create `src/scene/restaurant-scene.d.ts`.
- [ ] Create `src/scene/portrait-scene.js`.
- [ ] Create `src/scene/png.mjs`.
- [ ] Create `src/scene/scene-frame-hashes.mjs`.
- [ ] Edit `src/scene/RestaurantScene.tsx`.
- [ ] Edit `src/scene/renderer.test.ts`.
- [ ] Edit `src/scene/render-evidence.mjs`.
- [ ] Edit `src/scene/render-character-evidence.mjs`.
- [ ] Edit `docs/tickets/0052-scene-seam.md`.

**Build.** Name the data shape first. A scene is an object with two methods. `bake(api)` paints the static room once. `draw(api, ...args)` paints one frame on top of the baked buffers. `api` is the rasteriser's own state and primitives, so the moved code reads them by the same names.

```js
// scene = { bake(api), draw(api, ...args) }
// api = { W, H, R2, COS, pix, zb, ground, groundZ, bakedZ, rgb, hash, project, unproject,
//         box, sphere, capsule, castShadow, applyShadows, flushShadows, shadeEdges, dynamicAdd }
createRenderer(canvas, scene) // returns { draw(...args) }
```

- [ ] Change `createRenderer(canvas, tables, appearances)` at `src/scene/renderer.js:161` to `createRenderer(canvas, scene)`. The engine `bake()` calls `scene.bake(api)`, then keeps `applyShadows(groundZ); bakedPix.set(pix); bakedZ.set(zb);` from `:411-412`. The engine `draw(...args)` keeps `pix.set(bakedPix); zb.set(bakedZ); pendingShadows.length=0;` from `:416`, calls `scene.draw(api, ...args)`, then keeps `ctx.putImageData(image,0,0)` from `:442`.
- [ ] Create `restaurantScene(tables, appearances = {})` in `src/scene/restaurant-scene.js`. Move the palette and the `bowl`, `plant` and `stool` helpers (`renderer.js:325-343`) unchanged. Move the bake body (`:345-410`) unchanged. It covers the background fill, the tiled floor, `groundZ.set(zb)`, and the restaurant dressing. Move the draw body (`:417-441`) unchanged.
  - [ ] Destructure `api` at the top of `bake` and `draw`, so each moved line reads the same identifiers. Import `characterFigure`, `characterTray` and `customerPose` from `./renderer.js`.
- [ ] Create `portraitScene(figure = { characterFigure, characterTray })` in `src/scene/portrait-scene.js`. Its `draw(api, palette, yaw, pose, foods, withoutEyes = false)` is the `portrait` body that `render-character-evidence.mjs:24-31` injects today. It renders with `figure.characterFigure` and `figure.characterTray`, so a script can pass in another version's figure code.
- [ ] Move `chunk` and `png` from `render-evidence.mjs:16-32` into `src/scene/png.mjs` and export `png`.
- [ ] Update `src/scene/render-evidence.mjs`. Build the main renderer with `createRenderer(canvas, restaurantScene(tables, appearances))`. Build the portrait renderer with `createRenderer(canvas, portraitScene())`, passing `{carry:!palette.accessory, crouch:seated?1:0, scale:seated?.88:1}` and three buns. Delete the `source.replace`, the `renderer-portraits.mjs` temp file and the `return {draw};` guard.
- [ ] Update `src/scene/render-character-evidence.mjs`. It still reads the baseline with `git show <baseline>:src/scene/renderer.js` and writes it to a temp module. It imports `characterFigure` and `characterTray` from that module unchanged, and renders both versions with the head engine and `portraitScene(figure)`. Delete the `source.replace` and the `pngSource.slice` that extracts `png`, and import `png` from `./png.mjs`.
- [ ] Write `src/scene/scene-frame-hashes.mjs <trunk-root> <head-root> <out-dir>`. It renders the same 200 restaurant frames with each root's renderer. The frames come from the seed-42 day-1 state, phases cycling `seated`, `ordered`, `checkout`, `served`, trays of 0 to 6 buns, eight yaws, `time = k/30`, and `moving` alternating.
  - [ ] A root without `src/scene/restaurant-scene.js` is called with the old signature `createRenderer(canvas, tables, appearances)`. A root with it gets `createRenderer(canvas, restaurantScene(tables, appearances))`. The script never rewrites source.
  - [ ] It runs 10 interleaved rounds and alternates which root goes first. Each round times one `createRenderer` call (the bake) and the 200 `draw` calls per root.
  - [ ] It writes `frames.json` with per-frame SHA-256 and timings, plus `first-trunk.png`, `first-head.png`, `last-trunk.png` and `last-head.png`. It prints `200 frames, <n> differ; bake median trunk <a> ms head <b> ms; draw median trunk <c> ms head <d> ms`. It exits 1 when `n` is not 0.
- [ ] Update `src/scene/renderer.d.ts`. Type `createRenderer(canvas, scene: Scene<Args>)` returning `{ draw(...args: Args): void }`. Declare `restaurantScene(tables, appearances?)` in `src/scene/restaurant-scene.d.ts`, with the draw signature `(state, player, time, moving)` from today's `renderer.d.ts:26-28`.
- [ ] Change `RestaurantScene.tsx:22` to `createRenderer(canvas.current, restaurantScene(TABLES, Object.fromEntries(...)))`. Leave the frame loop at `:20-99` untouched.
- [ ] Leave `characterFigure`, `characterTray`, `customerPose` and every rasteriser primitive byte-for-byte unchanged.
- [ ] Set the ticket to `doing` with owner, branch, worktree and port in Notes. Set it to `done` in the last commit, with the trunk SHA and the frame-hash output.

**You see.**

- [ ] `node src/scene/scene-frame-hashes.mjs <trunk-worktree> <head-worktree> /tmp/swarm-0052/frames` prints `200 frames, 0 differ` and exits 0.
- [ ] `rg -n "source\.replace|return \{draw\};|pngSource" src/scene` prints nothing.
- [ ] `rg -n "Two tall back walls|curled-up shop cat|Pixel wisps" src/scene/renderer.js` prints nothing, and the same search finds all three in `src/scene/restaurant-scene.js`.
- [ ] The restaurant looks and moves the same on the dev server, with the same steam, the same 30fps cap and the same reduced-motion stillness.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/scene/renderer.test.ts` keeps "keeps all elder primitives byte-identical to eeeb18d at eight angles and five poses" (`:161`) unedited and green. Run `pnpm exec vitest run src/scene/renderer.test.ts`.
- [ ] `src/scene/renderer.test.ts` moves its `createRenderer(canvas, [])` call at `:184` and its `createRenderer(firstCanvas, TABLES)` calls at `:234` to `restaurantScene`, with no assertion changed. Run `pnpm exec vitest run src/scene/renderer.test.ts`.
- [ ] `src/scene/renderer.test.ts` gains "bakes the scene once at construction and forwards draw arguments verbatim". A stub scene records its `bake` and `draw` calls and the `api` keys. Run `pnpm exec vitest run src/scene/renderer.test.ts`.
- [ ] `src/scene/renderer.test.ts` gains "keeps 30 restaurant frames byte-identical to trunk". It pins the SHA-256 of the first 30 frames of the `scene-frame-hashes.mjs` set to the value the trunk run printed, with the trunk SHA in the test name. Run `pnpm exec vitest run src/scene/renderer.test.ts`.
- [ ] The whole suite and the types stay green. Run `pnpm test` and `pnpm build`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run `pnpm exec playwright test -c src/scene/playwright.visual.config.ts` at trunk, then at head. It drives `e2e/waiter.spec.ts` and `src/scene/renderer.visual.pw.ts` on the fixed ports 5182 and 5186, so no other lane may hold those ports during the run. After each run, read `canvas.toDataURL()` at the seed-42 playable state with six buns. Save `regression-playable.png`. Pass when both runs are green and the two data URLs are equal strings.
- [ ] Lane 2. Run `node src/scene/scene-frame-hashes.mjs <trunk-worktree> <head-worktree> /tmp/swarm-0052/worker-2/frames`. Save `first-head.png`. Pass when it prints `200 frames, 0 differ`, exits 0, and `first-trunk.png` and `first-head.png` have equal SHA-256.
- [ ] Lane 3. On the head dev server at 1440x1000 with reduced motion, open `/?test=1&seed=42`, press 开门迎客, and dispatch through `window.__TEST__` until table 1 is `checkout` and table 2 is `served`. Repeat on trunk. Save `checkout-served.png`. Pass when the canvas data URLs at trunk and head are equal.
- [ ] Lane 4. On the head dev server at 1280x900 with reduced motion, serve all four tables with `__TEST__.dispatch` until the day ends. Repeat on trunk. Save `day-ended.png`. Pass when the canvas data URLs at trunk and head are equal and the console has no errors.
- [ ] Lane 5. On the head dev server at 390x844 with reduced motion, walk the waiter with six buns to (4.8, 4.8), then (7.4, 7.4), by clicking the canvas through `projectPosition`. Repeat on trunk. Save `phone-walk.png`. Pass when each stop's canvas data URL matches trunk and the tray still holds six items.
- [ ] Lane 6. Run `SCENE_DEMO_URL=http://127.0.0.1:<dev-port> node src/scene/record-demo.mjs /tmp/swarm-0052/worker-6/demo` at head with motion allowed. Save `demo-final-frame.png`. Pass when the script exits 0, `waiter-loaded-walk-silent.mp4` has a video stream and no audio stream, and the video shows the steam wisps rising over both steamer stacks.
- [ ] Lane 7. Run `pnpm exec playwright test e2e/scene-scheduling.spec.ts` at head on the lane's dev port. Save `scheduling.png`. Pass when every test is green, so the offscreen pause, the 30fps cap and the reduced-motion redraw on change still hold.
- [ ] Lane 8. Run `node src/scene/render-evidence.mjs /tmp/swarm-0052/worker-8/head` at head and `node src/scene/render-evidence.mjs /tmp/swarm-0052/worker-8/trunk` at trunk. Save `waiter-directions.png`. Pass when every per-frame PNG and every portrait PNG has the same SHA-256 in both directories.
- [ ] Lane 9. Run `node src/scene/render-character-evidence.mjs /tmp/swarm-0052/worker-9/head eeeb18d` at head and the same command into `.../trunk` at trunk. Save `standing-3x.png`. Pass when both runs exit 0, `elder-proof.json` reports `exactPortraitPixels: true` with the same `comparisons` count, and every `after-*.png` has the same SHA-256 in both directories.
- [ ] Lane 10. Build with `pnpm build` at head and at trunk, serve each production preview on the lane's preview port, and open it at 1440x1000 with reduced motion. Press 开门迎客 and read the canvas data URL. Save `preview-desktop.png`. Pass when the two data URLs are equal and the console is clean.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. The median and p95 bake time in ms (one `createRenderer` call), and the median and p95 `draw` time in ms over the 200-frame restaurant set, at trunk and at head.
- [ ] Probe. Run `node src/scene/scene-frame-hashes.mjs <trunk-worktree> <head-worktree> /tmp/swarm-0052/perf`. It interleaves 10 rounds with the first root alternating each round, and both roots produce both numbers. Run it twice on an otherwise idle Mac and keep both outputs.
- [ ] Baseline. Record the trunk bake median (about 22 ms in the exploration) and the trunk draw median (0.3 to 0.9 ms) first.
- [ ] Rule. Fail when the head bake median exceeds the trunk bake median by more than 10%. Fail when the head draw median exceeds the trunk draw median by more than 10% and by more than 0.05 ms. Fail when the head draw p95 exceeds the trunk draw p95 by more than 15%.

**Review gate.** None. 0052 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because Bugbot does not run on this repo.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends 0052 to the base-branch stack on its parent branch with `gh pr edit <pr> --base <parent-branch>`. Callum lands the stack bottom-up.
## Draw the hospital ward in the real renderer (0053)

**Depends on.** 0052, for the scene-object seam in `createRenderer`. The ward cast's looks stay inside `src/scene/`, so 0053 does not wait on 0050. If the owner finds it must widen the shared accessory enum, that one commit waits until 0050 is in the stack below it.

**Files.**

- [ ] Create `src/scene/ward.js`, the ward scene object `{bake(api), draw(api, frame, time)}` for the 0052 seam.
- [ ] Create `src/scene/ward.d.ts` with the `WardFrame` type and the `wardScene` export.
- [ ] Create `src/scene/ward.test.ts`.
- [ ] Create `src/scene/render-ward-evidence.mjs`, the per-step contact sheet and cast sheet.
- [ ] Create `src/scene/record-ward.mjs`, the review video recorder, built on the `src/scene/record-demo.mjs` pattern.
- [ ] Edit `src/scene/renderer.js` (`characterFigure` at `:51-148` only, for the new kinds and poses).
- [ ] Edit `src/scene/renderer.d.ts` (the `characterFigure` pose and palette types).
- [ ] Edit `src/scene/renderer.test.ts` (new cases only. The elder pin at `:161` stays byte-for-byte as it is.)
- [ ] Edit `docs/design/character-direction.md` (a ward cast section).
- [ ] Edit `docs/tickets/0053-ward-scene.md` (status, owner, branch, ports `5312`/`5313`, and what was learned).

**Build.**

- [ ] Name the data shape before any code. The ward draws one `WardFrame` per call, `{elder: 'lying' | 'sitting'; player: 'lying' | 'sitting'; present: Array<'doctor' | 'nurse' | 'aunt'>; table: string[]; held: string | null}`. `table` lists the food ids on the bedside table in order (`milk`, `egg`, `bread` for 豆浆, 鸡蛋, 馒头). `held` is the food id in 老爷爷's hand. The frame holds no opening rules. 0055 maps `OpeningState` to it.
- [ ] Write `wardScene.bake(api)` in `src/scene/ward.js` from the prototype at `/tmp/junyan-hosp/ward.mjs`. Keep the restaurant's two tall back walls and low front lips. Replace the terrazzo with pale ward tiles. Draw the static room once. Two beds have headboards on the north wall at about `x=-3` (老爷爷) and `x=2.6` (the player), with frames, rails, pillows and folded blankets. A window with curtains sits on the north wall between the beds, and a door with a small glass pane on the west wall. Add a drip stand with a bag beside the player's bed, a monitor on a cart at the player's bed head, a bedside cabinet between the beds, a chair for 小姨, a curtain rail and a plant. Draw no text, no digits and no vermilion anywhere in the canvas.
- [ ] Write `wardScene.draw(api, frame, time)`. Draw the bedside items from `frame.table`, the held item in 老爷爷's hand, both bed occupants, each present cast member, then the blanket box over each lying or bed-seated figure. Animate only from `time`. The drip falls, the monitor dot steps, and the curtain sways a pixel. A fixed `time` gives a fixed frame, so the reduced-motion caller's `time=0` freezes the room.
- [ ] Compose for the fixed camera, which faces the back walls (`src/scene/renderer.js:26-38`). A yaw of `π/4` faces the camera and `5π/4` faces away, so give every figure a yaw in `[0, π/2]`. Standing cast stand on the left of the bed they address and face `+x`, so their faces read three-quarter on. The doctor stands at the player's bed head near `(1.0, -3.8)`. The nurse stands near the door. 小姨 sits on the chair between the beds. 老爷爷 sits up facing the player at yaw near `π/4`.
- [ ] Add a `lying` option to the `characterFigure` pose in `src/scene/renderer.js`. It straightens the legs along the hip line, points the toes up and lays the arms along the body with hands at the hips. The ward lays the rig on the mattress with its own `addBone` point transform, as the prototype did. Hands and shoes must stay under the blanket box.
- [ ] Make bed-seated the existing seated pose raised with `pose.z` to the mattress top, legs hidden by the blanket box. No new branch in `characterFigure`.
- [ ] Add three figure kinds in the `characterFigure` accessory branches (`:75-128`). `doctor` has a white knee-length coat, a cream collar, an ink stethoscope round the neck and short dark hair. `nurse` has pale jade scrubs, hair tied low and a small cream cap with a jade band. `aunt` has a shoulder-length bob, a cardigan over a cream shirt and a bag strap. Her outline must not read as 林姐's high `bun`. 老爷爷 reuses the `glasses` kind with a pyjama palette. The player is the default kind with a pyjama palette and `carry: false`.
- [ ] Widen only the renderer's types. In `src/scene/renderer.d.ts` add `type FigureKind = Character['appearance']['accessory'] | 'doctor' | 'nurse' | 'aunt'`, type `palette.accessory` as `FigureKind`, and add `lying?: boolean` to the pose. Leave `src/contracts.ts:30` and the `characterSchema` enum at `src/content/index.ts:46` untouched. Ward looks live in `src/scene/ward.js`, keyed by cast id.
- [ ] Leave the `glasses` branch and every existing pose untouched, so the elder pin at `src/scene/renderer.test.ts:161` (hash `824e30c9...` against `eeeb18d`) still passes unedited.
- [ ] Write `src/scene/render-ward-evidence.mjs <dir>`. It renders one frame per opening step of variant A in `spikes/hospital-opening/content.js`. The steps are `wake`, `premise-2`, `premise-3`, `premise-4`, `doctor-zh`, `nurse-reply`, `ask-milk`, `wrong-bread`, `hand-milk`, `ask-egg`, `hand-egg`, `aunt-arrives`, `aunt-asks`, `reply`, `end`. It writes `ward-<step>.png` at native 360x280 and 3x, and `ward-contact-sheet.html` plus `ward-contact-sheet.png`. It also writes `ward-cast.png`, the five ward figures in their ward poses at eight yaws, and prints `{bakeMs, drawMs}` as JSON.
- [ ] Write `src/scene/record-ward.mjs <dir> <url>`. It loads the dev server page, imports `/src/scene/renderer.js` and `/src/scene/ward.js` through Vite, mounts a pixelated canvas, steps through the same frames at 3 s each with the clock running, and writes `ward-review.mp4` with `ffmpeg`, as `src/scene/record-demo.mjs:58-59` does.
- [ ] Add a ward cast section to `docs/design/character-direction.md` with the three new looks, the two poses, the yaw rule and the palettes.

**You see.**

- [ ] `node src/scene/render-ward-evidence.mjs output/playwright/0053` prints `{"bakeMs":...,"drawMs":...}` and writes 15 `ward-<step>.png` files, `ward-cast.png` and `ward-contact-sheet.png`.
- [ ] In `ward-wake.png` the player lies in the right-hand bed under a blanket, with no hand or shoe showing through it. 老爷爷 sits up in the left bed, and 王医生 stands at the player's bed head in a white coat, face visible.
- [ ] In `ward-aunt-asks.png` 小姨 sits on the chair between the beds with her face visible, and her bob reads differently from 林姐's bun in `ward-cast.png`.
- [ ] The restaurant at `/?test=1&seed=42` looks the same as at the parent link, and `pnpm test` still reports the elder pin passing.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/scene/ward.test.ts` gains `renders every step frame without DOM globals and is deterministic`. Two draws of the same frame and `time` give byte-identical pixels. Run `pnpm exec vitest run src/scene/ward.test.ts`.
- [ ] `src/scene/ward.test.ts` gains `freezes at time 0 and animates only from the supplied time`. Draws at `time=0` twice are identical. Draws at `0` and `1.3` differ only inside the drip, monitor and curtain bounds.
- [ ] `src/scene/ward.test.ts` gains `keeps lying hands and shoes inside the blanket`. Every transformed hand and shoe bone of the lying player sits inside the bed's x and y bounds and below the blanket top z.
- [ ] `src/scene/ward.test.ts` gains `faces every ward figure toward the camera`. For each figure the eye bones' forward offset has a positive dot product with the camera direction at yaw `π/4`.
- [ ] `src/scene/ward.test.ts` gains `draws no vermilion`. No pixel of any step frame lies within 30 RGB units of the vermilion token in `docs/design/tokens.json`.
- [ ] `src/scene/renderer.test.ts` gains `gives doctor, nurse and aunt distinct primitives` (each kind's bone list differs from the others and from `bun`) and `bed-seated is the seated pose raised` (same bones, offset by `pose.z`). Run `pnpm exec vitest run src/scene/renderer.test.ts`.
- [ ] The elder pin at `src/scene/renderer.test.ts:161` passes with the file's pin case unedited. Check with `git diff <parent>..HEAD -- src/scene/renderer.test.ts`, which shows additions only.
- [ ] `node src/scene/render-character-evidence.mjs output/playwright/0053-character eeeb18d` exits 0, which reasserts the elder's geometry and portraits against `eeeb18d`.
- [ ] Run `pnpm test` and `pnpm build`. Both are green, and the test count is the parent link's count plus the new cases.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run the same restaurant scenario at the parent link and at the head on the dev server. Open `/?test=1&seed=42` at 1440x1000, click 开门迎客, dispatch the moves and pickups from `src/scene/renderer.visual.pw.ts:23-34`, wait six frames, and capture `canvas.toDataURL()`. Trunk has no ward, so record that and gate the ward render in lanes 2 to 10. Save `restaurant-regression.png`. Pass when the head and parent data URLs are byte-identical and the console has no errors.
- [ ] Lane 2. Desktop 1440x1000. Open the dev server, import `/src/scene/renderer.js` and `/src/scene/ward.js` in `page.evaluate`, mount a 360x280 canvas scaled 3x with `image-rendering: pixelated`, and draw `wake`. Save `ward-wake-desktop.png`. Pass when both beds, the window, the drip stand, the monitor, the door and the three bedside items are each visible and named in the report, and the console is clean.
- [ ] Lane 3. Phone 390x844 with the iPhone 13 profile. Draw `wake` scaled to the viewport width. Save `ward-wake-phone.png`. Pass when the canvas fits the width with no horizontal scroll, both beds and the door are distinguishable, and the doctor's eyes cover at least 2 native pixels.
- [ ] Lane 4. Desktop 1280x900. Draw `doctor-zh` with the doctor and the nurse present. Save `ward-doctor-nurse.png`. Pass when the coat and stethoscope and the cap and scrubs are both legible, neither figure overlaps a bed rail, and both faces show eyes.
- [ ] Lane 5. Phone 390x844. Draw `ask-milk`, `wrong-bread` and `hand-milk` in turn. Save `ward-handover.png` as a three-frame strip. Pass when the bedside table loses the handed item and 老爷爷's hand shows the matching item in each frame, with no item floating off a surface.
- [ ] Lane 6. Desktop 1440x1000. Draw `aunt-arrives`, then draw a restaurant frame with 林姐 seated beside it. Save `aunt-vs-linjie.png`. Pass when the head crops differ in outline, with no high rear bun on 小姨, and a reader can tell the two apart without colour.
- [ ] Lane 7. Desktop 1440x1000. Draw the player `lying` and 老爷爷 `lying`, then both `sitting`. Save `poses-lying-seated.png`. Pass when no shoe-coloured `[66,68,65]` or skin-coloured pixel of a lying figure falls outside its blanket's projected rectangle except the head, and seated heads clear the headboard.
- [ ] Lane 8. Phone 390x844 with `reducedMotion: 'reduce'`. Draw `aunt-asks` at `time=0` twice, 2 s apart. Then draw it at `time=0` and `time=1.3` with motion allowed. Save `ward-reduced-motion.png`. Pass when the two `time=0` frames are byte-identical and the moving pair differs only inside the drip, monitor and curtain bounds.
- [ ] Lane 9. Run `node src/scene/render-ward-evidence.mjs /tmp/swarm-0053/worker-9/evidence` and open `ward-contact-sheet.html` in Chromium at 1440x1000. Save `ward-contact-sheet.png`. Pass when the sheet shows 15 labelled steps in the spike's order, cast enter and leave on the steps the spike's `enter` and `leave` name, and no canvas pixel contains text.
- [ ] Lane 10. Run the existing visual and journey checks at the head with `pnpm exec playwright test -c src/scene/playwright.visual.config.ts` after pointing the config's two ports at the lane pair. Save `visual-config.png` from the run's playable-full screenshot. Pass when all 8 tests pass and the waiter journey's screenshots show the restaurant unchanged.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Restaurant `bake` ms and `draw` ms per frame (four seated customers, six-item tray) at the parent link and the head. The parent has no ward, so the diff-added work is ward `bake` ms and ward `draw` ms per frame on the `wake` and `doctor-zh` frames. The user's end state is the ward's frame cost on a throttled phone profile.
- [ ] Probe. Copy `/tmp/junyan-hosp/bench.mjs` to `/tmp/swarm-0053/bench.mjs`, point it at each side's scene module through the 0052 seam, and run it five times per side, alternating parent and head, in the same shell. For the ward, run `node src/scene/render-ward-evidence.mjs` five times and read its `bakeMs` and `drawMs`. For the phone, load the lane 3 page in Chromium with CDP `Emulation.setCPUThrottlingRate` at 6, draw `doctor-zh` 300 times, and record the p95 of `performance.now()` deltas.
- [ ] Baseline. Record the parent link's restaurant `bake` and `draw` medians first.
- [ ] Rule. Fail if the head's restaurant `bake` or `draw` median is more than 10% above the parent's. Fail if ward `bake` exceeds 40 ms or ward `draw` exceeds 2 ms median on the Mac. Fail if the throttled phone `draw` p95 exceeds 16 ms, half the 33 ms frame at the 30 fps cap in `src/scene/RestaurantScene.tsx`.

**Review gate.** The operator reviews before merge.

- [ ] Copy the lane 2, 3, 4, 6, 7 and 9 screenshots into `docs/design/review/0053-review-<slug>.png`, keeping each lane's slug.
- [ ] Record a 30 to 60 second video with `node src/scene/record-ward.mjs /tmp/swarm-0053/video http://127.0.0.1:<lane dev port>` on a lane VM, stepping through the opening frames at phone width. Save it as `docs/design/review/0053-review.mp4`.
- [ ] Post the screenshots and the video to the operator, Callum, in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because Bugbot does not run on this repo.
- [ ] Rebased onto its parent link after the verdict, patch-id unchanged.
- [ ] The root appends 0053 to the base-branch stack with `gh pr edit <pr> --base <parent-branch>`, after Callum's review click. Callum lands the stack bottom-up.

## Prepare the e2e suite to start past the opening (0054)

**Depends on.** 0047.

**Files.**

- [ ] Create `e2e/opening.ts`, the shared seeded-save helper.
- [ ] Create `e2e/opening-hooks.spec.ts`.
- [ ] Edit `src/App.tsx` (`:20-22` only, to read the parameter).
- [ ] Edit `e2e/waiter.spec.ts`, `e2e/scene-scheduling.spec.ts`, `e2e/calm-ui.spec.ts`, `e2e/overlay-focus.spec.ts`, `e2e/overnight-audio.spec.ts`, `e2e/audio.spec.ts`, `e2e/overnight-phone.spec.ts`, `e2e/learning-help.spec.ts`, `e2e/overnight-keyboard.spec.ts`, `e2e/save.spec.ts`, `e2e/startup-focus.spec.ts`, `e2e/offline.spec.ts` and `e2e/overnight-offline.spec.ts`.
- [ ] Edit `src/scene/record-demo.mjs` and `src/scene/renderer.visual.pw.ts`.
- [ ] Edit `docs/tickets/0054-e2e-opening-hooks.md` (status, owner, branch, ports `5314`/`5315`, and what was learned).

**Build.**

- [ ] In `src/App.tsx` next to `testMode` at `:20-22`, add `const opening = import.meta.env.DEV ? new URLSearchParams(location.search).get("opening") : null`. Production never reads the parameter (D7). Nothing reads `opening` until 0055, which consumes `skip` and `play`, so behaviour does not change.
- [ ] Keep `__TEST__.reset()` at `src/App.tsx:349-355` as it is. It returns `createGame(content, seed)` with the panel closed, which is day 1, as D7 requires. The `opening=play` branch of reset lands in 0055.
- [ ] Write `e2e/opening.ts`. `withSkip(path)` appends `opening=skip` with `?` or `&`. `seedDayOne(page, base, state = createGame(content, 42))` lifts `installSave` from `e2e/save.spec.ts:46-65`. It navigates to `${base}audio/manifest.json` so no app code runs on the origin, opens `junyan-waiter` v1 with the `saves` store, puts `state` at `v1`, and removes `junyan-waiter-pending-v1`. It does not open the app, so each spec keeps its own first `goto` and its focus assertions.
- [ ] Switch the production specs to `seedDayOne`, each called before the spec's first app `goto` and before any `addInitScript` or request listener.
  - [ ] `e2e/overlay-focus.spec.ts:12`, the production branch of the `beforeEach`. The development branch takes `withSkip` instead.
  - [ ] `e2e/overlay-focus.spec.ts:91`, production home navigation.
  - [ ] `e2e/startup-focus.spec.ts:12`, the `beforeEach`. It seeds the context once, which covers the eight tests' app loads at `:14`, `:19`, `:36`, `:41`, `:49` and `:70`, holder pages included.
  - [ ] `e2e/offline.spec.ts:16`.
  - [ ] `e2e/overnight-offline.spec.ts:29`, seeded before the `request` listener at `:26`, and `:86` in the opt-in rebuild test.
  - [ ] `e2e/overnight-keyboard.spec.ts:174`, production keyboard interruption.
  - [ ] `e2e/learning-help.spec.ts:106`, production help precache.
- [ ] Replace the local `installSave` in `e2e/save.spec.ts:46-65` with an import of `seedDayOne` followed by `page.goto(withSkip("/?seed=42"))` and the 开门迎客 click, so `:47` and `:64` go through the shared helper.
- [ ] Pass `opening=skip` through `withSkip` on every dev `goto`.
  - [ ] `e2e/waiter.spec.ts:77`, `:117` and `:135`.
  - [ ] `e2e/scene-scheduling.spec.ts:24` and `:49`.
  - [ ] `e2e/calm-ui.spec.ts:17`, `:104`, `:123` and `:134`.
  - [ ] `e2e/overlay-focus.spec.ts:102` and `:134`.
  - [ ] `e2e/overnight-audio.spec.ts:16`.
  - [ ] `e2e/audio.spec.ts:12`, `:126` and `:144`.
  - [ ] `e2e/overnight-phone.spec.ts:58`.
  - [ ] `e2e/learning-help.spec.ts:10`, `:52` and `:79`.
  - [ ] `e2e/overnight-keyboard.spec.ts:40`, `:198`, `:223` and `:239`. The last three load the dev server without `test=1`, and D7 gates the parameter on DEV alone, so `withSkip` works there and keeps their fresh-storage start. Their `__TEST__ undefined` assertions still hold.
  - [ ] `src/scene/renderer.visual.pw.ts:16` and `src/scene/record-demo.mjs:22`.
- [ ] Derive the WAV counts from the manifest. In `e2e/audio.spec.ts:196` replace `toHaveLength(85)` with `toHaveLength(manifest.clips.length)`. In `e2e/overnight-offline.spec.ts:51` import `public/audio/manifest.json` and replace the literal with `expect(audioFiles).toEqual(manifest.clips.map(clip => clip.filename).sort())`.
- [ ] Write `e2e/opening-hooks.spec.ts` with four cases. `opening=skip` on the dev server lands on the 怎么玩 help panel with 开门迎客. `seedDayOne` on the preview leaves a `v1` save whose `day` is 1 and whose journal is empty, and the app opens on 开门迎客. The preview with `?opening=skip` boots the same as without it and has no `__TEST__`. `__TEST__.reset()` after one served table returns a state deep-equal to `createGame(content, 42)`.

**You see.**

- [ ] `pnpm test:e2e` reports the parent link's 123 tests passing plus the new `opening-hooks` cases, and nothing else changes.
- [ ] `grep -n "goto(" e2e/*.ts src/scene/renderer.visual.pw.ts src/scene/record-demo.mjs` shows every dev URL wrapped in `withSkip` and every preview spec calling `seedDayOne` first.
- [ ] `grep -rn "85" e2e/audio.spec.ts e2e/overnight-offline.spec.ts` finds no WAV count literal.
- [ ] The app at `/?test=1&seed=42&opening=skip` looks the same as at `/?test=1&seed=42`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] No Vitest case changes, because 0054 adds no rule. Run `pnpm test` and `pnpm build`. Both are green with the parent link's Vitest count unchanged.
- [ ] `e2e/opening-hooks.spec.ts` gains the four cases in Build. Run `pnpm exec playwright test e2e/opening-hooks.spec.ts`.
- [ ] Run `grep -c "seedDayOne\|withSkip" e2e/*.spec.ts`. Every spec named in Build shows a count above zero. `tsconfig.json` includes only `src`, so no type check covers `e2e/`, and this grep stands in for one.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run `pnpm test:e2e` on the lane's port pair at the parent link and at the head. Trunk has no `opening=skip` and no helper, so record that and gate the unchanged pass set plus the new spec. Save `e2e-summary.png`, a screenshot of both HTML reports side by side. Pass when every test that passed at the parent passes at the head, and the only added tests come from `e2e/opening-hooks.spec.ts`.
- [ ] Lane 2. Desktop 1440x1000. Open `/?test=1&seed=42` and `/?test=1&seed=42&opening=skip` on the dev server. Save `skip-desktop.png`. Pass when both pages show the 怎么玩 panel with 开门迎客 and the full-page screenshots are pixel-identical.
- [ ] Lane 3. Phone 390x844. Repeat lane 2 with the iPhone 13 profile. Save `skip-phone.png`. Pass when both pages are pixel-identical and the console is clean.
- [ ] Lane 4. Production preview in a fresh context. Open `/junyan/?opening=skip` and `/junyan/`. Save `prod-param-ignored.png`. Pass when both land on 开门迎客, `typeof window.__TEST__` is `undefined` on both, and the parameter changes nothing visible.
- [ ] Lane 5. Production preview in a fresh context. Call `seedDayOne(page, previewURL)`, then open `/junyan/?seed=42`. Save `seeded-day-one.png`. Pass when IndexedDB `junyan-waiter`/`saves`/`v1` holds `day: 1` and `seed: 42`, `junyan-waiter-pending-v1` is absent, and the page shows 开门迎客.
- [ ] Lane 6. Run `pnpm exec playwright test -c playwright.recovery.config.ts` at the head. Save `recovery-config.png` from `queued-checkpoint-restored.png`. Pass when all 16 tests pass across the four projects.
- [ ] Lane 7. Run `pnpm exec playwright test -c playwright.audio.config.ts` at the head. Then add one fake clip to a scratch copy of `public/audio/manifest.json` and rerun `audio.spec.ts`. Save `audio-config.png`. Pass when the clean run passes 61 tests and the mutated run fails at the WAV count assertion naming the manifest, then the restored tree passes again.
- [ ] Lane 8. Run `pnpm exec playwright test -c playwright.save.config.ts` at the head, with its port at `:14` and `:18` pointed at the lane's dev port in a scratch copy. Save `save-config.png` from the journal-next-day screenshot. Pass when all 14 tests pass and `grep -n "async function installSave" e2e/save.spec.ts` finds nothing.
- [ ] Lane 9. Run `pnpm exec playwright test -c src/scene/playwright.visual.config.ts`, with its ports `5182` and `5186` pointed at the lane pair in a scratch copy, and `SCENE_DEMO_URL=http://127.0.0.1:<lane dev port> node src/scene/record-demo.mjs /tmp/swarm-0054/worker-9/demo` at the head. Save `demo-final-frame.png`. Pass when all 8 visual tests pass, the demo writes `waiter-loaded-walk-silent.mp4` with a video stream, and the demo URL carries `opening=skip`.
- [ ] Lane 10. Dev server at 1440x1000. Open `/?test=1&seed=42&opening=skip`, click 开门迎客, serve table 1 through `__TEST__.dispatch`, then call `__TEST__.reset()`. Save `reset-day-one.png`. Pass when the state after reset deep-equals `createGame(content, 42)` computed in Node, the panel is closed, and the restaurant shows four seated customers.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Wall-clock seconds for `pnpm test:e2e` and for `pnpm exec playwright test -c playwright.recovery.config.ts`, at the parent link and the head. Both sides run both suites.
- [ ] Probe. On one lane VM with the lane's port pair, run `/usr/bin/time -p` around each suite three times per side, alternating parent and head, with no other Playwright process running. Take the median `real` of each side.
- [ ] Baseline. Record the parent link's medians for both suites first.
- [ ] Rule. Fail if either head median is more than 10% above the parent's. The helper adds one same-origin navigation per production test, about 30 in all.

**Review gate.** None. 0054 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, because Bugbot does not run on this repo.
- [ ] Rebased onto its parent link after the verdict, patch-id unchanged.
- [ ] The root appends 0054 to the base-branch stack with `gh pr edit <pr> --base <parent-branch>`. Callum lands the stack bottom-up.
## Play the hospital opening on first run (0055)

**Depends on.** 0051 (Session wrapper and `reduceOpening`), 0053 (ward scene), and 0054 (`opening=skip` hook and the `e2e/opening.ts` helper). The root stacks 0055 on 0051's branch.

**Files.**

- [ ] Create `src/startup.ts` and `src/startup.test.ts`.
- [ ] Create `src/HospitalOpening.tsx`.
- [ ] Create `src/WordToken.tsx`.
- [ ] Create `src/scene/WardScene.tsx`, unless 0053 already shipped a React wrapper for the ward scene object. In that case edit it.
- [ ] Edit `src/App.tsx`.
- [ ] Edit `src/style.css`.
- [ ] Edit `e2e/waiter.spec.ts`.
- [ ] Create `e2e/opening-start.spec.ts`.
- [ ] Edit `docs/tickets/0055-opening-ui.md`.

**Build.**

- [ ] Write `startSession` in `src/startup.ts` as a pure function of the startup read. It takes the validated checkpoint, the validated `v1` save, and whether the IndexedDB read failed or timed out. It returns a `Session` from 0051. A valid checkpoint or a valid `v1` save returns `{ phase: "day" }` with that game. A failed or timed-out read returns a fresh day 1 with the save error set, as today (`src/App.tsx:138`). Only readable, empty storage returns `{ phase: "opening" }`, and an invalid save counts as empty (D2).
- [ ] Change the `App` state in `src/App.tsx` from `GameState` to `Session`. `dispatch` calls `reduceSession` from 0051. The startup effect (`src/App.tsx:111-144`) calls `startSession` instead of `setState(saved)`.
- [ ] Hold off both stores while `session.phase === "opening"`. The checkpoint write in `dispatch` (`src/App.tsx:79-88`) and the 350ms autosave effect (`src/App.tsx:145-157`) return early in the opening. The first write happens on the transition to `phase: "day"`, so a reload mid-opening replays the opening from 醒来.
- [ ] Gate the test hooks per D7. With `?test=1`, the app starts on day 1 unless the URL has `opening=play`. The DEV-only `opening=skip` from 0054 now lands on day 1's help panel. `window.__TEST__` gains `getSession`, and `reset()` returns to day 1 unless the URL has `opening=play`.
- [ ] Render the wordless wake screen in `HospitalOpening` (D3). The screen is `surface-card` white with one round 48px button, an eye icon, and `aria-label="醒来"`. Its click handler plays the doctor's first line inside the same gesture, so autoplay never refuses it, then dispatches the step forward.
- [ ] Render each `say-en` step as `<p lang="en">` with the speaker label 王医生, a 再听一遍 replay button, and the 继续 circle. The step's clip plays on entry. Every `aria-label` and control stays Chinese.
- [ ] Render Chinese steps through `WordToken` in `src/WordToken.tsx`. The component is one `<button className="word">` with a `fogged` class and `data-recovered` when the opening state has not recovered the word, and the `new-word` dot when the word was recovered on this or the previous step. A tap calls the existing `lookup` path, so the word card and pinyin work as in the restaurant.
- [ ] Render the tray at each `request` step with three tiles, 豆浆, 鸡蛋, and 馒头, drawn with `FoodArt` for `milk`, `egg`, and `bread`. A tile tap dispatches the `pickup` and `deliver` action shapes from `src/contracts.ts:66-74`, routed by `reduceSession` to `reduceOpening`. A wrong tile plays 不对，我要…, nudges the tile, and keeps the tray enabled. A right tile slides the tile out and plays the thanks line.
- [ ] Render the `reply` step as two chips, 好 and 谢谢. The chosen chip disables both, plays its line, and shows the aunt's answer with replay.
- [ ] Render the end card 第一天 · 早安小馆 with the recovered words as `WordToken`s. Its 继续 dispatches the end step. App then shows day 1 with `panel` set to `"help"` (D6), and the existing focus effect (`src/App.tsx:236-245`) moves focus into the help panel.
- [ ] Mount `WardScene` in the opening's world panel. It copies the loop in `RestaurantScene.tsx:20-99`, with the 30fps cap, the offscreen pause, and redraw-on-change under reduced motion, and passes the cast present at the current step to 0053's `ward` scene object.
- [ ] Hold the focus and inert rules from tickets 0045 and 0046. The topbar shows only the brand during the opening. The scene canvas is `inert`. After each step, focus moves to the 继续 circle, or to the first tile or chip on a `request` or `reply` step, and never falls to `body`. While a word card is open, the opening body is `inert` and Escape returns focus to the token.
- [ ] Add the opening styles to `src/style.css`. Use the fog rule from `spikes/hospital-opening/index.html:95`, which is `color: var(--text-muted)`, `filter: blur(1.2px)`, and `opacity: .55`, scoped to `.opening .word.fogged`. A fogged word drops the blur on `:focus-visible`, so its focus ring stays sharp. Sharpening is a `--duration-arrive` transition. Every control is at least 44px. Under `prefers-reduced-motion: reduce`, the wake fade, the tile slide, the nudge, and the dot pop stop, and the sharpening is a fade of 120ms or less.
- [ ] Rewrite the first test in `e2e/waiter.spec.ts` to open `/?test=1&seed=42&opening=play` and play the whole opening before the existing four-table loop. Save one screenshot per step as `output/playwright/<project>-opening-<nn>-<type>.png`. After the handover, assert that `.app-shell` inner text has no Latin letters, with the `/[a-z]/i` pattern from `e2e/learning-help.spec.ts:19`. At the journal step, assert that 豆浆, 鸡蛋, and 谢谢 are in `.journal-list`. Raise the test's limit with `test.setTimeout(180_000)`. Keep `opening=skip` on the other two tests in the file.
- [ ] Write `e2e/opening-start.spec.ts` against the production preview. It covers the empty-storage start, the reload mid-opening, a seeded `v1` save, a checkpoint only, an invalid `v1` save, and a held database open, using the holder-page pattern from `e2e/startup-focus.spec.ts:33-47`.
- [ ] Set ticket 0055 to `done` with what was learned.

**You see.**

- [ ] On fresh storage, the page opens on a white screen with one round eye button and no text. Tapping it plays 王医生's first English line, and the ward fades in.
- [ ] Four English lines play in order, each with replay. Then 王医生 says 人醒了。我明天再来看看。 to the nurse, and from that step on, no Latin letter appears on screen.
- [ ] 老爷爷's request shows three tiles. Unrecovered words look soft. Handing over 豆浆 sharpens 豆浆 and gives it the vermilion dot.
- [ ] The end card 第一天 · 早安小馆 lists the recovered words, and 继续 lands on the 怎么玩 panel with 开门迎客 focused.
- [ ] A reload at any step before the end card shows the eye button again.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/startup.test.ts` covers each `startSession` branch. Empty storage gives `opening`. An invalid save gives `opening`. A valid checkpoint, a valid `v1`, and a failed read each give `day`, and only the failed read sets the save error. Run `pnpm test`.
- [ ] `pnpm build` passes with no type errors in `src/App.tsx`, `src/HospitalOpening.tsx`, or `src/WordToken.tsx`.
- [ ] `e2e/waiter.spec.ts` plays the opening at desktop and phone, writes one screenshot per step, finds no Latin letters after the handover, and finds the recovered words in the journal. Run `pnpm test:e2e e2e/waiter.spec.ts`.
- [ ] `e2e/opening-start.spec.ts` passes all six start cases. The whole suite stays green. Run `pnpm test:e2e`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Open the production preview at `/junyan/` with empty storage at trunk and at head, at phone 390x844 and desktop 1440x1000. Trunk lacks the opening, so record that trunk lands on the 怎么玩 panel. At head, play the opening to the end card, tap 继续, then serve table 1 with change. Save `first-run-<nn>-<width>.png` for each opening step and `first-run-day1-<width>.png` for day 1. Pass when head shows the eye button first, reaches the same 怎么玩 panel trunk shows with 开门迎客 focused, and serves table 1 to the 多谢 chop as trunk does.
- [ ] Lane 2. Reload mid-opening. On empty storage, play to 老爷爷's second request and reload, at phone and desktop. Save `reload-mid-opening-<width>.png`. Pass when the eye button shows again, IndexedDB `junyan-waiter` has no `v1` key, and localStorage has no `junyan-waiter-pending-v1` key.
- [ ] Lane 3. Returning player with a save. Seed a day 2 `v1` save with the `e2e/opening.ts` helper and open the preview, at phone and desktop. Save `returning-player-<width>.png`. Pass when the 怎么玩 panel for 第二天 shows within 1500ms, no eye button appears at any point, and the journal keeps the seeded words.
- [ ] Lane 4. IDB-blocked start. Hold a database open in a second page as in `e2e/startup-focus.spec.ts:33-47`, then open the preview with no checkpoint, at phone and desktop. Save `idb-blocked-<width>.png`. Pass when day 1's 怎么玩 panel shows within 3000ms with the save error note, and the eye button never appears.
- [ ] Lane 5. Wrong item. At 老爷爷's first request, tap 馒头, then 豆浆, at phone and desktop. Save `wrong-item-<width>.png` after the wrong tap. Pass when 不对，我要豆浆。 shows and its clip is requested, the tray stays enabled, no green, tick, or vermilion touches any tile, and the right tile then advances the step.
- [ ] Lane 6. Both reply branches. Play the opening twice from empty storage, once tapping 好 and once tapping 谢谢, at phone and desktop. Save `reply-hao-<width>.png` and `reply-xiexie-<width>.png`. Pass when 好 gets 太好了！明天见。, 谢谢 gets 谢什么呀！明天见。, both chips disable after one tap, and the journal after the handover has 好 only on the 好 run.
- [ ] Lane 7. Keyboard only. Play the opening and reach day 1 with Tab, Shift+Tab, Enter, Space, and Escape only, at desktop 1440x1000 and phone. Save `keyboard-<nn>-<width>.png` at the wake screen, a request, the reply, and the end card. Pass when every step is reachable, focus is visible on every press, `document.activeElement` is never `body`, the canvas never takes focus, and Escape from a word card returns focus to its token.
- [ ] Lane 8. Reduced motion. Emulate `prefers-reduced-motion: reduce` and play the opening at phone and desktop. Save `reduced-motion-<width>.png` at the first recovered word. Pass when no element has a running transform animation, every computed `transition-duration` on `.word` and the tiles is 120ms or less, and the ward draws once per step change.
- [ ] Lane 9. Offline after install. Load the preview once online until `navigator.serviceWorker.controller` is set, clear IndexedDB and localStorage, go offline, and reload, at phone and desktop. Save `offline-opening-<width>.png`. Pass when the opening plays to day 1 offline and every opening line and word clip loads with a duration above 0.
- [ ] Lane 10. Console clean. Play the full opening and two tables of day 1 on the dev server and on the preview, at phone and desktop, with `pageerror` and `console` listeners as in `e2e/waiter.spec.ts:70-74`. Save `console-clean-<width>.png`. Pass when the error list is empty, the page has no horizontal overflow, and `.app-shell` text has no Latin letters after the handover.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. At both trunk and head, measure navigation start to the first interactive control. That control is 开门迎客 on trunk and 醒来 on head. Trunk lacks the opening, so also measure the work the diff adds. The first is 醒来 click to the first line's `playing` event. The second is 醒来 click to 老爷爷's first request on screen, with a scripted player who taps 继续 one second after each clip's `ended`. The third is the ward-to-restaurant stall, the longest main-thread task and the elapsed time from the end card's 继续 to the 怎么玩 panel. Day 1's first frame is the end state the user waits for.
- [ ] Probe. Run a Playwright script on the production preview with Chrome DevTools Protocol `Emulation.setCPUThrottlingRate` at 4 and a `PerformanceObserver` for `longtask`. Alternate trunk and head for 10 runs each at phone 390x844. Both sides report navigation to the first control. Head also reports the three diff-added timings.
- [ ] Baseline. Record the trunk median for navigation to 开门迎客 first.
- [ ] Rule. Fail when the head median for navigation to 醒来 exceeds the trunk median by more than 300ms. The diff-added work has absolute budgets. Fail when 醒来 to the first `playing` exceeds 500ms, when 醒来 to the first request exceeds 35s (the target is 30s), or when the end card's 继续 to the 怎么玩 panel exceeds 500ms or holds a long task above 100ms.

**Review gate.** The operator reviews before merge.

- [ ] Copy the lane 1, 5, 6, and 8 screenshots into `docs/design/review/0055-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the opening from the eye button to day 1's 怎么玩 panel on a lane VM, with a scratch Playwright config that sets `use.video: "on"` as in `src/scene/playwright.visual.config.ts:5-14`. Save it as `docs/design/review/0055-review.mp4`.
- [ ] Post the screenshots and the video to the operator (Callum) in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, since Bugbot does not run on this repo.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends 0055 to the base-branch stack with `gh pr edit <pr> --base <0051 branch>`. Callum lands the stack bottom-up.

## Fog unrecovered words in the restaurant (0056)

**Depends on.** 0055. The root stacks 0056 on 0055's branch.

**Files.**

- [ ] Create `src/recovery.ts` and `src/recovery.test.ts`.
- [ ] Edit `src/game.ts` and `src/game.test.ts`.
- [ ] Edit `src/save.test.ts`.
- [ ] Edit `src/WordToken.tsx`.
- [ ] Edit `src/App.tsx`.
- [ ] Edit `src/style.css`.
- [ ] Edit `docs/design/design-system.md`.
- [ ] Edit `e2e/waiter.spec.ts` and `e2e/save.spec.ts`.
- [ ] Edit `docs/tickets/0056-fog-everywhere.md`.

**Build.**

- [ ] Write `freshWords(previous, next)` in `src/recovery.ts`. It returns the word ids whose `recovered` flag is `true` in `next` and not in `previous`. `App.tsx` keeps the latest non-empty result in component state until the next correct deliver, so the dot is presentation only and never saved. A reload shows no dot, which D5 allows.
- [ ] Write `wordState(entry, fresh)` in `src/recovery.ts`. It returns `"fogged"` when the entry is missing or its 0048 `recovered` flag is `false`, `"dot"` when the word is in `fresh`, and `"plain"` otherwise (D5).
- [ ] Recover the order's words in the `deliver` case of `reduceGame` (`src/game.ts:226-253`). On the matching-tray branch only, call 0048's `recoverWords` with every `order.line.tokens` id. Spread the previous entry so `lookups` and `lastSeen` survive. The `wrong-food` branch and `lookup` recover nothing (D4).
- [ ] Rely on 0048's legacy-load rule and add no second copy. A `v1` save whose entries lack `recovered` loads with every journal word recovered, so it renders `"plain"`.
- [ ] Replace the `new-word` rule in `tokens()` (`src/App.tsx:370-382`) with `WordToken`, fed by `wordState(state.journal[w.id], fresh)`. Every line `tokens()` renders now fogs, including the order line, greeting, thanks, retry, and help lines. The word card headword, the kitchen tile labels, and the journal stay unfogged.
- [ ] Show recovered and looked-up words in the journal. The `words` list (`src/App.tsx:387-392`) keeps every journal entry. A row shows 听过 N 次 only when `lookups` is above 0.
- [ ] Move the fog rule in `src/style.css` from `.opening .word.fogged` to `.word.fogged`, with the `:focus-visible` exception and the 120ms reduced-motion fade from 0055.
- [ ] Amend `docs/design/design-system.md`. Rewrite the usage rule at line 86 to say that an unrecovered word is fogged in `text-muted` at 55% opacity with a 1.2px blur, stays a 44px button that opens its card, and drops the blur under keyboard focus. A word recovered on this or the previous step adds the `word-marker` dot and nothing else. Change "the dot over a new word" at line 44 to "the dot over a recovered word". Add to Motion (line 74) and rule 4 (line 113) that sharpening is a `--duration-arrive` fade, and a fade of 120ms or less under reduced motion.
- [ ] Set ticket 0056 to `done` with what was learned.

**You see.**

- [ ] On day 1, the words of a customer's order line look soft until the player hands over the right tray. After 上菜, the line sharpens and each newly recovered word gets the vermilion dot.
- [ ] One deliver later, the dot stays. Two delivers later, the word is plain.
- [ ] Tapping a fogged word opens its card with pinyin and audio, and the word stays fogged in the line.
- [ ] The 本子 lists recovered words with no count and looked-up words with 听过 N 次.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/recovery.test.ts` covers `wordState` for no entry, a lookup-only entry, a fresh recovered word, and an older recovered word, and `freshWords` across two delivers and a day boundary. Run `pnpm test`.
- [ ] `src/game.test.ts` gains three cases. A correct deliver sets `recovered` on every token of the order line and keeps `lookups`. A `wrong-food` deliver recovers nothing. A `lookup` on an unrecovered word adds `lookups` and leaves `recovered` false. Run `pnpm test`.
- [ ] `src/save.test.ts` gains a case where a legacy save with `{ lookups, lastSeen }` entries loads every word as `"plain"`. Run `pnpm test`.
- [ ] `e2e/waiter.spec.ts` asserts that table 1's line has `.word.fogged` tokens before 上菜 and none after, with a `.new-word` dot on each. `e2e/save.spec.ts` asserts that a legacy save renders no fogged journal word. The Latin check in `e2e/learning-help.spec.ts` stays green. Run `pnpm build && pnpm test:e2e`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `inherit-parent` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Serve table 1 on `/?test=1&seed=42&opening=skip` at trunk and head, at phone 390x844 and desktop 1440x1000. Trunk has the old dot on every word missing from the journal and no fog. Record that, and gate the head behavior. Save `table1-before-<width>.png` and `table1-after-<width>.png`. Pass when the head line is fogged before 上菜, sharp with dots after it, and the receipt, change, and 多谢 chop match trunk.
- [ ] Lane 2. Fresh first run. Open the preview with empty storage, play the opening, and serve day 1's first customer, at phone and desktop. Save `fresh-day1-<width>.png`. Pass when every word recovered in the opening renders sharp in day 1 lines, every other word renders fogged, and day 1 shows no dot until the first correct deliver.
- [ ] Lane 3. Lookup is not recovery. Tap a fogged word in table 1's line, close the card, and open the 本子, at phone and desktop. Save `lookup-stays-fogged-<width>.png`. Pass when the card shows pinyin and plays its clip, the token stays `.fogged`, and the journal lists the word with 听过 1 次.
- [ ] Lane 4. Wrong item. Carry the wrong food to table 1 and tap 上菜, at phone and desktop. Save `wrong-food-fog-<width>.png`. Pass when the retry line plays, every token stays fogged, no new `recovered: true` appears in `__TEST__.getState().journal`, and no green, tick, or vermilion touches a control.
- [ ] Lane 5. Dot window. Serve tables 1, 2, and 3 in order, reopening table 1's dialog after each deliver, at phone and desktop. Save `dot-window-<n>-<width>.png` after each deliver. Pass when table 1's newly recovered words carry the dot after deliver 1 and deliver 2, and render plain after deliver 3.
- [ ] Lane 6. Legacy save. Seed a day 2 `v1` save with pre-0048 `{ lookups, lastSeen }` journal entries through `e2e/opening.ts`, then open the preview, at phone and desktop. Save `legacy-save-<width>.png`. Pass when the seeded words render sharp with no dot, other words render fogged, no save error note shows, and no eye button appears.
- [ ] Lane 7. Reload keeps recovery. Serve table 1 on the preview, wait 650ms, and reload, at phone and desktop. Save `reload-recovered-<width>.png`. Pass when table 1's words stay sharp after the reload and the IndexedDB `v1` journal holds `recovered: true` for them.
- [ ] Lane 8. Keyboard only. Tab through a fogged line at desktop 1440x1000 and phone and open a card with Enter. Save `keyboard-fog-<width>.png` with a fogged token focused. Pass when the focused token's computed `filter` is `none`, the focus ring is visible, and Escape returns focus to the token.
- [ ] Lane 9. Reduced motion. Emulate `prefers-reduced-motion: reduce` and serve table 1, at phone and desktop. Save `reduced-motion-fog-<width>.png` right after 上菜. Pass when every `.word` has a computed `transition-duration` of 120ms or less, no dot scale animation runs, and the line is sharp within 150ms of the deliver.
- [ ] Lane 10. Offline and console clean. Install the preview online, go offline, reload, and serve all four day 1 tables, at phone and desktop, with `pageerror` and `console` listeners. Save `offline-day1-<width>.png` and `journal-<width>.png`. Pass when the error list is empty, the day ends with 今日小结, and the 本子 lists both recovered and looked-up words.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. At trunk and head, measure the time from tapping a customer row to the table dialog's tokens painted. Also measure the style, layout, and paint time for that open from the Chrome DevTools Protocol `Performance.getMetrics` deltas. At head, also measure the frame time during the sharpening transition after 上菜.
- [ ] Probe. Run a Playwright script on the production preview at phone 390x844 with `Emulation.setCPUThrottlingRate` at 4. Open table 1's dialog 20 times per side, alternating trunk and head, and record the open time with `performance.now()` and the next `requestAnimationFrame`. At head, sample `requestAnimationFrame` deltas for 500ms after 上菜.
- [ ] Baseline. Record the trunk median open-to-painted time and the median paint time first.
- [ ] Rule. Fail when the head median open-to-painted time exceeds trunk by more than 16ms, or the head median paint time exceeds trunk by more than 50%. The sharpening is diff-added work, so it has an absolute budget. Fail when the p95 frame time during the sharpening exceeds 33ms.

**Review gate.** The operator reviews before merge.

- [ ] Copy the lane 1, 3, 5, and 6 screenshots into `docs/design/review/0056-review-<slug>.png`.
- [ ] Record a 30 to 60 second video on a lane VM of serving tables 1 and 2, showing the fog, the sharpening, the dot, a lookup that stays fogged, and the 本子. Use a scratch Playwright config with `use.video: "on"`. Save it as `docs/design/review/0056-review.mp4`.
- [ ] Post the screenshots and the video to the operator (Callum) in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done. Skipped in Claude Code, since Bugbot does not run on this repo.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends 0056 to the base-branch stack with `gh pr edit <pr> --base <0055 branch>`. Callum lands the stack bottom-up.
## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Commit the decision trail at `orchestration/log/hospital-opening-trail.tsv` on the top link of the stack, so Callum can audit the run after the fact.
- [ ] Reply to Callum with the report that `autopilot-stack.md` names. Catch him up per the **ketchup** skill, with links to the stack root and tip, a one-line verdict per link, and anything parked or excluded with the reason.

## Appendix A. Prototype evidence

The prototype lives in `spikes/hospital-opening/`. It is a throwaway page opened from disk, with an SVG scene, the three handover variants, a fog toggle, and the voiced script in `content.js`. `verify.mjs` drives every variant through Playwright at phone and desktop widths. Open `spikes/hospital-opening/shots/index.html` to see all 43 screenshots side by side.

The spike is untracked today, so it has no branch and no SHA yet. PR 0047 commits it. Record that commit SHA here when 0047 lands.

### Which handover variant to build

Callum chose variant A on 2026-11-03 after comparing the screenshots. Decision 0004 records the counts, measured by script from `content.js`.

- Variant A, the doctor's English, has 4 English lines and 50 words, all before the first Chinese line. The handover is one step that a test can check.
- Variant B, the inner voice, has 9 English thoughts and 88 words, running up to the end card. It needs a renderer for mixed English and hanzi lines.
- Variant C, the memory card, has one card of 4 lines and 30 words before the scene starts.

Callum also chose fog on, voiced English, breakfast-food requests, the premise "used to speak", and no skip on first run.

### Whether the offline voice models can voice the opening

`spikes/hospital-opening/voice/generate.py` voiced all 17 lines with the repo's Qwen3-TTS model in 28 seconds, and every clip passed the health checks. `voice/provenance.json` records the model revision, speaker, seed, and levels for each clip. The casting is Ryan for the doctor, in English for the `en` lines and Chinese for the `zh` lines, Vivian for the nurse, Uncle_Fu for 老爷爷, and Serena for 小姨 and single words.

The run found three problems that PR 0049 fixes:

- Raw loudness spread about 12 dB across speakers. Serena came out 4 to 9 dB quieter, so the pipeline needs normalisation to -20 dBFS speech RMS with a -1 dBFS peak cap.
- About one in five single-word clips babbled or failed. 一 and 慢慢 failed outright. 了, 给, 想, 个, 馒头, 里, 帮, and 呀 ran too long. The word duration check must scale with syllable count.
- Browsers block autoplay until the first gesture. The tap-to-wake screen in D3 answers that.

### Whether the real renderer can draw a ward

`/tmp/junyan-hosp/ward.mjs` drew a ward with the real software rasteriser. A bed-seated figure works as the seated pose raised to bed height. A lying figure works as a point transform on each bone, but hands and shoes poke through the bed, so PR 0053 adds a `lying` pose. Bake took about 22 ms and each frame took 0.3 to 0.9 ms on a Mac.

### What stays unproven

- No human has listened to the voiced lines yet. The health checks measure level and duration, not whether a line sounds natural.
- No ASR model exists locally, so nothing checks that a clip says the words it should.
- Nobody knows yet how a Mandarin listener hears Ryan's Mandarin accent.
- Renderer speed on a phone is unmeasured. The 3 to 8 times slowdown is a guess.
- The ward composition is unproven in the real renderer beyond the `/tmp/junyan-hosp` sketch. The fixed camera faces the back walls, so PR 0053 has to design the layout.
- The 30-second target for the first request is unmeasured in the real app. PR 0055 measures it.

## Appendix B. Alternatives rejected

- **The SVG scene from the spike.** It was fast to draw, but the game renders with the software rasteriser. An SVG ward would change style at the end card, the moment the player meets the restaurant. D1 keeps one renderer.
- **Re-dressing the restaurant as a ward.** The restaurant dressing is literal code inside `bake` and `draw`. Branching it would tangle two scenes and put the byte-identical restaurant frames at risk. PR 0052 moves the restaurant into a scene object instead, so the ward is a second scene.
- **A phase field on `GameState`.** Every reducer case, the save schema, and the day logic would have to ignore the opening. A `Session` wrapper keeps `GameState` and `reduceGame` unchanged, and a save is always a day session.
- **Variant B, the inner voice.** It is the widest English exception, at 88 words up to the end card. The thoughts risk giving away the next Chinese line, and the mixed lines need a new renderer.
- **Variant C, the memory card.** It is the smallest exception, but the game's first moment becomes reading text on a dark card instead of a scene.
- **Browser speech synthesis.** Voices differ by device and some devices have none. Decision 0004 forbids it, and every line comes from the offline pipeline.
- **Kokoro for the English lines.** Kokoro is not cached locally. Qwen3-TTS speaks English with the Ryan speaker, so the doctor keeps one voice in both languages.
- **The DEV test hook for production specs.** About 30 tests run against the production preview, where `window.__TEST__` and the `opening=skip` parameter do not exist. A seeded day-1 save in `e2e/opening.ts` puts those specs past the opening without a production hook.
- **A skip button.** Callum chose no skip on first run. Returning players never see the opening, so a skip would only shorten the one minute that sets up the premise.

## Appendix C. Risks

Callum can overrule each product default D1 to D10. Each default is listed as a risk with the PR it lands in and what the owner watches.

### Product defaults

- **D1, the real renderer for the ward.** It lands in 0052 and 0053. The ward costs a seam refactor and a new scene instead of reusing the SVG spike. The 0052 owner watches that restaurant frames stay byte-identical. The 0053 owner watches that the ward reads as a ward at phone width.
- **D2, when the opening plays.** It lands in 0055. The opening plays only when startup finds readable, empty storage, or an invalid save. An IDB timeout or a blocked database keeps today's behaviour, so a returning player with slow storage never replays the opening. The owner watches both stores, the IDB `v1` save and the `junyan-waiter-pending-v1` checkpoint, and the 1500 ms timeout path.
- **D3, the wordless tap-to-wake screen.** It lands in 0055. It adds one tap before the first line, but that tap unlocks audio. The owner watches that the button has a target of at least 44 px, the aria-label 醒来, and no English.
- **D4, how words recover.** The journal field lands in 0048, the opening's lists in 0050, and the restaurant rule in 0056. A lookup alone never recovers a word. Legacy saves count every journal word as recovered. The 0048 owner watches that `lookup` keeps the `recovered` field, and that `stateSchema` keeps it instead of stripping it.
- **D5, three dot states.** It lands in 0056 and replaces the rule that a word not in the journal gets a dot. The owner watches that the dot appears once, on the step that recovers a word or the step after, and that the journal shows recovered and looked-up words.
- **D6, day 1 after the end card.** It lands in 0055. Day 1 opens on today's first screen, the 怎么玩 and 开门迎客 help panel. The owner watches that focus lands on that panel after the end card.
- **D7, the skip hook.** It lands in 0054. `opening=skip` works only when `import.meta.env.DEV` is true. `__TEST__.reset()` returns to day 1 unless `opening=play`. The owner watches that the production build contains neither the parameter nor the hook.
- **D8, casting and pipeline gains.** They land in 0049, with the audio generated in 0050. Any line or word that still fails after more seeds blocks the PR. The 0050 owner watches the failure list for single words and the loudness spread after normalisation.
- **D9, the English bound in code.** It lands in 0050 for content and 0055 for the journey. A content `superRefine` puts every `say-en` step before the first Chinese step, and a test finds no Latin text elsewhere. The 0055 owner watches that the journey finds no Latin letters on the game surface after the handover.
- **D10, what 0047 commits.** It lands in 0047. It commits decision 0004, the spike without its WAVs and auditions, and the rule texts that decision 0004 lists. It also fixes `orchestration/bin/verify.sh` to run `test:e2e`. The owner watches that every amended rule names the opening as the only exception.

### Delivery risks

- **The trunk does not hold the game yet.** It affects every PR. `codex/0030-overnight-pstack` is 75 commits ahead of `main`. The root bases the stack on that branch and retargets 0047 to `main` once Callum merges it.
- **Runner rules forbid English.** It lands in 0047. `RUNBOOK.md` lines 19 and 51 and `worker-prompt-template.md` line 16 say "no English". A Codex worker would fail every opening PR until 0047 lands. The 0047 owner watches those three lines.
- **The Codex runner cannot see untracked files.** It lands in 0047. `orchestration/bin/worker.sh` clones from HEAD, so the spike and decision 0004 are invisible to workers until 0047 commits them.
- **`verify.sh` never runs Playwright.** It lands in 0047. Until the fix, a Codex verify pass misses every journey failure.
- **No control skill and no CI.** It affects every live lane. Lanes drive Playwright directly, and the owner's local `pnpm test`, `pnpm build`, and `pnpm test:e2e` are the only gates. The root reruns the gates in the swarm's gates lane.
- **Production specs lose their entry.** It lands in 0054. About 30 tests run against the production preview with no DEV hook. They need the seeded day-1 save from `e2e/opening.ts`, copied from `installSave` in `e2e/save.spec.ts`. The owner watches that the suite stays green with no behaviour change.
- **WAV counts are hard-coded.** It lands in 0054. `e2e/audio.spec.ts` line 196 and `e2e/overnight-offline.spec.ts` line 51 expect 85 WAVs. The owner derives the count from `public/audio/manifest.json`.
- **Word objects must be shared.** It lands in 0050. `content.test.ts` requires equal ids to be the same `Word` object, so 来, 想, 个, and 呀 reuse the existing entries. Punctuation cannot be a token, so the owner folds it into the line text.
- **The accessory enum is a shared schema.** It lands in 0053. The owner serializes that change with 0050's edits to `src/content/index.ts`.
- **The elder pin.** It lands in 0053. `renderer.test.ts` line 161 pins the elder byte-identical to commit `eeeb18d`. The owner adds poses without changing that output.
- **Autosave during the opening.** It lands in 0055. Autosave fires 350 ms after ready, and the checkpoint writes on every non-move dispatch. The owner holds both off until the end card, so a reload mid-opening replays it.
- **Phone renderer speed.** It lands in 0053. Bake is about 22 ms on a Mac, and a phone may run 3 to 8 times slower. The owner measures bake and draw on a phone profile in the perf lane.
- **Voice quality.** It lands in 0049 and 0050. No human has listened, no ASR checks the words, and Ryan's Mandarin accent is untested. Callum listens during the 0055 review.
- **Content and tone.** It lands in 0050. The script must stay light and make no medical claims. Heritage speakers may read a game about losing the language as close to home or as careless. The owner keeps the script from `spikes/hospital-opening/content.js`, which already cut the one medical claim.

## Appendix D. Links and reading list

Read these before editing any PR:

- `AGENTS.md`, `docs/tickets/README.md`, and the PR's ticket.
- `docs/decisions/0004-hospital-opening.md`, then `docs/decisions/0001-first-language.md` and `docs/decisions/0003-pixel-waiter.md`.
- `spikes/hospital-opening/CONTRACT.md` and `spikes/hospital-opening/content.js`.

Read these for each PR:

- **0047.** `docs/design/design-system.md`, `README.md`, `docs/ideas/vision.md`, `orchestration/RUNBOOK.md`, `orchestration/worker-prompt-template.md`, and `orchestration/bin/verify.sh`.
- **0048.** `src/contracts.ts`, the `lookup` case in `src/game.ts`, and `stateSchema` and `validateSavedGame` in `src/save.ts`.
- **0049.** `scripts/content-audio.py`, `src/content/voices.json`, and `spikes/hospital-opening/voice/generate.py` with its `provenance.json`.
- **0050.** `src/content/index.ts`, `src/content/words.ts`, `src/content/content.test.ts`, and `public/audio/manifest.json`.
- **0051.** `src/game.ts`, `src/contracts.ts`, and `src/game.test.ts` for the test style.
- **0052.** `src/scene/renderer.js`, `src/scene/RestaurantScene.tsx`, `src/scene/renderer.test.ts`, and the evidence scripts in `src/scene/`.
- **0053.** `characterFigure` in `src/scene/renderer.js`, `/tmp/junyan-hosp/ward.mjs`, and `docs/design/`.
- **0054.** `playwright.config.ts`, `e2e/save.spec.ts`, every spec that runs against the preview build, and `src/scene/record-demo.mjs`.
- **0055.** `src/App.tsx`, focus and modal handling from tickets 0045 and 0046, `e2e/waiter.spec.ts`, and `spikes/hospital-opening/app.js`.
- **0056.** `docs/design/tokens.json`, `docs/design/tokens.css`, `docs/design/design-system.md`, the `tokens()` renderer in `src/App.tsx`, and the `deliver` case in `src/game.ts`.

Run the **how** skill (`pstack/skills/how/SKILL.md`) before building 0051, 0052, and 0055. Those PRs set the session seam, the scene seam, and the boot path that later PRs build on.

Run the **interrogate** skill (`pstack/skills/interrogate/SKILL.md`) on 0051, 0055, and 0056 before STACK-READY. Those PRs carry contested design in the hand-off rule, the startup gate, and the dot semantics.

Keep the decision trail per `pstack/skills/show-me-your-work/SKILL.md`. The root writes one TSV row per decision at `orchestration/log/hospital-opening-trail.tsv`, including one row per tick, each skipped step, and each verdict with its head SHA. The trail is committed at program close, because Callum reviews the run after stepping away.
