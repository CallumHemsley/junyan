/**
 * The timber post that breaks the long back wall and marks where dining ends and kitchen begins.
 */
import { defineSprites, hash, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

/** One row of squared timber from x `l` to `r`: lit on the sun side, falling into shade on the right. */
function timberRow(p: Px, y: number, l: number, r: number) {
  p.px(l, y, "wood5").px(l + 1, y, "wood4").hline(l + 2, y, r - l - 4, "wood3").px(r - 2, y, "wood2").px(r - 1, y, "wood2").px(r, y, "wood1");
}

/**
 * A square fir post, 32×96 with transparent sides: lay it over the wall slices, usually across the
 * seam between the last dining slice and the first kitchen slice. A carved bracket under the cornice,
 * a granite plinth against damp. The owner's two daughters were measured against it every New Year:
 * knife nicks climb its left edge. A seasoning check runs down the face, the timber is rubbed pale
 * at hand height, and a nail holds the loop of string the broom hangs from.
 * Anchors at the wall's foot: place at (x, 96) with the wall starting at y = 0.
 */
function post(p: Px) {
  const L = 10, R = 21;
  for (let y = 16; y < 88; y++) timberRow(p, y, L, R);
  // Grain: long streaks down the face.
  for (let i = 0; i < 9; i++) {
    const x = L + 2 + Math.floor(hash(i, 0, 7) * 7), y = 18 + Math.floor(hash(i, 1, 7) * 60), n = 6 + Math.floor(hash(i, 2, 7) * 12);
    p.vline(x, y, Math.min(n, 87 - y), hash(i, 3, 7) > 0.5 ? "wood4" : "wood2");
  }
  // Seasoning check.
  block(p, 15, 22, ["1.", "1.", "2.", ".1", ".1", ".1", ".2", "1.", "1.", "1.", "2.", ".2"], { 1: "wood1", 2: "wood2" }, "check");
  // Rubbed lighter at hand height, where everyone steadies themselves going behind the counter.
  p.swap({ wood3: "wood4", wood2: "wood3" }, [L + 2, 60, 6, 12]);
  // The daughters' height marks: short knife nicks with a lit lower lip, climbing year by year.
  for (const y of [53, 58, 62, 67]) p.hline(L + 1, y, 3, "wood1").hline(L + 1, y + 1, 3, "wood5");
  // Nail and broom string.
  block(p, 16, 36, ["ss.", "Ss.", ".c.", "c.c", "c.c", "c.c", ".cc"], { s: "steel5", S: "steel3", c: "cream4" }, "nail");

  // Capital under the cornice: a wide block, a narrower one, then a quarter-round easing into the shaft.
  p.hline(5, 6, 22, "wood5").hline(5, 7, 22, "wood4").hline(5, 8, 22, "wood3").hline(5, 9, 22, "wood1");
  p.px(26, 7, "wood2").px(26, 8, "wood2");
  timberRow(p, 10, 7, 24); p.hline(8, 10, 15, "wood5");
  timberRow(p, 11, 7, 24); p.hline(7, 12, 18, "wood2");
  for (const [y, l, r] of [[13, 8, 23], [14, 9, 22], [15, 10, 21]] as const) timberRow(p, y, l, r);
  p.px(8, 13, "wood4").px(9, 14, "wood4");

  // Granite plinth.
  p.rect(8, 88, 16, 8, "stone4").hline(8, 88, 16, "stone5").vline(8, 88, 8, "stone5");
  p.vline(23, 88, 8, "stone2").hline(8, 95, 16, "stone2").vline(22, 89, 6, "stone3");
  p.px(12, 91, "stone3").px(13, 91, "stone3").px(18, 93, "stone3").px(19, 93, "stone3");
  block(p, 20, 88, ["..2", ".22", "222"], { 2: "stone2" }, "chip");

  // Hairline shadow thrown on the wall to the right.
  p.faded(0.22, () => { p.rect(R + 1, 16, 2, 72, "ink"); p.rect(27, 6, 2, 10, "ink"); p.rect(24, 89, 2, 7, "ink"); });
}

export default defineSprites({
  "wall/post": { w: 32, h: 96, anchor: [16, 96], layer: "floor", draw: post },
});
