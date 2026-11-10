/**
 * Bedside furniture: the cabinet that works as the opening's kitchen, the overbed table and the
 * visitor chair. Wood is the room's warm note against the white enamel and the mint walls.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { CABINET_TOP, CHROME, ENAMEL, grid, hTube, vTube } from "./_furn.ts";

/** A wooden panel lit from the upper left: lit top and left edges, shaded bottom and right. */
function woodPanel(p: Px, x: number, y: number, w: number, h: number) {
  p.rect(x, y, w, h, "wood4");
  p.hline(x, y, w, "wood5").vline(x, y, h, "wood5");
  p.hline(x + 1, y + h - 1, w - 1, "wood2").vline(x + w - 1, y + 1, h - 1, "wood3");
}

/** Short quiet grain streaks over existing wood. */
function grain(p: Px, streaks: readonly (readonly [number, number, number, "wood3" | "wood5"])[]) {
  p.over(() => { for (const [x, y, n, c] of streaks) p.hline(x, y, n, c); });
}

/**
 * `ward/cabinet`: the bedside cabinet between the two beds, tea-wood with a cream formica top in an
 * aluminium edge strip. It has stood on this ward for thirty years: the edging has lifted at the
 * front left corner, a thermos has left a pale ring at the back right, the drawer's brass card slot
 * is empty (DOM area x 8–12, y 31–32), the cupboard door's catch has gone and it rests a hair open,
 * the plinth is scuffed by shoes. A chrome rail on its right holds a striped hand towel.
 *
 * Foods: the top face spans x 2–41, y 2–24. Food slots are exported as `CABINET_TOP` from
 * `_furn.ts`, relative to the anchor [22, 57]: milk at (−10, −45), bread at (+9, −44), egg at
 * (0, −35), each the food sprite's own anchor; sort them with the cabinet (anchor y + 1, 2, 3).
 */
function cabinet(p: Px) {
  const [rx, ry, rw, rh] = CABINET_TOP.rect;
  const left = 22 + rx, top = 57 + ry;
  // The top: plain cream formica, calm so food reads on it, lit at the back left.
  p.rect(left, top, rw, rh, "cream4");
  p.over(() => {
    p.hline(left + 1, top, rw - 6, "cream5").vline(left, top + 1, rh - 3, "cream5").hline(left + 2, top + 1, 14, "cream5");
    p.vline(left + rw - 1, top + 1, rh - 1, "cream3");
  });
  // The thermos ring at the back right, and the aluminium edge strip all round.
  grid(p, 31, 4, 9, ["..55555..", ".5.....5.", "5.......5", ".5.....5.", "..55555.."], { "5": "cream5" });
  p.frame(left - 1, top - 1, rw + 2, rh + 2, "steel4");
  p.hline(left - 1, top - 1, rw + 2, "steel5").vline(left - 1, top - 1, rh + 2, "steel5");
  // The front lip of the strip, catching the window light, lifted at the left corner.
  p.hline(1, 25, 42, "steel5").hline(1, 26, 42, "steel3");
  grid(p, 1, 24, 5, ["66...", "6553.", "33333"], { "6": "steel6", "5": "steel5", "3": "steel3" });

  // The carcass's front face: stiles, rails, the drawer and the door.
  p.rect(1, 27, 42, 26, "wood3");
  p.vline(1, 27, 26, "wood4").vline(2, 27, 26, "wood4").vline(42, 27, 26, "wood2");
  woodPanel(p, 4, 28, 36, 8);
  grain(p, [[6, 30, 9, "wood5"], [24, 33, 11, "wood3"], [14, 34, 6, "wood3"]]);
  // The drawer's empty brass card slot and its chrome cup pull.
  p.frame(7, 30, 7, 4, "gold2").hline(7, 30, 7, "gold3").rect(8, 31, 5, 2, "wood2");
  grid(p, 18, 30, 8, [".dddddd.", "dWeeeee3", ".e3333e.", "..3333.."], { d: "steel2", W: "white", e: "steel5", "3": "steel3" });
  // The door, frame and raised panel, resting a hair open so its right edge throws a dark line.
  woodPanel(p, 4, 38, 36, 14);
  p.rect(8, 40, 28, 10, "wood3");
  p.hline(8, 40, 28, "wood2").vline(8, 40, 10, "wood2").hline(9, 49, 27, "wood5").vline(35, 41, 9, "wood5");
  p.rect(9, 41, 26, 8, "wood4");
  grain(p, [[11, 43, 10, "wood5"], [22, 46, 9, "wood3"], [13, 47, 5, "wood3"]]);
  p.vline(40, 38, 14, "wood1").vline(39, 39, 12, "wood5");
  // The knob and an old keyhole below it whose key went missing years ago.
  grid(p, 34, 43, 3, [".g.", "gGg", ".g."], { g: "gold2", G: "gold4" });
  p.px(35, 46, "wood1").px(35, 47, "wood1");
  // Plinth and short legs on rubber feet, the kick plate scuffed pale by shoes.
  p.rect(3, 53, 38, 2, "wood2").hline(3, 53, 38, "wood1");
  p.over(() => { p.hline(10, 54, 3, "oak3").hline(25, 54, 4, "oak3").px(17, 54, "oak3"); });
  grid(p, 1, 53, 4, ["3442", "3442", "3442", "kkkk"], { "3": "wood3", "4": "wood4", "2": "wood2", k: "stone1" });
  grid(p, 39, 53, 4, ["3422", "3422", "3422", "kkkk"], { "3": "wood3", "4": "wood4", "2": "wood2", k: "stone1" });
  p.outline("wood1");
  // The towel rail on its right and a striped hand towel, after the outline so it overhangs.
  p.px(43, 29, "steel4").px(43, 30, "steel3");
  grid(p, 41, 29, 3, ["555", "jjj", "555", "5j5", "555", "jjj", "555", "55.", "5.."], { "5": "cream5", j: "jade4" });
}

