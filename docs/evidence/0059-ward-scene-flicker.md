# Ticket 0059 evidence and decisions

Append-only trail. Base: 66ac123; owner: cloud Codex; isolated checkout `/workspace/junyan-0059`; branch `codex/0059-ward-scene-flicker`; strict ports 5402/5403.

## Investigation started

Read AGENTS, ticket workflow, ticket, accepted decisions 0001/0002/0004, build recommendation and design system. No bundled pstack found in repository listing; applying requested harness-adapted bug-fix discipline. Hypotheses: depth precision, clipping, or ambient motion painted over foreground. No cause claimed before temporal capture.

## Reproduction and fix boundary

Live game captured silently in Chromium at step 6 (`ask-milk`), 1440×1000 and 390×844, normal/reduced motion. Videos/screenshots and explicit-time samples saved under `output/playwright/0059/before/`. All four captures reported no console/page errors. Reduced-motion live rendering freezes; explicit-time proof intentionally exercises production scene drawing independently of the preference.

At t=0 versus t=.4, pixels (269,100) through (269,108) turn curtain green [176,202,188] over the seated player’s hair/face. SWAY toggles at sin(time×1.7)>.2. Plot was unconditionally overwriting pixels after shadeEdges. Figures have no idle movement here, eliminating motion geometry/clipping and Float32 depth instability as the cause. New regression failed before fix at ask-milk t=.2.

Data shape: projected pixel {sx,sy,d}; existing depth `zb[index]` holds the nearest surface. Considered moving ambient drawing before figures (would complicate bake/shading ordering), deleting the strip (would remove the feature), and depth-testing the shared ward plot boundary. Chose the latter: bounds-check, reject behind nearest surface, update depth and colour. Shared renderer unchanged; only ward-local plot changes.

Tool note: pnpm installed the frozen lock but returned ERR_PNPM_IGNORED_BUILDS for esbuild. Subsequent commands use pnpm_config_verify_deps_before_run=false; installed Vite works. Playwright browser download denied at cdn.playwright.dev; use existing /usr/bin/chromium and /usr/bin/ffmpeg. No dependency/lockfile changes.

## Raster surface verification

The first strict depth comparison fixed the face but hid the monitor blip and IV drop; the existing supplied-time animation test caught this (changed pixels=0). Measured depth differences at projected/rounded samples: IV drop .0038, monitor .0454; curtain behind player 1.6540. Point projection rounds while furniture box rasterization floors/samples, so surface points need a one-pixel depth allowance. Added .08 scene-depth units (under 1.5 world-scale pixels) at the plot boundary. This preserves surface accents while retaining foreground occlusion by a much larger depth margin. The strict variant's after captures are superseded by final after captures.

## Final implementation checkpoint

Surface accents test depth only and leave geometry depth unchanged. Writing the allowance into baked depth caused later monitor highlights to reject against the waveform itself; removing that write preserves the original surface while retaining occlusion checks. Final `pnpm test`: 11 files, 170 tests passed. Final `pnpm build`: passed (existing Zod Rollup annotation warnings only).

Silent Playwright journey passed desktop and phone (2/2), using temporary local config to select system Chromium; ports 5402 and 5403 with strictPort in the repository config. It played the complete opening, wrong item/correct deliveries, four restaurant customers, change, journal, and day-two progression. Both journeys assert clean console. No independent reviewer or human approval has occurred; root review of the final exact patch remains required before merge.
