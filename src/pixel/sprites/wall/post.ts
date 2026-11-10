/**
 * The pilaster that breaks the long back wall and marks where dining ends and kitchen begins.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

/** Columns of the fluted shaft, left to right: lit arris, two flutes (groove, lit edge), shaded arris. */
const SHAFT: readonly Color[] = ["wood3", "wood2", "wood1", "wood3", "wood2", "wood2", "wood1", "wood3", "wood2", "wood1"];

/**
 * A slim fluted pilaster in dark-stained wood, 32×96 with transparent sides: lay it over the wall
 * slices, usually across the seam between the last dining slice and the first kitchen slice. A moulded
 * capital under the cornice, a plinth block at the floor. The owner's two daughters were measured
 * against it every New Year: knife nicks climb its left arris. The flutes are rubbed pale at hand
 * height, and a nail holds the loop of string the broom hangs from.
 * Anchors at the wall's foot: place at (x, 96) with the wall starting at y = 0.
 */
function pilaster(p: Px) {
  const L = 11;
  for (let y = 18; y < 86; y++) SHAFT.forEach((c, i) => p.px(L + i, y, c));
  // Flutes stop short of capital and base, with rounded ends.
  for (const x of [L + 2, L + 6]) { p.px(x, 18, "wood2").px(x, 19, "wood2").px(x, 84, "wood2").px(x, 85, "wood2"); }
  // Rubbed pale at hand height, where everyone steadies themselves going behind the counter.
  p.swap({ wood2: "wood3" }, [L + 4, 61, 2, 8]).swap({ wood2: "wood3" }, [L + 1, 63, 1, 5]).swap({ wood2: "wood3" }, [L + 8, 62, 1, 4]);
  // The daughters' height marks: short knife nicks with a lit lower lip, climbing year by year.
  for (const y of [52, 57, 61, 66]) p.hline(L, y, 3, "wood1").hline(L, y + 1, 3, "wood4");
  // Nail and broom string.
  block(p, 17, 36, ["ss.", "Ss.", ".c.", "c.c", "c.c", "c.c", ".cc"], { s: "steel5", S: "steel3", c: "cream4" }, "nail");

  // Capital: a stepped moulding, widest at the top, lit on its upper faces.
  const rows: readonly [number, number, number, Color][] = [
    [10, 7, 18, "wood4"], [11, 7, 18, "wood3"], [12, 7, 18, "wood2"], [13, 7, 18, "wood1"],
    [14, 9, 14, "wood3"], [15, 9, 14, "wood2"], [16, 10, 12, "wood4"], [17, 10, 12, "wood1"],
  ];
  for (const [y, x, w, c] of rows) { p.hline(x, y, w, c); p.px(x + w - 1, y, "wood1"); }
  // Plinth.
  p.hline(10, 86, 12, "wood3").hline(10, 87, 12, "wood1");
  p.rect(9, 88, 14, 7, "wood2").hline(9, 88, 14, "wood3").vline(9, 88, 7, "wood3").vline(22, 88, 7, "wood1").hline(9, 95, 14, "ink");
  p.hline(11, 91, 6, "wood3");
  // Hairline shadow thrown on the wall to the right.
  p.faded(0.22, () => { p.rect(L + 10, 18, 2, 68, "ink"); p.rect(25, 10, 2, 8, "ink"); p.rect(23, 88, 2, 7, "ink"); });
}

export default defineSprites({
  "wall/post": { w: 32, h: 96, anchor: [16, 96], layer: "floor", draw: pilaster },
});
