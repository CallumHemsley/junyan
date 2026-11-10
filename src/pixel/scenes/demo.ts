/**
 * Engine demo: a 12×9 room from the `ex/*` reference sprites that exercises every feature —
 * a three-tile back wall as a tile layer, varied floor, two tables with stools, the waiter,
 * a lattice window shaft with dust motes, a flickering glow, marks and colliders.
 */
import { defineScene } from "../engine/index.ts";

export default defineScene({
  id: "demo",
  size: [12, 9],
  background: "ink",
  legend: {
    W: "ex/wall",
    f: ["ex/floor-wood-a", "ex/floor-wood-a", "ex/floor-wood-b", "ex/floor-wood-b", "ex/floor-wood-c", "ex/floor-wood-d"],
  },
  layers: [
    // The three-tile-tall wall slice is anchored at its top-left cell and spills down over rows 1 and 2.
    { name: "wall", rows: ["WWWWWWWWWWWW"] },
    {
      name: "floor", origin: [0, 3], seed: 3,
      rows: [
        "ffffffffffff",
        "ffffffffffff",
        "ffffffffffff",
        "ffffffffffff",
        "ffffffffffff",
        "ffffffffffff",
      ],
    },
  ],
  props: [
    // Table one with a stool either side; table two with one stool in front and one behind.
    { id: "table-1", sprite: "ex/table", at: [3, 5.6] },
    { sprite: "ex/stool", at: [1.45, 5.4] },
    { sprite: "ex/stool", at: [4.55, 5.4] },
    { id: "table-2", sprite: "ex/table", at: [8.5, 7.1] },
    { sprite: "ex/stool", at: [8.5, 5.55] },
    { sprite: "ex/stool", at: [8.5, 8.1] },
  ],
  lights: [
    // Morning sun through a window above table one, falling down and right.
    { kind: "shaft", from: [1.5, 2.1], width: 2.25, length: 5.2, slant: 0.45, strength: 0.55, panes: [3, 3], motes: 6 },
    // A warm lamp by table two; it flickers a little and is brightest at night.
    { kind: "glow", at: [8.5, 6], radius: 3.2, color: "gold4", strength: 0.45, flicker: 0.25 },
  ],
  // Walls are not walkable: keep feet below the skirting.
  walkable: [0, 3.2, 12, 5.8],
  marks: {
    door: { at: [6, 9], facing: "up" },
    pickup: { at: [10.5, 3.6], facing: "up" },
    "seat/t1-w": { at: [1.45, 5.4], facing: "right" },
    "seat/t1-e": { at: [4.55, 5.4], facing: "left" },
    "seat/t2-n": { at: [8.5, 5.55], facing: "down" },
    "seat/t2-s": { at: [8.5, 8.1], facing: "up" },
    "sign/menu": { at: [5.5, 0.6], size: [2, 1] },
  },
  actors: [{ id: "waiter", sprite: "char/waiter", at: [6.2, 6.6], facing: "down", action: "idle" }],
});
