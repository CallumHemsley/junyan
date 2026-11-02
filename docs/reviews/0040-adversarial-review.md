# 0040 — Independent adversarial learning-game review

**Verdict: ISSUES.** One proven persistence defect. The reviewed product is not changed by this review.

- Date: 2026-11-02.
- Reviewed checkout: `21a4faaa8887dc8091f8d34ee70ad462ea472096`.
- Product baseline: `5dfad159c8d3544efccdbaf6500b54f4d3562062`.
- Reviewer: independent Codex worker, branch `t3/review-core-learning-game` (initially `t3/15b4a382`), worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-15b4a382`.
- Owned servers: dev `http://127.0.0.1:5236/`; built preview `http://127.0.0.1:5237/junyan/`; both strict-port.

## Proven defect

### 1. P2 — A word visibly recorded in the journal disappears after an immediate reload

**Location:** `src/App.tsx:110`–`116`; lookup dispatch at `src/App.tsx:310`–`314`.

**Impact:** The word card promises `记在本子里`, but reloading immediately loses that lookup. On reopening the journal, the player sees `0 个词` and the empty-journal instruction. This breaks the central learn-a-word → keep-it-in-the-notebook contract. Delayed reload succeeds, so this is a short persistence window, not general IndexedDB failure. Loss of earnings or other actions was not separately proven and is not counted as another finding.

**Reproduce using actual UI, no test mode or hooks:**

1. Use a fresh browser context at `/?seed=42` (development) or `/junyan/?seed=42` (built preview).
2. Click `开门迎客`, then the `1桌 林姐` customer row. Wait at least 700ms so prior movement/order state has saved.
3. Tap `包子` in `我想要一个包子`. Observe `记在本子里`, `包子`, and `bāozi` in the word card.
4. Reload immediately, without waiting for the hidden 350ms save delay.
5. Click `开门迎客`, then `本子`. Actual result: no saved word. Expected: `包子` remains in the journal.

**Evidence:** Initial exploratory phone reproduction, then two consecutive built-preview phone reproductions. The retained rerunnable script repeats the same case twice per browser/viewport. Primary production screenshot pairs: `output/0040/production-phone-before-reload-1.png` / `production-phone-after-reload-1.png`, and corresponding `-2.png` pair. Exact observed text is retained in `output/0040/exploratory-results.json`. The counterfactual with a 600ms wait preserves `包子`: `output/0040/production-phone-delayed-reload-journal.png`.

**Cause:** The save effect postpones every save by 350ms. There is no immediate durable save for the lookup and no lifecycle handling that closes this window before reload. The journal updates and the affirmative word-card copy appear before persistence.

**Missing regression:** Drive a normal saved game through a visible word tap; immediately reload and assert the visible journal still contains that word. Do not poll IndexedDB or sleep before reloading. The existing `e2e/learning-help.spec.ts:78` test waits for IndexedDB at line 84 before reloading at line 98, so it cannot detect this loss. Test the same user-visible promise on the production subpath as well.

**Suggested correction:** Make discrete learning actions durable promptly, while preserving ordered writes and keeping movement-save throttling. The writer should choose the smallest safe implementation. Parent was notified early and assigned the correction/regression to the 0037 App owner; this review does not certify that later fix.

## Routes actually passed

These are real browser interactions, not reducer simulations. The independent route reads order text and checkout prices from the DOM; it does not derive the answer from hidden state or mutate game state.

| Route | Observed result | Evidence |
| --- | --- | --- |
| Desktop 1440×1000, normal development game | Served all four day-one customers: 包子, 豆浆, 粥, 油条. Correct receipts, change, `3 / 4 桌`, then day summary showing four customers and 10块. | `output/0040/desktop-three-served.png`, `desktop-day-one-summary.png`; independent rerun trace |
| Phone 390×844, built production subpath | Served at least three customers, then all four, paid change, entered day two. Real phone UI has no horizontal overflow. | `output/0040/production-phone-three-served.png`, `rerun-production-phone-summary.png` |
| Wrong food | Submitted 包子 to the 油条 customer on production phone; received `可以回厨房放下，再拿一次。`; returned food and completed the correct order. Independent runner also submits 粥 to the 包子 customer. | `output/0040/production-phone-wrong-food.png`, `rerun-production-phone-wrong-food.png` |
| Full tray | Picked six 包子; all seven pickup buttons became disabled. Returned five and successfully served the remaining 包子. | `output/0040/desktop-full-tray.png`, `rerun-production-phone-full-tray.png` |
| Wrong change | Submitted zero where change was due; observed `再算一算，慢慢来。`; entered the visible paid-minus-total amount and received 多谢. | `output/0040/desktop-wrong-change.png`; receipts in route JSON |
| Day-two recall / partial quantity | Read `我想要两个馒头`; tried one 馒头 and got retry feedback; added the second and completed checkout. | `output/0040/desktop-day-two-partial.png`, `rerun-production-phone-partial-day-two.png` |
| Help and journal word lookups | Expanded help, looked up 厨房, returned to the parent panel, looked up 包子 from dialogue and journal. Pinyin appeared on word cards, not the normal game scene. Delayed reload preserved the journal. | `output/0040/production-phone-delayed-reload-journal.png`, exploratory traces |
| Rapid nested interruptions | Five consecutive journal → 包子 card → Escape → Escape → help → Escape cycles, followed by successful service. An exploratory click behind an already-open table modal was correctly blocked; that automation timeout is not a product defect. | `output/0040/rerun-production-phone-trace.zip` |
| Saved-game reload | Normal delayed reload preserved day two, an in-progress checkout, and the learned journal word. Phone WebKit also preserved `3 / 4 桌` after serving three customers and reloading. | `output/0040/desktop-reload-checkout.png`, WebKit route / runner evidence |
| Production offline | After service-worker control and a completed day-one save, disconnected Chromium, reloaded the built subpath, read a day-two order, served two 馒头, paid change, and reopened 包子 in the journal. | `output/0040/production-phone-offline-day-two.png`, `production-phone-offline-journal.png`; production runner trace |
| WebKit phone, silent valid PCM | Served three customers with change and journal lookup, then reloaded to `3 / 4 桌`. Independent runner extends this through day one and day-two quantity recall. | `output/0040/webkit-phone-three-served.png`, WebKit runner trace |

