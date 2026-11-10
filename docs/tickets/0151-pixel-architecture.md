---
id: 151
title: Draw the cafe architecture tiles: floors, walls, windows, doorway
status: done
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
- 2026-11-10, round 3 (French Concession bistro): ids kept, looks redrawn.
  - Dining floor `tile/floor-wood-a…i` is now a cream octagon-and-dot (cabochon) mosaic on an 8px pitch (`tiles/_mosaic.ts`); a true hex Voronoi was tried and its grout broke into dashes at this size. Stories: crack (c), relaid patch (d), worn grey path (e, f), churn ring (g), sun-faded patch (h), brass access plate (i). New border band: `tile/floor-border-h`, `-h-s`, `-v`, `-v-e`, `-corner-tl/-tr/-bl/-br` (16px band: strip tiles, ink lines, ink dentils; corners mitre).
  - Kitchen floor `tile/floor-kitchen-a…g`: plain glazed 16px squares in two close creams, stories kept; thresholds unchanged.
  - Back wall: plaster rows 10–57 over dark raised-panel wainscot (58–87) and dark skirting. Stories: filled crack running on as a panel split (c), photo ghost (d), polygon patch (e), chair-scuffed rail (f), water bloom under a window (g), a paler replacement panel (h), porcelain switch (i). Kitchen: white metro tiles, black trim course at 58–62, black skirting tiles.
  - Windows: 68×47, anchor [34, 85] (top on wall row 11, sill under row 57): green-painted frames, fine bars, transom (`window-lattice`) or segmental arch with fanlight (`-b`), linen café curtain on a brass rod; sill stories kept; mended bar on `-b`.
  - New: `wall/mirror-long` 96×40 (anchor [48, 80]), `wall/lamp-globe` 16×25 ([8, 82]), `wall/menu-board-tall` 30×44 ([15, 82], overlay x 4–25, y 4–37), `wall/awning-edge` 64×12 (layer over, [32, 12]). `wall/post` is now a fluted dark pilaster. `tile/door-threshold` has a marble sill and brass kick strip.
  - Review: `bash output/pixel/room.png.sh`, `bash output/pixel/room-b.png.sh` (bistro furniture from 0153 was not on this branch; composes use table-round and the older chairs).

- Done 2026-11-10: merged to main with the pixel cafe (Shanghai bistro) and the 0158–0161 polish pass. Learned: art as deterministic code over one palette lets workers iterate by rendering PNGs headless; depth sorting of table items and seated actors needs explicit sortY.
