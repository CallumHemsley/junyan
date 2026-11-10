/**
 * Lane brick: faded terracotta pavers in 90° herringbone, laid by the Concession's public works in the
 * 1930s and lifted and relaid by every plumber since. Dark gritty joints with moss creeping along them
 * in the shade. Bricks that cross the tile edge share one look across all variants (see `_brick.ts`).
 *
 * The scene weights a and b heavily, c moderately and d rarely.
 */
import { defineSprites, hash, type Legend, type Px } from "../../kit/index.ts";
import { brickAt, herringbone, JOINT, TONES } from "./_brick.ts";
import { inBlob, stamp, tile } from "./_helpers.ts";

const L: Legend = { g: "leaf2", G: "leaf3", h: "leaf4", e: "oak1", E: "brown1", f: "oak2", d: "tan1", D: "wood2", s: "stone4" };

/** Moss in the joints: runs of leaf2 with the odd lit pixel, densest inside the blob. */
function moss(p: Px, seed: number, cx: number, cy: number, rx: number, ry: number, density: number) {
  p.each((x, y, c) => {
    if (c !== JOINT || !inBlob(x, y, cx, cy, rx, ry)) return undefined;
    const r = hash(x >> 1, y >> 1, seed);
    if (r < density * 0.15) return "leaf3";
    if (r < density) return "jade2";
    return undefined;
  });
}

export default defineSprites({
  /** Plain herringbone. */
  "ground/brick-a": tile((p) => herringbone(p, 1)),

  /** Plain herringbone with a few grey 青砖 slipped in where broken pavers were replaced. */
  "ground/brick-b": tile((p) => {
    herringbone(p, 2, (b) => (!b.shared && b.horizontal && [[2, 3], [3, 4]].some(([i, j]) => b.bi === i && b.bj === j) ? TONES.grey : undefined));
  }),

  /** The shady side of a lane: moss has taken the joints and greened two bricks' edges. */
  "ground/brick-c": tile((p) => {
    herringbone(p, 3);
    moss(p, 13, 14, 16, 13, 10, 0.75);
    moss(p, 17, 4, 28, 6, 4, 0.5);
  }),

  /**
   * One paver gone, the hole packed with dark earth and a dandelion rosette; the brick beside it
   * split clean across when the delivery tricycle's wheel dropped in.
   */
  "ground/brick-d": tile((p) => {
    herringbone(p, 4);
    // The missing brick: a horizontal one fully inside the tile.
    p.each((x, y) => {
      const b = brickAt(x, y);
      if (b.shared || !b.horizontal || b.bi !== 3 || b.bj !== 3) return undefined;
      return b.v === 0 ? "brown1" : b.u === 0 ? "brown1" : "oak1";
    });
    const x0 = 12, y0 = 12; // origin of brick (3,3)
    stamp(p, x0 + 1, y0 - 1, [".h.h..", "gGgGg.", ".gGg.."], L, false);
    // The split brick next door: a crack across its middle.
    stamp(p, x0 + 9, y0 + 4, ["D", "d", "D"], L, false);
  }),
});
