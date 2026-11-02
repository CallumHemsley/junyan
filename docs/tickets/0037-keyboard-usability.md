---
id: 37
title: Improve keyboard and assistive usability
status: done
priority: medium
type: chore
created: 2026-11-02
---

## Why

Callum requested ten Sol 6.1 medium agents to improve Junyan using pstack, with silent verification and a consolidated morning result.

## Done when

The assigned slice has reproducible evidence, scoped changes where warranted, and an honest PASS, ISSUES or BLOCKED report. Product fixes require independent review before integration.

## Notes

- Worker: Codex implementation sub-agent; branch `t3/keyboard-usability`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-3c160f02`; dev `5224`, preview `5225`, strict binding. Starting HEAD `21a4faaa8887dc8091f8d34ee70ad462ea472096`; product baseline `5dfad159c8d3544efccdbaf6500b54f4d3562062`.

- Baseline: `5dfad15`.
- Scope: Own src/App.tsx and e2e/overnight-keyboard.spec.ts only. Preserve audio, saves and UI hierarchy; changes limited to proven accessibility/interaction defects.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5224 dev, 5225 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

### Proven defects and focused corrections

1. Start seed 42, keyboard-activate table 4, press Escape while walking: the arrival callback still opens the table. Escape now cancels the route and callback immediately. Baseline failure: `output/playwright/0037/baseline-defects.log` and `baseline-results/` traces.
2. Complete day 1 and press `e` on 今日小结: a served-table receipt replaces the tally. Gameplay shortcuts now respect the day-end modal. The reducer already prevented movement during an ended day; no rule changes were needed.
3. Press `Control+ArrowRight` from the starting position: player changes from `{x:6,y:2.5}` to `{x:6.45,y:2.05}`. Modified shortcuts now leave gameplay alone; ordinary arrows still work. Baseline: `baseline-modifier.log`.
4. Pay successfully by keyboard: the payment control is removed and focus falls outside the modal. Reuse the existing focus-trap effect to recover focus only when the current modal no longer contains it, including customer-phase changes. Baseline: `baseline-journey.log` and `baseline-journey-results/`.

Kitchen-to-table trigger restoration already passed and was retained. Named controls are exercised through Tab/Enter, not synthetic click dispatch. The new full-day keyboard journey serves all four customers, gives change, journals a word, cycles the top word card, restores parent focus, traps the tally and advances the day. Existing inert layers, top-only Escape, playback effects, content, scene, styling and all 85 WAVs are untouched.

Parent subsequently expanded App ownership for [[0042-immediate-reload-saving]] after 0040 proved immediate-reload journal loss. That durable save correction and its non-test regressions are included in this same scoped commit. `src/save.ts` remains untouched; its existing validator is sufficient.

### Verification and gaps

- Final result: **PASS (implementation verification)**. `pnpm test`: 6 files, **88/88 tests passed**. `pnpm build`: passed, with the same pre-existing third-party Zod annotation warning. The selected silent browser suite: **92 passed, 2 intentionally skipped, 0 failed** in 4.7 minutes (`final-e2e.log`); skips are the dedicated autoplay-policy checks, not the keyboard/save regressions. `git diff --check` passed. Both owned ports were released by Playwright teardown.
- Read `principle-experience-first` and `principle-prove-it-works` from pstack 0.15.32 before implementation. No children, remote operations, deployments, AWS writes or system-volume changes.
- Ignored local harness: `output/playwright/0037/playwright.config.ts`; explicit dev/preview ports 5224/5225, strict binding, one worker, desktop 1440×1000 and iPhone-13-sized Chromium, every launch `--mute-audio`.
- Commands: `pnpm install --frozen-lockfile`; `pnpm test`; `pnpm build`; `JUNYAN_PREVIEW_URL=http://127.0.0.1:5225/junyan/ JUNYAN_HELP_PREVIEW_URL=http://127.0.0.1:5225/junyan/ AUDIO_PREVIEW_URL=http://127.0.0.1:5225/junyan/ pnpm exec playwright test --config output/playwright/0037/playwright.config.ts overnight-keyboard waiter overlay-focus learning-help save audio.spec calm-ui --reporter=line`.
- Evidence directory: `output/playwright/0037/`. Console attachments are empty for the new regressions; existing suites also assert their own diagnostics. Desktop/phone restaurant, word-card, tally and journal screenshots were inspected: calm hierarchy and readable Mandarin remain intact, with no horizontal overflow. Existing audio tests verify every WAV against its manifest hash and exercise replay, cancellation and save-related audio lifecycle.
- Gaps: no native screen-reader or physical-device test; no WebKit run. Dedicated native autoplay-policy checks skip outside their dedicated audio projects. Independent cross-review is still required before integration; the implementation worker does not self-approve.
- Learned: modal focus must be revalidated when its contents change, not just when it opens; cancelling movement must also invalidate arrival callbacks. A debounced asynchronous save cannot make an immediate acknowledgement durable without a synchronous checkpoint or delaying that acknowledgement.
