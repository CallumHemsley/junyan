---
id: 180
title: Grade the pixel engine's colour and light toward Eastward
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

Callum loves Eastward's colours ([[tickets/0179-art-direction-references]], style bible "References"). The engine's light was a flat multiply: evening went sepia, night went grey-lavender, shadows darkened toward black-plum, and lamps at night turned the world white instead of pooling warm. Push the look toward saturated warm light against cool coloured shadows and a distinct mood per day phase, without touching the palette or the art.

## Done when

- [x] Colour grading per day phase: split-toning by luminance (shade toward teal or plum, highlights toward gold), a saturation lift in the mids, an S-curve and a highlight glow, all per phase in one table (`GRADES` in `src/pixel/engine/grade.ts`). Applied through a precomputed 5-bit-per-channel offset table in the final pass only.
- [x] Ambient darkens toward a coloured floor per phase, not black; contact shadows take phase colours and lengths (long violet ones east at evening, blue at night).
- [x] Small glows (lamp glass, windows) get a stepped additive halo at evening and night; shafts are unchanged.
- [x] Night: deep blue world; light washes out the ambient tint before adding its own colour, so lamps and windows pool warm.
- [x] Off switch: `createSceneRenderer(..., { grade: false })`, tools flag `render-scene --no-grade`. On by default in the game and the tools. Off is byte-identical to the ungraded renderer (the existing pinned frame hash is unchanged with `grade: false`, and the twelve before renders match `--no-grade` renders byte for byte).
- [x] Deterministic, static under reduced motion (nothing new animates), identical tables in Node and Chromium.
- [x] Tests: `src/pixel/engine/grade.test.ts`. Existing engine tests stay green; they now pin `grade: false`.
- [x] Before/after renders and contact sheets in `output/pixel/0180/` (local, not committed).

## Notes

- Owner: Claude (worker in the overnight session). Branch `claude/0180-eastward-colour-light`, worktree `/Users/callumhemsley/Personal/junyan-px-0180`, Playwright ports 5220/5221.
- **Design.** Light stage (in `light.ts`, only with grading): the per-phase ambient `c·k + floor·(1 − c/255)`; in lit pixels `w = min(1, 0.6 · Σlight)` pulls the ambient toward its own grey before the light's colour is added; the grade's glow gain replaces `GLOW_GAIN`; halos for glows up to 4 tiles in radius (radius 0.4 of the glow, 0.5–1.4 tiles, additive 0.45 × strength × phase halo). Final pass (in `grade.ts`): for each 5-bit cell centre, saturation `1 + s·4t(1−t)`, contrast and highlight glow on luma, luma-free shade tint weighted linearly below the pivot and highlight tint weighted quadratically above it. The table stores signed per-channel offsets, so a pixel keeps its own full precision (no posterising). Applying it is integer-only, with a 4096-entry direct-mapped cache per frame (pixel art has a few thousand distinct colours a frame), about 0.5 ms for the cafe at 704×448.
- **Vermilion guard.** The table build measures every cell (centre and eight corners) against both accent tones (`#b5462b`, `#dd6f4f`) in CIELAB and scales back any offset that would bring a colour closer than min(its current ΔE, 20). CIELAB is computed with Newton roots and tables, arithmetic only, so every engine builds the same bytes. The test checks it with an independent ΔE over the palette and the whole RGB cube. Whole scenes, pixels within ΔE 10 of vermilion, ungraded → graded: cafe 231/239/741/0 → 232/0/473/0 (morning, midday, evening, night), ward 89/6/140/0 → 89/0/89/0, town 24/0/176/0 → 24/0/87/0. The one extra cafe-morning pixel and 31 town-night pixels at ΔE 10–15 (window light on rosewood) come from the warmer *light*, upstream of the guarded table.
- **Cost.** Renderer frame-time test (1280×800, morning), run alone: 3.3 ms before, 4.7–5.2 ms after. Inside the full parallel suite on a loaded machine (load average 17–35, other workers running) it measured 11–12 ms, and one run of four went over the 16 ms bound; on an idle machine it has headroom. Table build is ~20 ms per phase, once, on first use.
- **Verification.** `pnpm exec tsc -b` clean; `pnpm exec vitest run` 878/878; headless, muted Playwright `pixel-cafe`, `pixel-ward`, `pixel-town`, `waiter` on ports 5220/5221: 18 passed, 2 skipped (the town spec's cross-project skips). A throwaway spec built the four tables in Chromium and matched the Node pins.
- **What was learned.** A uniform multiply cannot do Eastward: the mood comes from shade and light being *different hues*, so the ambient needs a coloured floor and the lit pixels need to escape the ambient's tint (a plain multiply turned a gold lamp at night white). Squared shade weights barely reached the low mids, so warm greys stayed neutral; linear weights fix that without muddying. Morning and midday stay deliberately close to the art; evening and night carry the change. Redmean distance was too loose a vermilion guard (it let `blush` slide from ΔE 17 to 13); CIELAB with whole-cell checks holds.
- **Open taste calls for Callum.** Evening's out-of-bounds void reads strong plum; the town lamp's pool shows its stepped rings more at night; midday is subtle by design. All are one-line changes in `GRADES`.
- The night-market sprite session asked for a heads-up before this lands on main (the orchestrator relays it).