/**
 * `ward/overbed-table`: the wheeled table that rolls over a bed, a wood-grain laminate top on one
 * chrome column and an H base. Its height lever has a strip of white tape on it where someone
 * wrote a warning long since worn blank; the laminate's edge band is peeling at the right, and a
 * tea mug's ring sits by the left corner. Clear top for things the scene puts on it: x 4–38, y 3–13
 * (anchor [22, 58]: dx −18…+16, dy −55…−45).
 */
function overbedTable(p: Px) {
  // The base: an H frame of flat steel with four castors, the column rising at the left.
  hTube(p, 1, 51, 32, ENAMEL, 3);
  for (const x of [1, 28]) grid(p, x, 54, 5, ["deeed", ".rRr.", ".rhr.", "..r.."], { d: "steel2", e: "steel4", r: "stone1", R: "stone2", h: "steel4" });
  vTube(p, 4, 17, 34, CHROME, 3);
  // The telescoping joint and its height lever with the worn tape.
  p.rect(3, 34, 5, 3, "steel3").hline(3, 34, 5, "steel5");
  grid(p, 8, 33, 6, ["eeeeWW", "3333WW", "....33"], { e: "steel5", "3": "steel3", W: "white" });
  // The top: laminate with oak grain, a dark edge band showing below.
  p.rect(1, 2, 42, 13, "oak4");
  p.hline(1, 2, 42, "oak5").vline(1, 3, 12, "oak5").vline(42, 3, 12, "oak3");
  p.over(() => {
    for (const [x, y, n] of [[5, 5, 14], [22, 4, 12], [9, 8, 18], [28, 9, 10], [4, 11, 9], [17, 12, 16]] as const) p.hline(x, y, n, "oak3");
    for (const [x, y, n] of [[13, 6, 8], [30, 7, 7], [24, 11, 9]] as const) p.hline(x, y, n, "oak5");
  });
  grid(p, 4, 9, 7, ["..333..", ".3...3.", "..333.."], { "3": "oak3" });
  p.rect(1, 15, 42, 3, "wood3").hline(1, 15, 42, "wood4").hline(1, 17, 42, "wood2");
  // The edge band peeling at the right end, curling away from the top.
  grid(p, 37, 15, 7, ["...4444", "..3oo44", ".3...3."], { "4": "wood4", "3": "wood2", o: "oak2" });
  p.outline("steel2");
}