Desktop and phone gameplay screenshots were opened and visually inspected. The selected real Pixel Plays scene and character art remain visible. No product edits, generated/downloaded audio, dependencies, schema/lockfile changes, AWS writes, deployments or pushes were performed.

## Method and retained evidence

- Applied the three requested pstack principles: prove the real result; judge the learning/service experience; test observable behavior rather than implementation. Read the ticket, AGENTS, accepted decisions, build recommendation and design guidance/tokens.
- Main exploratory and independent proof paths use normal saved-game URLs, **not** `?test=1`; no `window.__TEST__` reads or dispatches. A one-off IndexedDB read during exploratory diagnosis was not used as success proof. Existing repository tests use hooks internally and are corroborating regression checks only, not the evidence for the route table.
- Chromium is explicitly launched with `--mute-audio`. WebKit uses the repository fixture algorithm from `e2e/audio-fixtures.ts`: preserve WAV metadata and replace PCM sample bytes with valid silence in the response only. No WAV file is written or modified. Audio intelligibility is therefore not assessed.
- `output/0040/user-paths.cjs` retains the independent rerunnable user-path script. Run `node output/0040/user-paths.cjs` with the two strict-port servers above active and the existing dependencies available. It records the known immediate-reload defect as `ISSUE`, while asserting the recovery/service paths. No state hooks or fixture saves are used. Runner JSON and traces are in the same directory. The completed run contains **24 records**, reproduces the defect **6/6 times** (two per desktop Chromium, production phone Chromium and phone WebKit), and completes all three browser journeys with empty runtime/console-error arrays.
- `output/0040/exploratory-{desktop,production-phone}-trace.zip` and `exploratory-results.json` retain the exploratory evidence. `rerun-*-trace.zip`, `user-path-results.json` and `user-paths.log` retain the deterministic rerun.
- Evidence is local, ignored output, deliberately not committed; only this report and ticket are committed. Paths are relative to the review worktree above.

## Checks and limitations

- `pnpm test`: **88 passed**, six files. `pnpm build`: **passed**; Rollup emitted dependency annotation warnings, not compilation failures.
- Existing Playwright suite: **71 passed, 2 skipped** on desktop/phone Chromium. The two skipped cases require dedicated strict-autoplay projects. Config: `output/0040/review.playwright.config.ts`; results: `output/0040/e2e-results.json` and `e2e.log`. Final run explicitly sets `AUDIO_PREVIEW_URL`, `JUNYAN_HELP_PREVIEW_URL` and `JUNYAN_PREVIEW_URL` to the owned 5237 production subpath; no shared server is managed.
- Worktree initially had no dependencies. Reused the already-installed project-root `node_modules` through a temporary local symlink; did not install packages. Actual runtime: Node `22.23.4`, Playwright `1.64.1`, Vite `7.3.7`. This is not a fresh lockfile-install reproducibility claim.
- Independent observed browser routes were free of page runtime errors. Existing suites also cover focus trapping, overlay cancellation during walking, corrupt-save recovery, production hook absence, audio supersession and offline resources; their coverage is not a substitute for the separate no-hook journey.
- No real iOS hardware, Firefox, audible Mandarin quality, long-running multi-day balancing, multi-tab concurrent-save behavior or later writer fixes are certified. The production offline journey was Chromium only; WebKit's silent response routing is not evidence of offline audio caching.

## Handoff

The parent received the finding before report completion and the two-repeat production confirmation afterward. Review is complete with **ISSUES**, not blocked. Owned browsers and the two verified worktree servers are closed; the temporary dependency symlink is removed. Learned: waiting for persistence before reloading proves eventual storage but hides precisely the reload window a player can hit.
