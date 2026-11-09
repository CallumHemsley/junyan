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
    // Each stick a single lit line, a pixel wider at the square head; the pair lies a little askew.
    for (const [x0, y0, x1, y1] of [[1, 2, 22, 1], [2, 6, 22, 4]] as const) {
      q.line(x0, y0, x1, y1, "bamboo4");
      q.hline(x0, y0 - 1, 4, "bamboo5");
    }
    q.each((x, _y, c) => (c && x > 18 ? "wood4" : undefined));
    // A hairline shadow under and to the right only, so they stay slender.
    q.outline("bamboo1", { sides: ["bottom", "right"] });
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
  // Rim top: a two-pixel lip all round, lit along the back and left.
  p.rect(1, 0, 42, 20, "wood5");
  p.hline(2, 0, 40, "wood6").vline(0, 1, 18, "wood5").vline(1, 1, 18, "wood6");
  p.vline(42, 1, 19, "wood4").vline(43, 1, 18, "wood4").hline(2, 18, 40, "wood4").hline(2, 19, 40, "wood5");
  // Inner walls: the back and left ones face away from the sun.
  p.rect(2, 2, 40, 16, "wood3");
  p.hline(3, 2, 38, "wood2").vline(2, 2, 16, "wood2");
  // Floor of the tray: two boards, worn pale down the middle where bowls slide.
  p.rect(4, 4, 37, 14, "wood4");
  p.hline(4, 10, 37, "wood3").hline(4, 11, 37, "wood5");
  p.over(() => {
    for (const [x, y, n] of [[7, 6, 8], [22, 5, 12], [9, 8, 14], [28, 8, 9], [6, 13, 10], [21, 15, 14], [33, 13, 6]] as const) p.hline(x, y, n, y % 2 ? "wood5" : "wood3");
    for (const [x, y, n] of [[15, 7, 13], [13, 12, 17], [16, 14, 11]] as const) p.hline(x, y, n, "wood5");
    // A tea ring from a cup set down wet, years ago, and a nick from a dropped cleaver.
    p.rows(30, 12, [".rrrr.", "r....r", ".rrrr."], { r: "wood3" });
    p.line(9, 15, 12, 16, "wood2");
    // The right wall catches the sun.
    p.vline(41, 3, 15, "wood5");
  });
  // Hand slots in the rim at each end.
  p.rect(0, 7, 2, 5, "wood1").rect(42, 7, 2, 5, "wood1");
  // Front face, with the grain running along it and a chipped corner sanded smooth by hands.
  p.rect(0, 20, 44, 4, "wood3").hline(0, 20, 44, "wood4").hline(0, 23, 44, "wood2");
  p.over(() => p.hline(5, 21, 11, "wood4").hline(24, 22, 13, "wood2"));
  p.rows(40, 18, ["..55", ".544", "5444"], { "5": "wood5", "4": "wood4" });
  // The tea-cloth, folded in three and laid over the back-left corner: cream, two blue stripes.
  grid(p, 1, 1, [
    ".cccccccccccc.",
    "cWWWWwwwwwwwwc",
    "cbbbbBBBBBbbbc",
    "cWwwwwwwwwwwkc",
    "cwwwkwwwwwwwkc",
    "cbbbbBBBBBbbbc",
    ".ckkkkkkkkkkc.",
  ], { c: "cream2", W: "white", w: "cream4", k: "cream3", b: "blue4", B: "blue3" });
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
