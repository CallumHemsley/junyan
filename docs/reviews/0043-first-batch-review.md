# First batch independent review

**Verdict: PASS for the four exact changes below.** No actionable correctness defects or architecture violations found. This is not an all-browser/all-lifecycle guarantee: physical hidden-tab restoration remains unverified; the handler passed a clearly labelled synthetic check.

Reviewed by Codex on 2026-11-02 in `t3/review-first-batch`, starting at `e99da37fd1d1018590bbc6f01b1b1a4ffe7d9474`. No children, fixes, pushes, deployments or AWS operations. The final commit contains only this report and ticket0043.

## Exact scope

| Change | Reviewed SHA | Comparison |
| --- | --- | --- |
| Scene scheduling | `e99da37fd1d1018590bbc6f01b1b1a4ffe7d9474` | Parent `376a060b650087d334d7632dedc20ee0d51dff09` |
| Save boundary | `0b79e3362e75d2fe3cad3572f964afd80e394144` | Worker parent `21a4faaa8887dc8091f8d34ee70ad462ea472096` |
| Native audio errors | `d3b027ddc59aab6845803c4030d359e30375e833` | Same worker parent |
| Audio tooling | `cac4d9ca3cbcccf85485c64028334d4032a97858` | Same worker parent |

Product baseline: `5dfad159c8d3544efccdbaf6500b54f4d3562062`. Applied the three worker commits with `git cherry-pick --no-commit` to the starting scene commit for combined verification, then removed those review-only applications before committing this report. Line references below describe that combined tree.

Read AGENTS.md, the ticket contract, accepted decisions, build/art guidance and design tokens/mockups, plus pstack 0.15.32 `principle-prove-it-works` and `principle-test-behavior-not-implementation`. Assumed the intended load: one offline browser player and one local audio-generation writer, not a distributed database/service.

## Standards and behavior review

**Scene — PASS.** `src/scene/RestaurantScene.tsx:24` keeps one pending frame, gates both scheduling and drawing on intersection/document visibility, and uses state invalidation for static reduced-motion updates. `src/scene/RestaurantScene.tsx:50` resets animation timing on restoration/preference changes; hidden changes retain dirty state until restoration. `src/scene/RestaurantScene.tsx:68` cancels the frame, disconnects observation, removes both listeners and clears invalidation on cleanup. Reviewed initial effect ordering and the StrictMode setup/cleanup path. Renderer geometry, cast data and rules are untouched. The remaining App walking frame loop is outside this renderer-specific change; no claim of eliminating every application frame callback.

**Save — PASS.** `src/save.ts:106` rejects an observed blocked open and closes a later successful connection instead of leaking it. `src/save.ts:123` resolves only on transaction completion and rejects transaction abort/error, including an abort after the request succeeded. `finally` still closes connections for successful reads/writes, failures and synchronous transaction/store errors. Existing format and validation remain unchanged; this does not fix the separate App save debounce/reload race.

**Audio — PASS.** `src/audio/playback.ts:11` invalidates ownership and removes the old listener before pausing; `src/audio/playback.ts:27` reports current native resource errors after `play()` has resolved. The failure latch prevents later promise success from erasing that error. Stale errors/rejections remain ignored, policy errors retain their existing classification, and playback still begins synchronously in the gesture handler. App stop/replacement/day-change callers were checked.

**Tooling — PASS.** `scripts/content-audio.py:178` verifies recorded synthesis identity as well as digest and WAV bytes. `scripts/content-audio.py:316` rejects malformed/duplicate manifest entries before generation. `scripts/content-audio.py:367` guards both authored inputs before updating content references. No cache-key/version churn or new model imports are introduced. Per-file atomic replacement is not a cross-file transaction; the updated documentation correctly retains interrupted-run/orphan-file and concurrent-editor limits.

## Independent verification

Evidence root: `/tmp/junyan-0043-review/` in this reviewer environment; temporary files are not durable repository artifacts. The runner configuration and synthetic visibility harness are retained there. Browser screenshots also remain in this checkout's ignored `output/playwright/` directory.

| Check | Result | Evidence |
| --- | --- | --- |
| Complete combined unit suite | **110 passed**, six files; repeated successfully | `unit.log`, `unit-final.log` |
| TypeScript and production build | **PASS** | `tsc -b`; `build-retry.log` |
| Stdlib tooling self-check | **PASS**, fake samples/temp fixtures only | `tooling.log` |
| Read-only real audio plan | **85 jobs, 85 cached** | `plan.jsonl` |
| Selected real browser matrix | **35 passed**, no skips in the selected set | `e2e.log`, `e2e.json` |
| Final scene-only rerun after red check | **4 passed** | `green-scene.log` |
| Native IndexedDB success/abort/retry | **PASS** | `native-save.log` |
| Synthetic visibility plus production smoke | **PASS**, explicitly not physical backgrounding | `visibility-synthetic.log`, `visibility.json` |

Used Node 22.23.4 and existing root-installed dependencies: TypeScript 5.9.3, Vite 7.3.7, Vitest 3.2.7 and Playwright 1.64.1. No package install or lockfile change. Dev/preview bound only this checkout's strict ports **5248/5249**. Later Vite runs used the runner config loader and `/tmp/junyan-0043-review/vite-cache` rather than a shared optimizer cache.

Representative commands, run from this checkout with its temporary dependency symlink:

```sh
node node_modules/vitest/vitest.mjs run --config /tmp/junyan-0043-review/vite.config.mjs --configLoader runner --cache=false
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build --config /tmp/junyan-0043-review/vite.config.mjs --configLoader runner
python3 scripts/content-audio.py --self-check
python3 scripts/content-audio.py --plan
node node_modules/@playwright/test/cli.js test --config /tmp/junyan-0043-review/playwright.config.cjs
```

