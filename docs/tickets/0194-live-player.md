---
id: 194
title: Land the redesigned player (character study pass three) in the live game
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

Callum approved pass three of the character study ([[tickets/0193-character-study]]): "Yes, swap it in". The live `char/player` was still the rig's waiter, and the hospital opening showed the old face on `char/patient`.

## Done when

- [x] `char/player` is the pass-three figure under the same ids, so the game picks it up with no other code changes: idle, walk, carry-idle and carry-walk in all four facings.
- [x] The tray dishes (`food/tray-*`, ticket 0161) have the carry actions' frame count and fps and ride the same bob; they sit on the board in every carry frame and facing.
- [x] `char/patient` wears the new head, hair and face (no pencil) on the rig's pyjama and in-bed body; `lie`, `lie-awake`, `sit-bed`, `idle` and `walk` all still draw.
- [x] The old player art is gone; nothing references it.
- [x] Unit tests, tsc, build, and the pixel and journey e2e specs pass headless and muted; screenshots looked at.

## Notes

- Owner: Claude Code (subagent, ticket 0194). Branch `claude/0194-live-player`, worktree `.claude/worktrees/agent-ae7e82c06f8bd1a77`, ports 5233 (dev) and 5234 (preview). No helper agents.
- Ownership: agreed with the graphics session, which stayed out of `src/pixel/sprites/char/` and `food/carried.ts` while this ran.

### What changed

- `src/pixel/sprites/char/`
  - `_hero-poses.ts` (new): the player's types, the pass-two hand-keyed walk and idle mapped onto the cast's proportions (pass three's `_hero-anim.ts` + `_hero3-anim.ts`), the action table `HERO_ACTIONS` and `carryBob`.
  - `_hero-body.ts` (new): the joint-puppet body (pass three's `_hero3.ts`), plus the carry pose: arms fixed to the rig's tray from `_tray.ts`, drawn at its usual place so `TRAY_SLOTS` still fits.
  - `_hero-head.ts` (new): the head (pass three's `_hero3-head.ts`) with `pencil: false` for the patient.
  - `player.ts`: rewritten to build `char/player/<action>-<dir>` from `HERO_ACTIONS`; the doc comment keeps who he is.
  - `patient.ts`: the rig body in pyjamas with its head, hair and face turned off; the new head is drawn over it before the outline, foreshortened by `LIE_DROP` when lying. Lying asleep the eyes are closed lines; `lie-awake` uses the puzzled face; the gauze moved to the new temple.
  - `_core.ts`: one additive export, `paint` (`render` without the outline); `render` now calls it. No existing export changed.
  - `player.test.ts` (new): actions and facings, the walk's eight poses and lag, heel strike and bent elbows, cast proportions, the tray on the dishes' rows with matching frames and fps, no hair gaps, every player and patient frame deterministic and grounded.
- `src/pixel/sprites/food/carried.ts`: frames, fps and bob come from `carryBob`/`HERO_ACTIONS` instead of the rig's `ACTIONS`.
- `docs/design/pixel-art.md`: one paragraph under Characters saying the player is ahead of the rig's frame table.
- Not brought over: the study page, the A/B variants, pass one and two figures, portraits, the close-up, the run, the emotes and the palette proposal. They stay on `claude/0193-character-study`.

### Actions, old → new

| Action | Old frames @ fps | New frames @ fps |
| --- | --- | --- |
| `idle` | 4 @ 2 | 8 @ 5 (breath, blink on frame 6) |
| `walk` | 4 @ 7 | 8 @ 10 |
| `carry-idle` | 2 @ 2 | 8 @ 5 |
| `carry-walk` | 4 @ 7 | 8 @ 10 |
| patient `idle`, `walk`, `lie`, `lie-awake`, `sit-bed` | unchanged (rig) | unchanged (rig), new head |

In the café and outdoors the walk is driven by distance (`WALK_TILES_PER_FRAME` 0.375 in the engine, the walk speed 3.2 tiles/s), so it plays at about 8.5 fps there, a cycle in about 0.94 s, against the designed 0.8 s.

### Checks

- `pnpm test`: 145 files, 947 tests passed (with the new `player.test.ts`). No flaky reruns needed.
- `npx tsc -b --noEmit`: clean. `pnpm build`: built (the usual chunk-size and zod comment warnings, unchanged).
- Playwright, headless with `--mute-audio` (the config's launch args), `JUNYAN_DEV_PORT=5233 JUNYAN_PREVIEW_PORT=5234`: `pixel-cafe`, `pixel-ward`, `waiter` (the journey: wake in the ward, collect, deliver, give change, journal), `world-journey`, `pixel-town`, `pixel-courtyard` on desktop and phone: 20 passed, 4 skipped (the town and courtyard specs skip the cross-project sizes by design), 0 failed, 13.7 min.
- An extra headless, muted script at 1280×800 and 390×844 (media muted, AudioContext suspended): idle and mid-walk in all four facings in the café; console clean.
- Renders and screenshots in `output/live-player/` (not committed), all looked at: `before-after-player.png` (main vs this branch, every facing), `after-player-sheet.png`, `after-carry-walk.png`, `tray-dishes-every-frame.png` (three dishes on every carry frame and facing), `after-patient-sheet.png`, `patient-faces-8x.png`, `cafe-player-facings.png`, `ward-patient-lying.png` and `-sitting.png` (through the game's compositor with `wardStage`), `game-ward-waking-{desktop,phone}.png`, `game-cafe-carrying-{desktop,phone}.png`, `game-cafe-walk-*-{desktop,phone}.png`, `game-town-{desktop,phone}.png`.
- `node src/pixel/tools/render-scene.ts ward` renders only the scene's furniture (the beds and people come from `wardStage` at run time), so the ward check used `wardStage` and the e2e screenshots instead.
- Not verified: motion in play judged from frames and stills, not watched live; the standing patient is never shown by the game.

### What was learned

- The pass-three figure is not a rig character, but its tray is: drawing the rig's `TRAY` parts through `paint` at the body's bob kept the board exactly where `TRAY_SLOTS` expects it, so the dish placement did not change.
- A rig character can wear a non-rig head if the outline is deferred: paint the body, draw the head, paint the head-group extras (gauze), then outline once. That needed only an additive `paint` export.
- Lying heads foreshorten by dropping frame rows; doing the same to a Px-drawn head (draw to a scratch canvas, copy rows skipping `LIE_DROP`) keeps the face on the pillow at the same place as before.
- The walk's cadence in play comes from the engine's distance stepping, not the sprite's fps: an 8-frame cycle at the current constant takes about 0.94 s at the player's speed, and the four-frame cast now steps twice as often as the player.

### Follow-ups (not done here)

- The rest of the cast is still on the four-frame rig walk; the player now visibly steps at a different cadence. Either re-key the cast or tune `WALK_TILES_PER_FRAME` (engine, graphics session) to about 0.32 for the player's 10 fps.
- `ACTIONS["carry-idle"|"carry-walk"]` in `_rig.ts` no longer drive any sprite; left in place because removing exports was out of scope.
- Expressions exist in the head but no game action uses them yet (dialogue face swaps, emotes, portraits: see 0193's landing notes).
- The standing patient (`idle`, `walk`) has the new big head on the rig's narrower pyjama body; the game never shows him standing today.
