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
- 2026-11-11, round 2 (orchestrator review; branch `claude/0188-rooftop-ground-r2` from `main`, worktree `/Users/callumhemsley/Personal/junyan-px-0188b`):
  - Quarry walkways: 16 px tiles, one flat face each, grout close to their value. A `roof-brick-worn` band bleaches the middle of each walkway and leaves the edges darker. Replacement tiles are rare.
  - Deck: tiles laid in courses of irregular length. Each variant puts its joints in different places, so tiles run 8 to 50 px and the courses don't line up. The grout is thin and light, and the faded band is larger and softer: a translucent wash, stronger in its heart.
  - Concrete: bays two or three tiles across, laid out on a plan by a `roof-concrete-bay` band. Each tile corner stands for its nearest quarter, so the sealed joints run through tile middles wherever neighbouring quarters fall in different bays. `BandContext` gained the corner's `x` and `y` for bands laid out on a plan.
- Learned (round 2): a translucent wash band works over bases whose joints vary by variant, where a redraw would mismatch. Quarter-per-corner bands give straight joints of any bay size without new placement code.
