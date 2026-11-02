# 0039 — Independent renderer review

**Verdict: ISSUES.** One reproduced scheduling defect. No product edits or art-redesign recommendations. The parent received the finding early and owns the scheduling fix and its independent browser regression; that later fix is not reviewed here.

## Exact scope

- Reviewed checkout: `21a4faaa8887dc8091f8d34ee70ad462ea472096`.
- Product baseline: `5dfad159c8d3544efccdbaf6500b54f4d3562062`. `git diff 5dfad15 -- src vendor public/audio` is empty. This is a baseline audit, not a claim that ticket 0039 introduced a regression.
- Accepted elder comparison: `eeeb18dd79554d10e7506ab01148ded7cebf639f`.
- Date: 2026-11-02. Owner: independent Codex review sub-agent, branch `t3/0039-render-review`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-3282c862`.
- Read AGENTS, ticket conventions, build recommendation, accepted decisions 0001–0003, Morning Steam mock-up/layout guidance, design tokens/system and accepted character direction. Decision 0003 supersedes the older illustrated-counter restriction. Applied pstack `principle-prove-it-works`, `principle-experience-first`, and `principle-test-behavior-not-implementation` from the requested 0.15.32 installation.

## Finding 1 — Stop drawing a static, offscreen scene

**Priority: P2.** `src/scene/RestaurantScene.tsx:24` through the unconditional reschedule at `src/scene/RestaurantScene.tsx:38`.

The effect always requests another animation frame. Reduced motion freezes renderer inputs but does not stop rasterization. Scrolling the entire scene outside the viewport also leaves the same loop running. Each eligible frame still copies buffers, rasterizes the figures, applies shadows/edges and uploads the image at `src/scene/renderer.js:415`.

**Reproduction:** open dev `http://127.0.0.1:5232/?test=1&seed=42` with reduced motion, click 开门迎客, then observe the canvas's actual `putImageData` calls. To reproduce the loaded case, dispatch move `(3,5.5)`, interact table 1, move `(6,1)`, pick up `content.foods[0].id` six times, and move `(6,6)`. Assert the tray length really is six. Append a temporary 3000px spacer and scroll to 1600px so the canvas is fully above the viewport. Sample for 1600ms. No production module is patched for this probe.

**Evidence:** `output/playwright/0039/runtime.json` and its runnable `runtime.mjs` contain the final six-food measurements. Chromium desktop recorded 33 actual canvas uploads in 1608.3ms, with canvas bottom at −851.0px. Chromium 390px recorded 37 in 1606.3ms, canvas bottom −1203.9px. WebKit 390px recorded 34 in 1606ms at the same offscreen position. Start/end canvas pixels were exactly equal in all three reduced-motion samples. Visible static scenes also kept redrawing. The earlier empty-tray probe is retained separately as `runtime-empty.json`.

The corresponding total page RAF callback durations were 34.3ms, 37.4ms and 36ms. These are coarse browser-clock measurements of **all page RAF callbacks**, including App's loop, not a renderer-only CPU benchmark or a physical-phone battery measurement. The defect is the proven repeated work with no possible visible benefit, not an asserted frame-budget failure.

**Impact:** a player who scrolls away from the restaurant, or requests still imagery, keeps paying for pointless raster work. This is unnecessary foreground CPU/battery work even though the scene looks correctly frozen.

**Missing behavior test:** `src/scene/renderer.visual.pw.ts:39` only compares canvas data before/after 45 frames. It passes while the identical picture is redrawn. Add a browser regression that observes real scene uploads: after settling, an unchanged reduced-motion scene and a fully offscreen scene must stop drawing; state changes, re-entry and media-preference changes must repaint/resume correctly. Keep the existing visual-freeze check. Preserve cancellation on unmount, which currently works.

**Smallest correction:** gate scheduling on whether animation or a dirty state needs a visible redraw, observe scene/document visibility, and wake on state or preference changes. Do not change Pixel Plays, character geometry, audio or game rules. Parent owns this correction, not this review.

## Direct verification results

- `pnpm test`: **88/88 passed**, six files; includes 13 renderer tests. `pnpm build`: **passed**. Vite printed two dependency annotation warnings from Zod; these were not product errors.
- Muted Chromium: existing `e2e/waiter.spec.ts` and `src/scene/renderer.visual.pw.ts` ran on desktop 1440×1000 and phone 390×844: **8/8 passed**. The journey serves all four customers, gives change, looks up a word, opens the journal, and advances a day. Walking and save/reload checks also pass.
- WebKit 390×844: an ignored, otherwise unchanged copy of the existing waiter suite with a `beforeEach` audio route calling repository `silentResponse`: **3/3 passed**. This uses valid RIFF/PCM bodies with silent sample data, not invalid blank WAV responses. No native audio was allowed through in WebKit.
- Production preview on strict port 5233: scene mounts in Chromium desktop/phone and WebKit phone; `window.__TEST__` is absent, no horizontal overflow and no captured console/page errors. Dev runs use strict port 5232. No production deployment was performed.
- Reduced motion: final loaded-scene pixels remain byte-identical over the sample window in both engines; switching to normal motion produces different pixels. This proves the visible freeze, not scheduling efficiency.
- Real isolated `RestaurantScene` mount/unmount: 13 uploads during a mounted 600ms window, **zero** during the 600ms after React unmount. Source cleanup cancels its pending RAF. Reproduction/evidence: `output/playwright/0039/lifecycle.mjs` and `lifecycle.json`.

