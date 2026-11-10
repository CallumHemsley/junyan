---
id: 173
title: Play the hospital opening in the pixel ward
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The opening still renders the old ward scene.

## Done when

- `HospitalOpening` renders the pixel `ward` scene through `PixelView`, driven by `wardFrame`; DOM text and controls unchanged.
- Rules tests and the opening's Playwright journey pass; headless screenshots at phone and desktop.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- 2026-11-10: owner Claude Code (worker), branch `claude/0173-pixel-ward-integration`, worktree `/Users/callumhemsley/Personal/junyan-px-0173`, Vite dev port 5196 (preview 5197), both `strictPort`.
- Done 2026-11-10. What landed:
  - `src/pixel/scenes/ward.ts` (registered in `scenes/index.ts`): a 14×9 placeholder ward from the cafe's sprites (back wall with the window over the cabinet, linoleum from the kitchen tiles, front cap with the door at columns 10–11, a drawer table as the bedside cabinet). Its header documents the **marks contract**: `bed/player`, `bed/elder` (bed anchor, foot-end bottom-centre), `cabinet`, `food/milk|egg|bread` (food anchors on the cabinet top), `held`, `stand/doctor|nurse|aunt` (feet + facing), `door`, `view` (the rectangle the fixed camera keeps in view).
  - `src/world/pixel/ward.ts`: pure `wardStage(frame, has)` → actors and run-time props. Beds, blankets, in-bed people, visitors and foods are run-time, because they change with the story (flat ↔ raised beds). It asks for the contract ids (`ward/bed-<who>-flat|raised`, `ward/blanket-<who>-lying|sitting`, `char/<role>` with `lie-awake`/`lie`/`sit-bed`) and falls back per id to existing sprites (benches for beds, `cook`/`xiao-li`/`lin-jie`/`zhang-laoshi`/`xiao-zhou` as stand-ins, no blanket), so the real art is picked up on merge without code changes. In-bed offsets (`IN_BED_OFFSET`) follow the contract's bed geometry and were checked against mock sprites of the contract's sizes; they assume the head's centre sits near row 14 of the 32×64 frame, so tune them when the cast art lands. `wardZoom` picks the largest whole zoom that fits `view`.
  - `src/world/pixel/WardView.tsx`: thin wrapper over `PixelView` (fixed camera on the `view` centre, whole zoom, frozen clock under reduced motion). `HospitalOpening` renders it instead of `WardScene`; every DOM element, the focus effects and the wake veil are unchanged. `WardFrame` and its types now live in `src/opening-view.ts`.
  - CSS: the opening's world panel is a 6 : 5 box on desktop (zoom 2 from 528 CSS px wide at dpr 1) and keeps the old 3 : 2 on phones (zoom 3 at dpr 3, showing more of the room either side).
  - Tests: `src/world/pixel/ward.test.ts` (marks, framing, every scripted frame on registered sprites without actor fallbacks, contract-art staging and sort order, foods, zoom); `e2e/pixel-ward.spec.ts` (one canvas, whole zoom, pixelated, no text in the world panel, one zoom for the whole opening, clean console; screenshots at four moments).
- Learned: the opening's desktop panel is only ~552 CSS px wide at 1440×900 (dpr 1), so "fit the whole 14-tile room" means zoom 1 (tiny figures). Framing the story's rectangle (beds, cabinet, window, visitors: 8.25×6.875 tiles) instead keeps zoom 2 and crisp pixels; the rest of the room shows when there is space. A bare `Vec` mark is an array, and arrays have an `at` method, so `"at" in mark` cannot tell a `Mark` from a `Vec`.
- Dead code left in place (not deleted here): `src/scene/WardScene.tsx` is no longer imported. `src/scene/ward.js`/`ward.d.ts`, `ward-steps.js`/`.d.ts`, `ward.test.ts`, `record-ward*.mjs` and `render-ward-evidence.mjs` now serve only their own tests and tools (`src/opening-view.test.ts` still compares `wardFrame` with `WARD_STEPS`). A follow-up can delete them and move the step fixture next to `opening-view.test.ts`.
- Checks (2026-11-10): `pnpm exec tsc -b` clean; `pnpm exec vitest run` 129 files, 829 tests green; headless Playwright (muted) on ports 5196/5197, `pixel-ward`, `waiter`, `opening-start`, `opening-hooks`, `pixel-cafe`, `doctor-audio`, `startup-focus` and `scene-scheduling` on desktop and phone: 49 of 50 passed in one run. `startup-focus` "a queued database open without a checkpoint…" failed once on desktop. That test skips the opening, and it passed 3 of 3 when rerun alone, so it is a timing flake and not caused by this change.
