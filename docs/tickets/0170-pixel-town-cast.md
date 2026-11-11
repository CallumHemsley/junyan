---
id: 170
title: Draw the town's courier and birds
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The town's NPC hooks include a courier and birds that the pixel engine needs to draw.

## Done when

- `char/courier`, `critter/sparrow`, `critter/pigeon`, optional `critter/cat-tabby`, per `docs/design/pixel-contracts.md`.
- `tsc -b` and pixel tests pass.

## Notes

- Owner: Claude Code (pixel worker). Branch `claude/0170-pixel-town-cast`, worktree `/Users/callumhemsley/Personal/junyan-px-0170`, no dev server port (offline renders only).
- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Done 2026-11-10. Files: `src/pixel/sprites/char/courier.ts`, `src/pixel/sprites/critter/{_helpers,birds,cat-tabby}.ts`.
- `char/courier`: `idle`, `walk`, `carry-parcel-idle`, `carry-parcel-walk` in down/up/left/right. The carry poses reuse the rig's `carry-idle`/`carry-walk` frames, renamed on output, so the rig didn't need to change. The bag has its own left-profile art (it peeks out from behind him); everything else mirrors.
- `critter/sparrow`, `critter/pigeon`: `idle`, `peck`, `hop`, `fly` in down/right/left. `critter/cat-tabby`: `idle`, `walk`, `sleep` in down/right/left. `-left` is defined explicitly as the mirror of `-right` (anchor mirrored the way the engine does it), so ids resolve with no fallback warning. There is no `-up`: an actor facing up falls back to `idle-down`, with a warning.
- Canvases vary by action: hop and fly are taller, so the bird hangs above its shadow; the cat's `walk-down` is 16×26 while `walk-right` is 34×20. Every anchor is at the feet. No `foot`: critters are walk-through.
- Learned: a yellow dome with a brim reads as a construction hard hat. Side flaps over the ears plus a flipped-up tinted visor make it read as a scooter helmet. Pigeon wing bars drawn as short slanted dashes read as a face on the body; long horizontal bands read as wing bars. Concentric hoop stripes on a small haunch merge into a dark block; plain bars read better.
- `defineCritter` and `blob` in `critter/_helpers.ts` could be promoted if other critters arrive.
