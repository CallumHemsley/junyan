---
id: 201
title: Draw the workshop's benches and small things
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The repair workshop is a pixel map since [[tickets/0182-workshop-pixel]], with its floor and structure drawn; its benches and the things on them still draw as placeholder boxes. They are what make it a workshop.

## Done when

- `src/pixel/sprites/life/workshop.ts` draws one `workshop/<id>` sprite per prop of `lamp-bench`, `toy-bench`, `wood-bench`, `sewing-bench`, `bins`, `radio`, `kettle`, `plant`, `lamp`, `chair-repair`, `shavings`, `paper`, `thread-box`, `doormat` and `wheel`.
- The lamps' and the radio dial's light points are reported so glow lights can be added.
- Full renders at 3x before and after, two crops and an evening check reviewed; `tsc -b` and `vitest run src/pixel src/world` pass.

## Notes

- 2026-11-11: doing. Owner Claude (pixel worker); branch `claude/0201-workshop-benches` from `claude/0182-workshop-pixel`; worktree `/Users/callumhemsley/Personal/junyan-px-0201`; no dev server. Stays out of `e2e/`.
- 2026-11-11: done. `src/pixel/sprites/life/workshop.ts`:
  - Benches:
    - the electronics bench: a back-board of parts boxes, a green mat, a gutted valve radio and its chassis, the soldering iron in its coil stand, solder, a meter, a resistor tray, a mug, a drawer bank;
    - the toy bench: a hutch of little drawers, a tin truck with its clockwork out, watchmaker's screwdrivers, a jar of springs, tin toys waiting on the shelf below;
    - the window bench: jars of nails, newspaper, a tea tin and cup;
    - the carpenter's bench: pale beech, a face vice holding a half-shaped chair leg, dog holes, a plane, chisels, a tool rack, shavings;
    - the treadle sewing table: the machine head with ghost-gold scrolls and a bright hand wheel, flowered cotton, the iron treadle frame.
  - The things on benches: the magnifier lamp, the green enamel lamp, the kettle on its charcoal stove, the chalk board with a toy car plan, the bentwood chair in sash clamps, the mending box.
  - The rest: the spares bins, the valve radio on its stand with its dial lit, the spider plant in a biscuit tin, the floor shavings, the coir doormat and the yard cartwheel.
- Light points (world tiles; screen position, like the town's lamp glass), exported as `LIGHTS` and computed from the map:
  - magnifier lens (`workshop.desk-lamp`): (9.09, 7.00);
  - green lamp's bulb (`workshop.toy-lamp`): (23.31, 7.31);
  - radio dial (`workshop.radio`): (9.59, 2.59).
- Bench tops are foreshortened to 65% of their (two-tile) footprint depth, with a back-board or rack behind them, so a full-footprint collider doesn't read as a vast table.
- Things standing on a bench lie inside its footprint, so the bench sorts in front of them. Each is drawn by one function at its world position and painted twice, by its own sprite and by its bench's, so the bench never hides it.
- Map issue, not fixed here: `workshop.entry-mat` (doormat) and `workshop.wood-shavings` are `object` in the map, so the scene sorts them with people, and a player standing on them has their feet covered. They want `layer: "ground"`.
- Checks: `tsc -b` is clean; `vitest run src/pixel src/world` passed 98 files, 508 tests.
- Learned: an item on a bench either needs its own sort key or has to be drawn by the bench too. Painting the same art from one world-positioned function keeps the two copies pixel-identical.
