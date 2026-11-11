---
id: 181
title: Roll strong highlights off toward white instead of clipping
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

Under strong glows the brightest highlights clipped to near-white: a character standing right under a lantern lost its face, and corners beside an oven went hot. The other Junyan session hit it on its night market, which boosts its own stall lights. Follow-up to [[tickets/0180-eastward-colour-light]].

## Done when

- [x] A soft highlight shoulder after lighting and inside the final grade: above about 85% values compress smoothly toward white instead of clipping. Faces and outlines keep their detail under lamps, and lamp glass and windows still glow.
- [x] Deterministic (arithmetic and square roots only; Chromium builds the same tables and curve as Node). `grade: false` is byte-identical. The frame-time budget holds. The vermilion guard is kept.
- [x] Test: a face-coloured ramp (skin1, skin2, blush, skin3, skin4, cream5) under a strong glow keeps distinct tones at evening and night, at lantern strengths 0.6, 1.2 and 1.8.
- [x] Before/after renders of the cafe and town at evening and night, plus a lit lamp with `char/player` under it, in `output/pixel/0181/` (local, not committed).

## Notes

- Owner: Claude (worker in the overnight session). Branch `claude/0181-highlight-shoulder`, worktree `/Users/callumhemsley/Personal/junyan-px-0180`, Playwright ports 5220/5221.
- **The curve** (`shoulder` in `src/pixel/engine/light.ts`): identity up to `SHOULDER_KNEE = 216`, then `K + R·x/√(1+x²)` with `R = 39` and `x = (v − K)/R`. It has slope 1 at the knee, never reaches 255, and maps 255 to about 244, close to the old graded TONE curve's 240, so unlit whites look as they did.
- **Per channel, then by ratio.** While a pixel's values stay within 0..255 (the art's own range, and the whole ambient-only path, where the curve is baked into the per-channel tables) each channel rolls off on its own. Past 255, light is over-exposing the pixel and a per-channel roll-off merges every bright tone into the same pale yellow. There the curve moves onto the brightest channel and scales all three together, keeping hue differences. A per-channel share (the "bleach") falls from 1 at 255 to `BLEACH_MIN = 0.5` at `255 + BLEACH_SPAN = 855`, so the hottest pixels still whiten.
- **Halos** are now summed into their own buffer and go through the shoulder with the rest of the light, instead of being added after it.
- **Final grade.** A highlight lift that would carry a channel past `LIFT_SOFT = 240` is rolled into the room left below 255 (`rollLift` in `grade.ts`). The roll-off fades in between 240 and 255, so it is smooth, and downward moves are untouched. The vermilion guard still runs last.
- **Results.** Face ramp, smallest distance between two tones (RGB): graded 18.5 / 13.1 / 12.6 at evening and 10.8 / 12.5 / 10.6 at night for strengths 0.6 / 1.2 / 1.8. At night-market strength (1.8, night) the ungraded light leaves 3.2. Stock scenes barely change, which is intended. The `--no-grade` renders are byte-identical to before. Whole-scene count of pixels within ΔE 10 of vermilion is unchanged or lower in every scene and phase.
- **Cost.** Renderer frame-time test run alone, interleaved with main under the same load: main 4.9–5.1 ms, this branch 5.4–5.6 ms. On a machine at load average 50+ the test exceeds 16 ms on main and on this branch alike.
- **Verification.** `pnpm exec tsc -b` clean; `pnpm exec vitest run` 880/880 (frame-time test 11.7 ms inside the full suite at load average 20–27). Headless, muted Playwright `pixel-cafe`, `pixel-ward`, `pixel-town`, `waiter`: 18 passed, 2 skipped. A throwaway spec built the four grade tables and 2000 points of the shoulder in Chromium, and both matched the Node hashes.
- **What was learned.** Neither extreme works. A pure per-channel roll-off keeps tones apart at moderate exposure (their low channels stay below the knee) but merges them once light is strong. A pure by-ratio roll-off keeps hue apart under strong light but compresses every channel at moderate exposure, and turns hot lamp glass gold instead of white. A per-channel share that shrinks as over-exposure grows gets both. The parameters came from a sweep against the face test. Lamp glass under a doubled stall light keeps less of its lattice than before: it reads as a hot cream glow rather than a white blob with bars.
