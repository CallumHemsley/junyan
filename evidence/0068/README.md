# Cats verification evidence

This is a code-review checkpoint, not release completion. Genuine cats speech, offline audio decode/listening and shared foundation navigation/save/migration/gift/offline checks remain blocked. `missing-audio.json` lists absent authored clips. The harness records playback callback IDs. It does not synthesize or play placeholder speech.

Source review checkpoint is `ee97089`. The first independent reviewer reproduced three repeat action/scene defects at `99df4df`. Rain giving-space now retreats and records comprehension evidence. Selected-cat detours suppress actions for the other cat. A completed route retains window companionship for its completion day and through reload. Fresh independent review covers the fixes.

The final-base pre-fix suite passed 195 rules and 12 browser checks. The changed feature suite then passed 28 rules/content/pose checks and a production build. See `final-rule-checks.log`, `final-browser-checks.log`, `review-fix-checks.log` and `review-fix-build.log`. Missing or pending checks are not passes.

Run in the managed Linux checkout with the existing cloud toolchain and system Chromium. The evidence config changes no project config and reserves strict ports 5468/5568 without server reuse.

```bash
export PATH=/workspace/.junyan-tools/node_modules/.bin:$PATH
export PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers
export JUNYAN_DEV_PORT=5468
export JUNYAN_PREVIEW_PORT=5568
pnpm exec vitest run src/features/cats
pnpm build
pnpm exec playwright test --config evidence/0068/playwright.config.ts e2e/cats.spec.ts e2e/waiter.spec.ts
```

`desktop-*` and `phone-*` PNG files capture real DOM/canvas rendering, including the initial clue, black-cat friendship, emerged white cat, reunion and rain shelter. Captures use reduced motion to inspect final poses. A separate browser test instruments actual canvas paints and verifies normal animation, hidden-tab suspension and reduced-motion rest. New review-fix browser captures include rain retreat and window companionship when those tests run.

The feature-only save test serializes the actual payload into the dev harness URL and restores through `validate`. It does not prove production IndexedDB persistence or backward-compatible shared migration. The harness has no production imports and is guarded by dev mode plus `?test=1`.

`decisions.tsv` is append-only. Its first design row was authored by the lead at 19:01:48Z. The sole writer run starts at 19:18:10Z. No transcript path was supplied for automatic trail auditing; evidence was checked against actual tool outputs and files. The independent reviewer is supplied the same updated human completion policy. No unavailable cross-model workflow or local-device execution is claimed.

The next review round found a semantic alias mismatch at `0e07106`. Preserve that historical verdict in `review-0e07106.md` exactly as supplied, with probe logs/spec and selected failing images in `review-0e07106/`. The scene fix recognizes selected door/window as the white companion only when the white cat is at that location. Direct white remains valid. Black and unrelated landmark detours retain their own poses. No reducer or save shape changed.

This fix passed 32 focused tests, production build and 10 desktop/phone cats browser checks. See `alias-fix-checks.log`, `alias-fix-build.log` and `alias-fix-browser.log`. The browser regression compares actual canvas pixels after serialized reload for a window-target late invitation and both familiar rain targets. Alias captures ending `*-alias-reload.png` were inspected. Independent material-fix re-review is pending. The unrelated waiter suite was not repeated for this scene-only fix; its independent 14-check run at the previous source remains historical evidence.

The reviewer had regenerated five phone images at a different viewport rasterization without changing source. The writer's final run used the committed evidence config consistently and regenerated the original baseline image sizes/content, leaving those five tracked PNGs unchanged. Newly retained rain-space/window-friend captures come from the authored detour test run, and new alias-reload captures show this fix. Rasterization is evidence provenance, not an application behavior change. Audio and shared integration remain release blockers.
