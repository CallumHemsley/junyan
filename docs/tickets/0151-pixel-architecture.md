---
id: 151
title: Draw the cafe architecture tiles: floors, walls, windows, doorway
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

The room shell sets the mood of every screenshot.

## Done when

- Floor, wall, wall-cap, window and doorway sprites per the style bible, seamless, with variants, reviewed in composition.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0151-pixel-architecture`; worktree `/Users/callumhemsley/Personal/junyan-px-tiles`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
- 2026-11-09, round 1 (32px, after the "nothing generic" direction change): redrew the whole shell at the new scale; the 16px pass survives only in git history.
  - Files: `src/pixel/sprites/tiles/` (`floor-wood.ts`, `floor-kitchen.ts`, `door.ts`, `_helpers.ts`), `src/pixel/sprites/wall/` (`back.ts`, `caps.ts`, `windows.ts`, `post.ts`, `_helpers.ts`).
  - Placement contract: tiles, wall slices and caps anchor at their top-left (`[0, 0]`) and sit on the 32px grid; wall slices go at (x, 0). Wall-mounted pieces (windows, vent, post) anchor at the wall's foot (y = 96), so they sort after the slices they hang on; with equal anchor y the engine must keep insertion order or sort wall decor after slices. `tile/mat` anchors at its front edge like any floor decal.
  - Seams: every floor variant shares seam rows and board lips; the worn path (`floor-wood-e`/`-f`) joins into a continuous lane when stacked; checked with `sheet.ts --tile`.
  - Review composes: `bash output/pixel/room.png.sh` and `bash output/pixel/room-b.png.sh` (generated full compose commands).
  - Learned: hash-placed texture repeats visibly once a sprite tiles (identical glaze clouds on every ceramic square read as an icon); stories work as hand-placed one-offs in a minority of variants. Auto-shading lattice bars from a mask (lit where glass is above or left) gives clean joinery cheaply.
  - Open: the cap profile's plaster core may still read too light/grey for "dark and quiet"; plaster trowel clusters can read as little clouds; laundry through window B is faint.
- 2026-11-10, round 2 (art director's notes): kitchen floor redrawn as cream octagons with jade diamond insets (`tile/floor-kitchen-a…g`, new `-g`), stories kept (crazing, filled crack, wrong-batch diamond, drain, grease); thresholds now dull brass on a wooden bed, 4px, polished only mid-strip; oak lifted with a varnish sheen under each board lip and grain capped at two streaks; plaster flattened to one tone (light washes of every shape read as clouds or drips at play zoom), replaster patch now a crisp polygon; window glass luminous on a diagonal (white top-left to warm cream low down), roof and laundry legible; caps one dark timber profile with a single lit inner line; mat in two close tones with a hinged lifted corner (`tile/mat` is now 60×28, anchor [30, 27]).
- 2026-11-10, round 2 addendum: across a 20×10 floor the varnish-sheen runs and the paler replacement board read as scattered bright rectangles. Removed the sheen; `floor-wood-d`'s replacement board now differs by finish (clean, crisp unbroken lit edge, steel nails), not tone; the sun patch tops out at oak5. Only e, f, h carry paler wood, one step at most. Plain a/b are back to the round-1 value (~171); the lift asked for earlier conflicts with "no pale segments" and is left for the art director to call.
