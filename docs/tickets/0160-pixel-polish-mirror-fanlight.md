---
id: 160
title: Make the bistro mirror and fanlight convincing
status: done
priority: medium
type: feature
created: 2026-11-10
---

## Why

The long mirror's reflection is a literal mini-picture of the room, which reads oddly. The fanlight's rays step unevenly.

## Done when

- `wall/mirror-long` reads as aged silvered glass: a soft, suggested reflection (light bands and a few dim shapes), foxing at the edges, a gilt frame.
- The fanlight rays in `wall/windows.ts` are evenly spaced and symmetric, with clean pixel stepping.
- Size and anchors unchanged; `tsc -b` and the pixel tests pass.

## Notes

- Part of the pixel-art polish pass after ticket 0157. Style rules in `docs/design/pixel-art.md`.
- 2026-11-10: owner Claude Code; branch `claude/0160-pixel-polish-mirror-fanlight` (from `claude/0149-pixel-art-foundation`); worktree `/Users/callumhemsley/Personal/junyan-px-polish-wall`; no Vite port (sprite renders only).
- 2026-11-10, done. `wall/mirror-long` is now a brightness field (calm plaster, a soft step for the reflected wainscot, a round-headed glazed door with a darker lower panel, a small warm lamp blur) quantised to `stone2`–`cream5`, with two steep diagonal light bands, a bevel, edge desilvering, a few foxing blots and a rebuilt gilt frame (lit top-left, `wood2` hairline bottom-right, inverted sight edge, rubbed hollows, corner rosettes and a small top shell). The fanlight is drawn as runs for the left half and mirrored about x 33|34: a 10×5 hub (`H`, its own shading), a 2px upright, steep bars in runs of 2 and shallow bars in runs of 5, each ending flush in a step of the arch. Sizes and anchors unchanged.
- Learned: checker dither on slow gradients reads as stitched seams, not glass; flat tone steps with dither kept to fast-changing shapes (the lamp) look cleaner. A soft-edged shape crossing two base tones comes out a different width on each, so a reflected shape needs a hard (±0.4) edge to keep its silhouette. Hash wear on 2×2 cells piles up into columns. A wear depth worked out per edge (interpolated along the edge) plus a corner bloom keeps every worn pixel attached to an edge. Wear that dims the local tone one ramp step, not a fixed dark colour, lets the reflection show through and reads as age, not dirt. For symmetric joinery, drawing half and mirroring it beats two Bresenham lines, which never mirror exactly.
- Renders: `output/pixel/polish-0160/` (before-*.png, mirror-r1…r10, after-wall.png, fanlight-after.png, sheet.png, scene.png).
