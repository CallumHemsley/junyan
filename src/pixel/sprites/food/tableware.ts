/**
 * Tableware at table scale: the waiter's tray, the dishes left after eating, chopsticks, spoon and
 * soy dish. Anchors are the bottom-centre pixel, where the piece rests.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { grid, part, selout, tube, type Ramp } from "./_helpers.ts";
import { bowl, plate, RIMS, steamer, type BodyPattern } from "./_ware.ts";

const BAMBOO: Ramp = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];

/** A pair of bamboo chopsticks lying a little apart, square at the top, tips stained from years of soy. 24×7. */
function chopsticks(): Px {
  return part(24, 8, (q) => {
    // Each stick a single lit line with a square head; the pair lies a little apart and askew.
    for (const [x0, y0, x1, y1] of [[1, 2, 22, 1], [2, 6, 22, 4]] as const) {
      q.line(x0, y0, x1, y1, "bamboo4");
      q.px(x0, y0, "bamboo5").px(x0 + 1, y0, "bamboo5").px(x0 + 2, y0, "bamboo5");
    }
    q.each((x, _y, c) => (c && x > 18 ? "wood4" : undefined));
    selout(q, "bamboo1", "bamboo2");
  });
}

/** A porcelain spoon lying down, blue rim, short thick handle, 14×7. */
const SPOON = [
  "..ooooo........",
  ".obWWWbo.......",
  "obWwwwwbooooo..",
  "obwwwwwbbbbWbo.",
  ".obwwwbooooooo.",
  "..ooooo........",
];

function tray(p: Px) {
  // Floor of the tray: oak boards worn pale in the middle where the bowls slide.
  p.rect(2, 2, 40, 16, "wood4");
  for (const y of [7, 12]) p.hline(3, y, 38, "wood3");
  p.over(() => {
    for (const [x, y, n] of [[6, 4, 9], [20, 3, 14], [10, 9, 16], [30, 9, 8], [5, 14, 12], [22, 15, 15]] as const) p.hline(x, y, n, "wood5");
    for (const [x, y, n] of [[14, 5, 14], [12, 10, 18], [15, 11, 12]] as const) p.hline(x, y, n, "wood5");
    // A tea ring from a cup set down wet, years ago.
    p.rows(31, 12, [".rrrr.", "r....r", ".rrrr."], { r: "wood3" });
    // The far rim's shadow falls on the floor.
    p.hline(2, 2, 40, "wood2").hline(2, 3, 40, "wood3");
  });
  // Raised rim: lit top edge round the back and left, a front face below.
  p.rect(0, 0, 44, 2, "wood5").hline(1, 0, 42, "wood6");
  p.rect(0, 0, 2, 19, "wood5").vline(0, 1, 18, "wood6");
  p.rect(42, 0, 2, 19, "wood3");
  p.rect(0, 18, 44, 2, "wood5").hline(1, 18, 42, "wood6");
  p.rect(0, 20, 44, 4, "wood3").hline(0, 20, 44, "wood4").hline(0, 23, 44, "wood2");
  // Hand slots in the ends.
  p.rect(0, 7, 2, 5, "wood1").rect(42, 7, 2, 5, "wood1");
  // A chipped front corner, sanded smooth by hands.
  p.rows(39, 20, ["..55", ".544", "5444"], { "5": "wood5", "4": "wood4" });
  p.over(() => p.hline(6, 21, 10, "wood4").hline(24, 22, 12, "wood2"));
  // The tea-cloth, folded over the back-right corner: cream with blue stripes.
  grid(p, 30, -0, [
    "..cccccccccc",
    ".cWWWwwwwwwc",
    "cWbbbBBBBbbc",
    "cWwwwwwwwwwc",
    ".cbbbBBBBbbc",
    "..cWwwwwwwc.",
    "...ccccccc..",
  ], { c: "cream2", W: "white", w: "cream4", b: "blue4", B: "blue3" });
  p.outline("wood1");
}

function emptyPlate(p: Px) {
  plate(p, 12, 6, 11, 4.6, { rim: RIMS.wave, well: 0.66, chip: [[22, 7]] });
  // Crumbs and a smear of vinegar.
  p.over(() => {
    p.rows(7, 5, ["ss..", ".sss"], { s: "wood3" });
    for (const [x, y] of [[13, 7], [9, 8], [15, 5]] as const) p.px(x, y, "cream3").px(x + 1, y, "cream4");
  });
  selout(p, "blue2", "blue3");
  // Chopsticks laid across, as people do when they have finished.
  p.blit(chopsticks(), 0, 2);
}

const plainBody: BodyPattern = (_u, t, lit) => (t * 8 > 0.8 && t * 8 < 1.6 ? (lit ? "blue3" : "blue2") : undefined);

function emptyBowl(p: Px) {
  bowl(p, 10, 5, 9, 3.6, 8, { belly: 0.8, body: plainBody });
  // The empty well: pale glaze with a dried smear of congee and a few grains.
  p.ellipse(10.3, 5.6, 7.4, 2.4, "blue6");
  p.over(() => {
    p.hline(5, 6, 4, "cream4").hline(6, 7, 5, "cream4").px(13, 5, "cream5").px(14, 6, "cream4");
  });
  grid(p, 12, 0, ["...oo", "..obo", ".obo.", "obWo.", ".oo.."], { o: "blue2", b: "blue3", W: "white" });
  selout(p, "blue2", "blue3");
}

function emptySteamer(p: Px) {
  const basket = part(24, 14, (q) => steamer(q, 12, 6, 11, 4.5, 4, "back", [5, 17]));
  p.blit(selout(basket, "bamboo1", "bamboo2"), 0, 0);
  // The cotton liner, crumpled now, and a torn scrap of bun skin.
  grid(p, 4, 3, [
    "..cCCCc.ccc....",
    ".cCwCCCcCwCc...",
    "cCCCkCCCCCkCCc.",
    ".cCkCCCwCCCCc..",
    "..ccCCCCkCcc...",
  ], { c: "cream3", C: "cream4", w: "cream5", k: "cream2" });
  grid(p, 14, 4, ["wW", "ww"], { w: "cream5", W: "white" });
  steamer(p, 12, 6, 11, 4.5, 4, "front");
}

function soyDish(p: Px) {
  plate(p, 6, 3.5, 5.5, 2.5, { rim: RIMS.plain, well: 0.72, thick: 1 });
  p.ellipse(6.2, 3.7, 3.4, 1.3, "brown1");
  p.px(5, 3, "wood3").px(4, 3, "white");
  selout(p, "blue2", "blue3");
}

export default defineSprites({
  /** The waiter's tray: oak, its middle worn pale, a tea ring, a chipped corner, the tea-cloth folded on it. */
  "food/tray": { w: 44, h: 25, anchor: [22, 24], draw: tray },
  "food/plate-empty": { w: 24, h: 13, anchor: [12, 12], draw: emptyPlate },
  "food/bowl-empty": { w: 20, h: 17, anchor: [10, 16], draw: emptyBowl },
  "food/steamer-empty": { w: 24, h: 15, anchor: [12, 14], draw: emptySteamer },
  /** Bamboo chopsticks, the tips darkened from years of soy. */
  "food/chopsticks": { w: 24, h: 8, anchor: [12, 7], draw: (p) => p.blit(chopsticks(), 0, 0) },
  "food/spoon": { w: 15, h: 6, anchor: [7, 5], draw: (p) => grid(p, 0, 0, SPOON, { o: "blue2", b: "blue3", W: "white", w: "blue6" }) },
  "food/soy-dish": { w: 12, h: 7, anchor: [6, 6], draw: soyDish },
});
