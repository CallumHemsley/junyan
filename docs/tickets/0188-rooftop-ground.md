---
id: 188
title: Draw the rooftop's own ground
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The rooftop garden (`src/world/maps/rooftop/map.json`, 48×36) borrowed town tiles through material aliases and read like a street, not a shared garden on a roof above the lanes.

## Done when

- `src/pixel/sprites/ground/rooftop.ts` draws seamless `ground/<material>-a..d` for `roof-tile`, `roof-concrete`, `roof-brick`, `roof-wood` and the fill past the parapets, plus edges and tone bands.
- `src/pixel/town/ground-rooftop-legend.ts` exports `ROOFTOP_GROUND` in the courtyard's `GroundMaterialSpec` format, registered in `GROUND_SPECS`; `MAP_FILL` no longer carries the rooftop.
- Whole-scene renders before and after and 3x close-ups reviewed; `tsc -b` and the pixel and world tests pass.

## Notes

- 2026-11-11: owner Claude Code; branch `claude/0188-rooftop-ground` from `claude/0186-rooftop-pixel`; worktree `/Users/callumhemsley/Personal/junyan-px-0188`; no dev server.
- Done. Materials:
  - `roof-tile`: the main deck, 16 px square tiles faded to a dusty buff, a few warmer, paler or darker, light grout.
  - `roof-concrete`: pale screed bays a tile square, each with a sealed joint along its top and left edges; water stains, a cast-iron outlet.
  - `roof-brick`: red-grey 8 px quarry-tile walkways with an edging course against the deck.
  - `roof-wood`: silvered decking with nail lines over the joists and a front board to the south.
  - `roof-below` (the fill): the neighbours' grey pantiles a storey down, cooler and darker, with the deck's drop shadow on them.
  - Bands: sun-faded deck patches, damp moss along the parapet foot, water stains on the screed.
- Learned: the deck and the walkways need different value and tile size to read apart; the faded deck is buff, the walkways red-grey. Tone picks by small grid coordinates need the avalanche hash (the kit's streaks diagonally there too). A drop shadow on the fill sells "below" more than darkening the tiles does.
