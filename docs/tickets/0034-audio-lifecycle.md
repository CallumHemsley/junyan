---
id: 34
title: Harden audio lifecycle boundaries
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

- Baseline: `5dfad15`.
- Worker: implementation sub-agent; branch `t3/audio-lifecycle-fix`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-0f0062aa`; exact starting HEAD `21a4faaa8887dc8091f8d34ee70ad462ea472096` (product baseline `5dfad15`). Strict dev/preview ports: 5212/5213.
- Product baseline exact SHA: `5dfad159c8d3544efccdbaf6500b54f4d3562062`.
- Scope: Own src/audio/* and e2e/overnight-audio.spec.ts only. Preserve local assets and native audio semantics.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5212 dev, 5213 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

## Diagnosis and correction

- Read the required decisions, build recommendation, design reference/tokens and pstack `principle-prove-it-works` / `principle-test-behavior-not-implementation` before implementation.
- Concrete red reproduction before production changes: two new playback tests failed (`load` expected, `null` reported); the other 88 tests passed. The new native test failed in both Chromium and WebKit: after successful native playback, a real resource error occurred but the Mandarin failure message never appeared. Red browser traces: `output/playwright/0034-red-results/`.
- Cause: the controller only observed the `play()` promise, so an `error` event after its successful settlement had no reporting path. This is distinct from the previously fixed first-dialogue cancellation race.
- Minimal fix: observe the current media's native `error` event; remove its listener before pausing on stop/replacement; preserve request invalidation before pause; prevent a late play success from clearing a failure already observed on that media. Native `play()` remains synchronous; existing policy/load rejection classification is unchanged.
- Four new unit regressions exercise post-start failure/retry, late success after an error, stale error events after stop/replacement and an error emitted during pause. Tests observe reports and playback effects, not listener implementation details.
- New native regression uses the existing valid silent PCM fixture, waits for actual native playback and advancing currentTime, then changes the probed media source to an aborted resource to produce a genuine native resource error. It verifies the failure message, direct replay recovery, and ignoring another real error from the superseded element. This is deliberate fault injection, not a claim to reproduce an organic partially downloaded WAV failure.

## Verification

- Temporary runner `/tmp/junyan-0034-playwright.config.mts` imports the existing audio config and overrides only worktree paths, strict ports 5212/5213, test selection and output. A retained copy is `output/playwright/0034-playwright.config.mts`; no repository config was changed. Existing native audio assertions remain untouched.
- `pnpm exec vitest run src/audio/playback.test.ts`: 12 passed (8 existing + 4 new).
- `pnpm test`: 92 passed across all 6 suites; log `output/playwright/0034-unit.log`.
- `pnpm exec playwright test --config /tmp/junyan-0034-playwright.config.mts audio.spec.ts overnight-audio.spec.ts --project audio-chromium --project audio-webkit`: 20 passed. Existing first-dialogue replacement/AbortError, close/reset/day-change cancellation, autosave ownership, rapid replay/word taps, policy failure/direct retry, network failure/retry and 85 unchanged PCM assets all passed.
- `pnpm exec playwright test --config /tmp/junyan-0034-playwright.config.mts overnight-audio.spec.ts --project audio-chromium --project audio-webkit`: final enhanced native regression passed in both browsers, including stale native resource errors; log `output/playwright/0034-native-recheck.log`.
- Final complete native rerun: `pnpm exec playwright test --config /tmp/junyan-0034-playwright.config.mts audio.spec.ts overnight-audio.spec.ts --project audio-chromium --project audio-webkit --output output/playwright/0034-final-native-results`: 20 passed; log `output/playwright/0034-final-native.log`. Phone native failure and desktop recovered screenshots inspected in that results directory.
- `pnpm exec playwright test --config /tmp/junyan-0034-playwright.config.mts waiter.spec.ts --project audio-desktop-journey --project audio-phone-journey`: 6 passed, including serving all four customers, change, word lookup/journal, next day and save/reload. Log `output/playwright/0034-journey.log`. Desktop 1440 CSS px and phone 390 CSS px restaurant screenshots inspected; scene, Mandarin DOM labels and controls remain intact. Journey console assertions passed.
- Every Chromium launch used `--mute-audio`; native WebKit received silent PCM responses without media mute/volume changes. The new native regression asserts `muted === false` and `volume === 1`. Only injected resource-error console messages are allowed; page errors must be empty. No system volume changes.
- `pnpm build` passed; log `output/playwright/0034-build.log`. Existing third-party Zod Rollup annotation warnings remain non-fatal. Final scoped unit rerun: 12 passed, log `output/playwright/0034-scoped-unit.log`. `git diff --check` passed. Playwright shut down its own servers; `lsof` confirmed no listeners remained on 5212/5213.
- Implementation outcome: **PASS**, pending independent review before integration. Learned: native playback success is not the end of the media error lifecycle; keep event ownership active until stop/replacement, with the same stale-request guard as promise settlements.

## Limits and integration

- Independent review remains the parent agent's responsibility before integration; no children were started.
- No physical iOS device or audible-quality check was attempted. Native event fault injection covers the error boundary, not all possible streaming/network behavior.
- No App, config, dependencies, lockfile, schema, assets/WAVs, push, deployment or AWS changes. Local dependency installation used the existing frozen lockfile. Build output/cache/evidence are ignored local artifacts only.