The temporary Vite config imports the repository config and overrides only `cacheDir`. The temporary Playwright config points at the repository `e2e/`, uses one worker and the two Chromium viewport projects plus a WebKit project restricted to `overnight-audio.spec.ts`, with no automatic/shared servers. Its selected files are waiter, save, scene-scheduling, audio and overnight-audio; it excludes the immediate-reload journal test and expired-gesture policy test.

### Browser behavior and silence

- **17 desktop + 17 phone Chromium + 1 WebKit** checks passed. Desktop is 1440×1000 CSS pixels; phone is the iPhone 13 profile, 390×664 CSS pixels. All Chromium launches, including ad hoc checks and deliberate baseline-failure runs, used `--mute-audio`. WebKit's native media regression used the repository's valid silent PCM response fixture. No system volume or media-element volume/mute changes.
- Both real journeys served **all four** customers, gave change, collected/read the journal and advanced to day2. Inherited IndexedDB cases recovered corrupt saves and retained journal/earnings on a completed-day reload. The native-audio test waited for successful playback and advancing `currentTime`, induced a genuine resource error through source replacement, verified the Mandarin failure message, replay recovery and an ignored stale native error. This is fault injection, not an organic streaming-failure reproduction.
- Real scroll/intersection tests proved offscreen pause and repaint on return; reduced-motion tests exercised pointer-driven state changes and motion-preference toggles. An extra 600ms measurement found **zero visible reduced-motion draws**, **zero offscreen reduced-motion draws** and identical static canvas pixels. A synthetic `document.hidden`/`visibilitychange` transition found zero hidden animated draws and correct restoration, including a preference change while hidden. The supplied parent baseline 14/13 draws was not independently remeasured in matching 600ms windows.
- Inspected newly generated desktop/phone restaurant and restored-scene screenshots, phone native-error UI and desktop recovered UI. The actual Pixel Plays scene, all four named regulars including **张老师 / ZhangLaoshi**, Mandarin DOM labels and calm layout remain present, without viewport overflow. Journey, audio and production-smoke console/page-error assertions passed; only the deliberately injected network-resource errors were permitted in failure tests. Scene tests themselves collect page errors, not every console level.
- Production preview loaded correctly with no console/page errors and `window.__TEST__` absent even with `?test=1&seed=42`. All **85 WAV files** matched product-baseline Git blob hashes individually, not just file counts; `public/audio`, `src/content` and `src/scene/renderer.js` had no diff from the product baseline.

### Regression strength

The new tests drive public storage/playback boundaries, observable error reports, actual pixels/draw work and real browser controls rather than private helper ordering. Resource-close/pause assertions test the promised ownership boundary.

1. Exported baseline source to a disposable `/tmp` tree and overlaid the exact committed save/audio tests, without changing repository tests. Running those tests against baseline production code gave **6 expected failures / 55 passes**: two blocked-open timeouts, success-before-abort restoration, an abort-without-request-error timeout, and two missed native-media error reports. The combined code passes all 61 of those tests as part of the 110-test suite. Evidence: `red.log`.
2. Temporarily applied only the exact `376a060` scene source in this checkout. All **four** committed desktop/phone scene regressions failed on continuing draws; restoring the exact `e99da37` source made all four pass. Evidence: `red-scene.log`, `green-scene.log`. No authored production/test edits were made.
3. Ran the current self-check function against baseline tooling in a disposable Python namespace. It rejected baseline acceptance of contradictory cached provenance; the unchanged committed tooling passes its full self-check. Evidence: `tooling-red.log`.
4. Beyond fake IndexedDB events, the ad hoc Chromium check saved/read a real journal, aborted a real transaction from its request-success listener, observed `loadGame` reject rather than restore it, then read the original committed journal successfully. Evidence: `native-save.log`.

## Gaps and process caveats

- **Physical hidden-tab/window restoration: BLOCKED in this environment, not a reproduced application failure.** Headed Chromium tab switching and native-window minimization both left `document.visibilityState` at `visible`. The assertions failed before exercising the application's hidden branch (`visibility.log`, `visibility-minimize.log`). The successful synthetic handler check does not replace a real OS/browser background/restore test. Missing coverage is physical hidden/restore and state changes while actually hidden at `src/scene/RestaurantScene.tsx:28` / `src/scene/RestaurantScene.tsx:65`; no failing user scenario was demonstrated, so this is not reported as a code defect.
- This was a selected browser matrix, not the whole E2E suite. The full inherited WebKit/policy matrix, physical iOS, audible pronunciation/quality, production offline reinstall and prolonged lifecycle stress were not rerun. No pronunciation approval follows from silent tests.
- The first build attempt requested an external output directory; it failed because the existing offline plugin reads `dist` directly. Repeating with the repository's normal output directory passed, with existing non-fatal Zod annotation warnings. That first stock config load briefly used the shared dependency directory's `.vite-temp` loader; its generated file was automatically removed and the directory was empty on inspection. This initial loader use did not meet the requested no-shared-temporary-cache constraint. Subsequent config loads/cache paths were isolated; no dependency package contents were edited.
- The **fast-reload journal race is not fixed or accepted here**. Ticket0037's App owner is handling ticket0042. The excluded immediate-reload case remains outside this review; the passing autosave test waits for persistence and does not prove immediate-reload safety.

**Acceptance:** integrate the four exact reviewed changes if their stated scope is acceptable; retain the explicit physical-visibility and external App-race limitations. Findings requiring writer fixes: **none**. Standards findings: **0**. In-scope behavior/spec findings: **0**.
