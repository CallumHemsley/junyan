---
id: 21
title: Fix first dialogue audio and interrupted playback errors
status: doing
priority: high
type: bug
created: 2026-11-01
---

## Why

Callum's first public playtest requests reliable first-dialogue audio, better character design and correct tray occlusion, plus a usability break review.

## Done when

- Requested behavior is verified against a repeatable reproduction or inspected render, with appropriate regression coverage.
- Applicable rules/browser checks pass; visual changes are inspected at phone and desktop sizes.
- Evidence, limitations and review findings are recorded before integration/publication.

## Notes

- Implementation: `t3/audio-interruption-fix`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-e6dbcc4e`, strict dev port 5181, preview 5185. Remains doing pending parent independent review.
- Silence override: Chromium uses process `--mute-audio`; WebKit receives valid silent PCM WAV substitutions preserving original headers/sample lengths. No element mute/volume changes or system-volume changes. No subagents.

- Reserved centrally by parent on `codex/0018-character-voices`; writer must record own branch, worktree and strict port.
- Owner: Astra audio orchestrator; Sol 6.1 medium implementation worker.
- Fresh WebKit first visit with first WAV delayed 1500 ms, then replay while loading: original play rejects AbortError, replacement plays, but global audioError displays failure. Evidence: output/playwright/diagnosis/first-dialogue-interrupted.json/.png and runner .mjs. Normal first open passed WebKit/Chromium; autoplay timing remains a hypothesis, not a reproduced cause.

## Implementation handoff — 2026-11-01

- Writer: Sol implementation sub-agent; original reproduction/implementation based exactly on `536f9d9c6abf347a5baead1085b6f42edca7d93c`, then rebased in this isolated worktree onto `cb01704b3987815c6ab7bc62151a0023f971e700` with explicit parent authorization. Rebase had **no conflicts**. No subagents, push, PR, merge, deploy, synthesis, dependency or lockfile changes. Parent review is outstanding; **keep doing** until independent verification.
- `src/audio/playback.ts` owns the current playback request. Replacement/stop invalidates its predecessor **before** pausing; both stale rejection and stale success lose permission to update UI. Current failures, including a current AbortError, are still reported. Native `play()` remains synchronous at the call site.
- App integration stops/invalidate audio on leaving the table panel, closing a word card, day change and unmount. Autosaving does not invalidate playback. No renderer, styles, content, game rules, focus trap, Escape handler, word-card markup or `.claude/launch.json` edits.
- Only the existing audio-status text changes: native `NotAllowedError` asks for a speaker tap; load errors keep the original retry message. This is **not** a silent/muted unlock and does not promise automatic playback after an expired gesture.

### Reproduction and evidence

All paths below are inside this worker's ignored `output/playwright/` directory, retained for parent review, not part of the cherry-pick.

1. Copied the parent's diagnosis runner to `diagnosis/baseline.mjs`, changing only URL to port 5181, evidence names, and silent PCM interception. `node output/playwright/diagnosis/baseline.mjs > output/playwright/diagnosis/baseline.log` reproduced `AbortError` then native `playing` with the error banner still visible. Outputs: `diagnosis/first-dialogue-interrupted-before.json` and `.png`.
2. Before production edits: `AUDIO_EVIDENCE=before pnpm exec playwright test --config playwright.audio.config.ts --project audio-webkit --reporter=json > output/playwright/diagnosis/red.json` failed specifically at the banner-absence assertion, after asserting native AbortError and successful replacement. Probe: first native call at 918 ms, replay at 1226 ms, both active=true, muted=false, volume=1. Screenshot: `diagnosis/audio-webkit-before.png`. An earlier harness-only attempt encountered WebKit's two-byte Range request; the final helper fetches the complete original WAV before silent substitution.
3. Final: `pnpm exec playwright test --config playwright.audio.config.ts --reporter=json > output/playwright/diagnosis/final-all.json` — **25 passed, zero skipped/failures/flakes**. Decoded per-test evidence: `diagnosis/final-summary.json`. WebKit and Chromium cover interrupted first load/replay, genuine network failure/recovery, rapid replay/word taps, modal close, reset, autosave during pending audio, actual day change and policy rejection/recovery. Real native playback promises are observed, never mocked successful; the initial replay test also waits for media time to advance.
4. The deliberately slowed walk, with a 10-second no-page-evaluation wait to avoid automation refreshing user activation, separately reproduces native **NotAllowedError with active=false**, about 8.4 seconds after the click, in WebKit and strict-policy Chromium. Direct replay has active=true and native playing. The policy-specific prompt is asserted, separately from load failure. See `diagnosis/policy-final.json` and the final suite's `policy-scope`/`audio-evidence` attachments. This **does not establish** the cause of Callum's original playtest issue; normal walking still played successfully in these engines.
5. Full existing desktop/phone journeys serve four customers, give change, journal a word, advance the day and persist/reload; production offline audio check uses task port 5185. Screenshots inspected: `audio-desktop-journey-restaurant.png`, `audio-phone-journey-journal.png`, plus `diagnosis/audio-webkit-before.png`, `diagnosis/audio-webkit-after.png`, `diagnosis/audio-chromium-after.png`. Before has the spurious banner; after does not. Existing art/layout concerns remain outside this ticket.
6. Every audio test attaches actual pageerror/console evidence. Normal cases are clean. The intentional failed network request produces Chromium's expected `Failed to load resource: net::ERR_FAILED`; WebKit emitted no console error. There are no uncaught page errors. Journey assertions also check console cleanliness.

### Checks and local setup

- `pnpm exec vitest run --config vite.audio.config.ts > output/playwright/diagnosis/rules-final.log 2>&1` — **46 passed** (38 existing rules/content/navigation/renderer tests plus 8 controller tests). Tests include stale rejection, stale success, current genuine errors, policy distinction/retry and invalidation during pause.
- `pnpm build > output/playwright/diagnosis/build-final.log 2>&1` — passed. Existing Zod dependency annotation warnings remain non-blocking. `git diff --check` passed.
- All 67 original raw WAVs are checked for PCM format, nonempty/nonzero samples and matching silent-fixture non-data headers/data length. The existing offline browser test additionally decodes real raw audio; Chromium journeys use original WAVs with the process sink silenced. No synthesis or new assets.
- Silence: Chromium processes use `--mute-audio`; the policy project additionally uses `--autoplay-policy=user-gesture-required`. Every WebKit media request is fulfilled with valid silent PCM preserving media type, headers/sample count/duration; no element mute or volume changes. The first-load delay remains 1500 ms. These tests verify native lifecycle/policy and asset validity, **not perceived speech quality or physical-device Safari behavior**. System/global volume was never changed.
- Task-local configs: `vite.audio.config.ts` uses `output/vite-audio-cache`, strict dev 5181 and preview 5185. `playwright.audio.config.ts` sets `AUDIO_PREVIEW_URL` for the existing offline test's new optional URL override, and `JUNYAN_PREVIEW_URL` for the parent's overlay tests. Both point only at this worktree's preview 5185; ordinary config/default URLs are unchanged.
- Kept dev server available: `pnpm dev --config vite.audio.config.ts --port 5181 --strictPort`. Preview: `pnpm exec vite preview --config vite.audio.config.ts --base /junyan/ --host 127.0.0.1 --port 5185 --strictPort`. These servers do not themselves emit sound; any reviewer browser must retain the silence handling above.
- Setup deviation: the initial whole-`node_modules` symlink let the first dev startup write generated Vite cache through to the shared root. This was corrected to a local `node_modules` directory with package symlinks and local task cache; no shared-root source files were edited, and no attempt was made to undo shared caches. Final runs use the isolated cache layout.
- Integration ownership: App changes are the import, audio state/ref/playback effects near the top, and the existing audio-status banner only. The future word-card focus/Escape worker's areas are untouched, though inserted lines shift their line numbers. No known source conflict with a renderer-only worker.

### Parent integration validation

- Brought in the parent's save validation `92405a0`, focus/navigation `ef4301a`, and designer documentation `cb01704` by the authorized own-worktree rebase. The audio diff against `cb01704` preserves `loadGame(content)`, the `(word, trigger)` lookup and trigger calls, independent focus/inert/motion effects, stacked Escape behavior, and word-card attributes. No parent checkout edits or merge.
- Added the unchanged parent `e2e/overlay-focus.spec.ts` and `e2e/save.spec.ts` to the task config's desktop and phone Chromium projects, retaining process-level silence. The task config redirects both production test suites to **5185**, not the parent's 5177.
- `pnpm exec vitest run --config vite.audio.config.ts > output/playwright/diagnosis/integrated-rules.log 2>&1` — **77 passed** (including all 31 parent save-validation unit tests). `pnpm build > output/playwright/diagnosis/integrated-build.log 2>&1` passed with the same dependency annotation warnings.
- `pnpm exec playwright test --config playwright.audio.config.ts --reporter=json > output/playwright/diagnosis/integrated-all.json` — **53 passed, 2 intentional skips, zero failures/flakes** in 184 seconds. The skips are the existing phone hidden-header Help cases in development and production; footer Help checks pass. Includes both engines' audio diagnostics, desktop/phone journeys, offline decoding, parent save tests and overlay focus/navigation tests. Recursive decoded results (all 55 cases, native playback and console/page-error attachments): `output/playwright/diagnosis/integrated-summary.json`.
- Inspected integrated screenshots `output/playwright/0025/audio-phone-journey-development-pointer-word-focus.png` and `output/playwright/0025/audio-desktop-journey-production-keyboard-word-focus.png`, alongside the audio red/green and journey screenshots listed above. Focus/card presentation remains intact. Normal audio cases have no console/page errors; the deliberate Chromium failed-network case records its expected resource error. Silence precautions and physical-device/speech-quality limitations remain unchanged.
- Final `git diff --check` passed. Dev 5181 and preview 5185 remain listening for independent review. Parent integration is conflict-free; ticket remains **doing**, not independently approved or done.