## Pixel Plays and accepted cast

The production renderer is the actual adapted Pixel Plays software rasterizer, not a replacement made to resemble it. Direct local function-body comparisons to `vendor/pixel-plays/engine.js` are exact for `project`, `unproject`, `rampOf`, `sphere`, `capsule`, `castShadow`, `applyShadows` and `shadeEdges`. The adapted `box` keeps the same rasterization and adds local rig transforms/rear surfaces. Depth buffers, Bayer dithering, hue-shifted ramps, shadows and edge shading execute in the inspected production frames. The MIT notice remains. Evidence: `output/playwright/0039/engine-preservation.json`; relevant production raster code begins at `src/scene/renderer.js:161`.

Reran the repository's evidence generator rather than trusting earlier screenshots:

```sh
node src/scene/render-character-evidence.mjs output/playwright/0039/cast eeeb18d
```

It generated **200 paired cast portraits** (five characters × eight yaws × five poses), eight paired empty-tray views and a silent turntable. Personally inspected the newly generated native-size standing, seated, served, walk-a, walk-b and empty-tray sheets, plus the enlarged head sheet. The generator exposes an isolated portrait entry only in ignored renderer copies; production raster functions and character geometry are used, not substitute illustrations.

- Waiter: front/side/rear carrying silhouettes, attached supporting hands, six-item tray and depth occlusion remain coherent. The empty tray remains distinguishable where physically visible. Walking samples differ without detached limbs.
- 林姐, 小李, 张老师 and 小周: inspected all eight directions in standing, seated and served/eating poses. Hair, broad clothing masses and accessories distinguish the cast. No new geometry or visible occlusion defect was established.
- Actual whole-scene rendering was also exercised through public `createRenderer().draw` with all four customers in each real phase (`seated`, `ordered`, `checkout`, `served`), plus a six-food waiter. Inspected the freshly rendered native-size `scene-phases.png`; eating arm/food changes are visible. Those all-customer phase states are deliberate renderer fixtures, not a claim that every phase combination occurs in normal play. Normal phase transitions are covered by the real journeys above.
- **ZhangLaoshi remains exactly unchanged:** 40 geometry comparisons and full isolated 360×280 RGBA comparisons to accepted `eeeb18d` all pass. His entire content character record is also byte-for-byte JSON-equivalent. No elder redesign is proposed. Generated proof is `cast/elder-proof.json`.
- Phone: inspected actual 390×844 Chromium and WebKit empty/full-tray screens, not only enlarged portraits. Canvas displayed at 364×283.109px from a 360×280 native image; pixelated rendering is retained. The four regulars, carried food and restaurant layout remain readable at that scale; fine eyes are deliberately tiny, not evidence for a redesign. All five scene targets measured at least 44×44px. No horizontal overflow or broken DOM Mandarin labels was observed.

## Evidence and rerun map

All following paths are local ignored artifacts in the review worktree, **not committed product changes**. Their generators remain there for immediate reruns. The committed report records the finding independently of their retention.

- `output/playwright/0039/runtime.mjs`, `runtime.json`, `runtime-empty.json`: real browser probes, final asserted six-food state, pixel freeze, offscreen counts, dimensions, console results and preview checks. Run with `node --experimental-strip-types output/playwright/0039/runtime.mjs` while the two strict servers are running.
- `output/playwright/0039/playwright.config.ts`, `journey.json`, `journey.log`: Chromium rerun config and results. `pnpm exec playwright test --config output/playwright/0039/playwright.config.ts`.
- `output/playwright/0039/webkit.config.ts`, `silent-waiter.pw.ts`, `webkit-journey.json`, `webkit-journey.log`: WebKit silent-PCM journey. Same command with `webkit.config.ts`.
- `output/playwright/0039/desktop-loaded.png`, `phone-loaded.png`, `webkit-phone-loaded.png`: inspected real runtime screens with six-item trays.
- `output/playwright/0039/scene-phases.mjs`, `scene-phases.png`: direct production-renderer scene-phase gallery.
- `output/playwright/0039/cast/`: freshly generated before/after native sheets, enlarged heads, per-angle images, exact elder hashes and `all-five-silent-turntable.mp4` (ffprobe confirms no audio stream).

Environment: local arm64 macOS; Node 22.23.4, Vite 7.3.7, Vitest 3.2.7, Playwright 1.64.1. Reused the already-installed project dependency directory via a temporary worktree symlink; no install or dependency/lockfile edits. All Chromium launches explicitly included `--mute-audio`; no system-volume change. The shared preview tab was closed before gameplay because it does not expose the required launch flag. Browser inspection used explicit muted local Chromium instead.

## Limits and handoff

This is not physical iPhone/Safari QA, a sustained battery/thermal benchmark, hidden-tab OS-throttling certification, or proof of a renderer memory leak. No such claims are made. Runtime duration samples are short and concurrent work on the host can affect timings. The directly reproduced offscreen draw counts do not depend on an assumed CPU threshold. The adapter's unmount cleanup was tested separately from offscreen scheduling.

No additional proven defects were found. Review completion is **done**, but product verdict remains **ISSUES at the exact baseline** until the parent scheduling change is independently verified. Only this report and ticket 0039 are committed. No product, dependencies, WAVs, models, AWS, deployment or system-volume changes; no children or pushes. Both owned Vite processes and launched browsers are cleaned up after verification.