/**
 * `ward/visitor-chair`, facing down: a 1980s stacking chair, chrome tube and jade vinyl. The seat
 * split long ago and was mended with brown parcel tape; the aunt has left her plum cardigan over
 * the back. Anchor at the front feet, like the cafe's chairs; a sitter's own anchor goes at (0, −4).
 */
function visitorChair(p: Px) {
  // Back legs behind the seat, then the back's two uprights.
  p.vline(7, 30, 10, "steel2").vline(20, 30, 10, "steel2");
  vTube(p, 4, 6, 22, CHROME, 2);
  vTube(p, 22, 6, 22, CHROME, 2);
  // The back panel: padded vinyl with a piped edge, lit at the top left.
  p.rect(5, 3, 18, 13, "jade3");
  p.hline(6, 3, 16, "jade4").vline(5, 4, 11, "jade4").hline(7, 4, 10, "jade5");
  p.hline(5, 15, 18, "jade2").vline(22, 4, 12, "jade2");
  p.hline(8, 9, 12, "jade2").hline(8, 10, 12, "jade4");
  // The aunt's cardigan over the back, sleeves hanging.
  grid(p, 2, 2, 24, [
    "....kkkkkkkkkkkkkk......",
    "...kPPPPpPPPPpPPPPk.....",
    "..kPP3PPPpPPPPpPPPPk....",
    "..kPPPPPPPPPPPPPPPpPk...",
    "..kpk.............kpk...",
    "..kpk.............kpk...",
    "..kPk.............kPpk..",
    "..kPpk.............kpk..",
    "...kPk.............kPk..",
    "...kpk.............kpk..",
    "...kkk.............kkk..",
  ], { k: "plum1", P: "plum3", p: "plum2", "3": "plum4" });
  // The seat: a padded oval-cornered top face over its chrome rim, the parcel-tape mend across it.
  p.rect(3, 18, 22, 10, "jade4");
  p.hline(4, 17, 20, "jade5").hline(5, 18, 14, "jade5").vline(3, 18, 8, "jade5");
  p.vline(24, 18, 10, "jade3").hline(4, 27, 21, "jade3");
  p.px(3, 17, null).px(24, 17, null);
  grid(p, 9, 20, 11, ["..oOOOOo...", ".oOOOOOOoo.", "..ooooooo.."], { o: "oak2", O: "oak3" });
  p.hline(3, 28, 22, "steel5").hline(3, 29, 22, "steel3");
  // Front legs, splayed a little, and the stretcher between them.
  vTube(p, 3, 30, 13, CHROME, 2);
  vTube(p, 23, 30, 13, CHROME, 2);
  p.hline(5, 37, 18, "steel4").hline(5, 38, 18, "steel2");
  grid(p, 3, 42, 2, ["kk"], { k: "stone1" });
  grid(p, 23, 42, 2, ["kk"], { k: "stone1" });
  p.outline("steel1");
}

export default defineSprites({
  "ward/cabinet": { w: 44, h: 58, anchor: [22, 57], foot: [-21, -14, 42, 14], shadow: { rx: 20, ry: 4, dy: -1 }, draw: cabinet },
  "ward/overbed-table": { w: 44, h: 60, anchor: [22, 58], foot: [-21, -8, 34, 8], shadow: { rx: 18, ry: 3, dy: -2, dx: -6 }, draw: overbedTable },
  "ward/visitor-chair": { w: 28, h: 45, anchor: [14, 43], foot: [-11, -12, 22, 12], shadow: { rx: 12, ry: 4, dy: -2 }, draw: visitorChair },
});
