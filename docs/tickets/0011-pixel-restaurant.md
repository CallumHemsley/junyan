---
id: 11
title: Render the restaurant with Pixel Plays
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why
Make a charming overhead pixel restaurant using the upstream renderer.

## Done when
Restaurant scene renders player, tables, food, kitchen and ambient details; movement can be requested by click; Chinese remains DOM text.

## Notes
Reserved for Sol 6.1 medium scene worker. Port 5175.

Owner: Sol 6.1 medium scene worker. Branch: `t3/pixel-waiter-scene`.
Worktree: `/Users/callumhemsley/.t3/worktrees/junyan/t3-f2f9a8b5`. Port: `5175`.
Progress: adapting the vendored MIT rasterizer into a canvas-local factory.

Completed: actual Pixel Plays rasterizer adapted into a canvas-local factory with
retained MIT copyright/permission; warm tiled cutaway, kitchen, steamers, bowls,
windows, plants, cat, stools, four regular palettes, waiter apron/tray, ambient
steam, visual movement interpolation and reduced-motion support. All Chinese
labels are DOM buttons; input dispatches parent callbacks without game rules.

API: default `RestaurantScene({state,onMove,onTable,onKitchen})` and named
`projectPosition(position,z?)` returning percentage `{left,top}`. Logical world
coordinates remain those in `src/contracts.ts`. Local renderer also exposes the
inverse projection, tested across every integer floor coordinate.

Verification: `pnpm test` passed all 24 tests (21 rules, 3 scene). Isolated strict
TypeScript check passed for scene/component/tests. Temporary Playwright harness
on strict port 5175 passed all table/kitchen/ground callbacks, bounded movement,
keyboard activation, phone target sizes and non-overlap, and clean console under
React StrictMode. Desktop 1100×800 and phone 390×844 screenshots inspected at
`/tmp/junyan-scene-desktop.png` and `/tmp/junyan-scene-phone.png` (local artifacts,
not committed). Harness removed and server stopped.

Learned: sharing the orthographic projection between DOM targets and the software
rasterizer keeps controls aligned at both sizes. The kitchen label needs a higher
anchor than table labels to keep 44px phone controls from overlapping.

Limitations: whole-project `tsc --noEmit` currently fails in parent's App/content
integration (missing `./content` and resulting implicit-any errors); scene passes
in isolation. Full game Playwright journey awaits parent integration. This change
does not claim that journey or cross-review passed.
