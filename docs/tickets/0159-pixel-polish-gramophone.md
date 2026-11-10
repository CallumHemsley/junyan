---
id: 159
title: Give the gramophone a real horn
status: done
priority: medium
type: feature
created: 2026-11-10
---

## Why

The gramophone horn reads as a flat disc. It should be the bell of a brass horn seen from three-quarter top-down: a flared throat, an inner shadow, a rim highlight.

## Done when

- `decor/gramophone` horn reads as a flared brass bell from above and in front, with a throat that joins the tonearm, at play zoom.
- Size and anchor unchanged, or the cafe placement adjusted to match; `tsc -b` and the pixel tests pass.

## Notes

- Part of the pixel-art polish pass after ticket 0157. Style rules in `docs/design/pixel-art.md`.
- 2026-11-10: owner Claude Code; branch `claude/0159-pixel-polish-gramophone`; worktree `/Users/callumhemsley/Personal/junyan-px-polish-gramo`; no dev server or port (offline renders only).
- 2026-11-10 done. The horn is now modelled, not painted: `hornPixels()` in `src/pixel/sprites/decor/bistro.ts` sweeps a flaring tube along a cubic spine from the tone arm's elbow, projects each surface sample with the room's oblique camera (screen y = base − up − 0.65·north), depth-tests it and shades it by the upper-left sun into `gold1`–`gold5`. Inside surfaces darken with depth into a `wood1`/`ink2` throat. A two-ring rolled lip, petal seams on the wide flare, a sleeve at the elbow, a lit edge down the neck, a dent in the bell's shaded flank and a verdigris spot (`jade3`/`jade4`) under the bell are layered on top. Size (40×62), anchor and cafe placement unchanged. `tsc -b` and `vitest run src/pixel` (56 tests) pass. Renders in `output/pixel/polish-0159/` (before-*.png and sheet/scene/scene-corner.png).
- Learned: a face-on ellipse with a centred dark hole always reads as a disc or a flower; what sells a horn is the outside of the cone showing on one side and the throat shadow set off-centre toward where the tube goes. Modelling the form and quantising to the ramp got the silhouette right in one pass; all the remaining work was pixel hygiene. Three things caused noise: seams where the radius is small (seven seams crowd into 2–3 px and dither); a 1 px lip that ran parallel to a seam and to the outside shadow edge, making `232323` stripes (fixed with a 2 px lip and seams that stop short of it); and depth flicker where the inside wall is seen edge-on (fixed by settling lone pixels). If more round brass or ceramic pieces need this, the sweep-and-shade routine would be worth promoting to a kit helper.
