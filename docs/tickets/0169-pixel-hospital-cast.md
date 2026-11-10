---
id: 169
title: Draw the hospital opening's cast
status: done
priority: high
type: feature
created: 2026-11-10
---

## Why

The opening's doctor, nurse, aunt, elder and the patient need sprites, including lying and sitting up in bed.

## Done when

- `char/doctor`, `char/nurse`, `char/aunt`, `char/elder`, `char/patient` with idle/walk, and `lie`/`sit-bed` for the elder and patient, per `docs/design/pixel-contracts.md`.
- `tsc -b` and pixel tests pass.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Owner: Claude Code (pixel worker). Branch `claude/0169-pixel-hospital-cast`, worktree `/Users/callumhemsley/Personal/junyan-px-0169`. No dev server or port used (Node sheet renders only).
- Done. Added `char/doctor`, `char/nurse`, `char/aunt` (idle, walk) and `char/elder`, `char/patient` (idle, walk, plus `lie`, `lie-awake`, `sit-bed`, facing down only). In-bed sprites are 32×64, anchor [16, 62], with no foot or shadow.
- Rig: the in-bed actions live in `char/_bed.ts`. `Action` gains `lie`, `lie-awake` and `sit-bed`, and an action can limit its directions (`dirs`). In bed, `partsFor` swaps in the `BED` body (`bedBody` overrides it), and `lie` foreshortens every head part by dropping four rows, mostly under the hair. `_pyjamas.ts` holds the shared striped pyjamas (a `striped` piece wrapper and the collar), and `_held.ts` moves carried things with the arm swing. Pixel hashes of every existing `char/` sprite are unchanged.
- Placement for the composer: put an in-bed figure's anchor at bed-local (24, 62), i.e. the bed's anchor one tile up, and sort it just behind the blanket. The lying face then rests on the flat pillow and the sitting head rests against the raised pillow.
- Learned: with the blanket drawn in front from y 34, `lie` has only about four rows of chest visible, so the hands rest at the blanket edge rather than lying on it. 老爷爷's radio sits on the pillow when he lies, because on his chest the blanket hid it. Hair textures built from a regular curl tile read as a checkerboard until the tile is 4×4 and staggered.
