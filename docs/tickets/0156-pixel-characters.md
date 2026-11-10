---
id: 156
title: Draw the waiter and the regulars
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

People carry the game's warmth; they must be expressive and recognisable at 32×64 (doubled from 16×32 on 2026-11-09).

## Done when

- A shared body rig with walk, idle and sit in four directions, the waiter with tray poses, and the four regulars with distinct silhouettes, per the style bible.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0156-pixel-characters`; worktree `/Users/callumhemsley/Personal/junyan-px-characters`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
- Round 1 (2026-11-10), awaiting art-director feedback:
  - Rig in `src/pixel/sprites/char/`: `_core.ts` (parts, slot palette, compositor, `sym`/`darken`/`mirror`), `_body.ts` (front/back head, torso, arms, legs, seated legs), `_side.ts` (profile arms and legs), `_rig.ts` (frame tables, beats, `defineCharacter`), `_tray.ts`. Characters: `player.ts`, `lin-jie.ts`, `zhang-laoshi.ts`, `xiao-li.ts`, `xiao-zhou.ts`, `cook.ts`; floor props in `props.ts` (`char/lin-jie/bag`, `char/xiao-zhou/backpack`).
  - Frames: idle 4 at 2 fps (rest, breath, rest, habit; blinks ride the breath), walk 4 (7 fps; 张老师 5, 林姐 6, 小李 8), sit 4 at 2 fps with a habit frame, carry-idle 2, carry-walk 4. Cook: `idle-down`, `work-down` (4 each).
  - Seating: sit frames put the hips about 21px above the seat anchor; place the sitter at the seat anchor + (0,-4) (chairs per `furn/chairs.ts`) and draw them after the seat. `compose.ts` sorts by anchor y only, so it draws a stool over its sitter; review composes used a scratch copy with a sort bias.
  - Learned: at 32×64 a profile arm only reads if it hangs at the back half so the ink outline defines it; front views drawn as a mirrored half plus sun-side `darken` keep the light consistent; the back-view head must narrow to the neck below the ears or it reads as a bald band.
  - Known weak: profile hair silhouettes are close to one another (the bun and ponytail carry identity there); front walk is subtle (feet and hands only move 1–2px); 林姐's seated skirt from the front and 小周's wave read better than the seated profile poses.
