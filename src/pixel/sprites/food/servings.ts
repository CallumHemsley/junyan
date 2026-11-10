/**
 * Table-scale servings, ids `food/<id>`: what sits on the tables and on the waiter's tray, at true
 * scale beside a 32×64 person. Drawn in the room's three-quarter view on their own crockery, each
 * piece patterned differently, so every dish reads apart by silhouette and two or three colours.
 *
 * The anchor is the bottom-centre pixel of the dish, where it touches the table or tray.
 * Table-top items should be depth-sorted with the table they stand on, not by their own anchor.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { grid, part, selout, tube, type Ramp } from "./_helpers.ts";
import { bowl, plate, RIMS, steamer, surface, tumbler, type BodyPattern } from "./_ware.ts";

const DOUGH_KEY = { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2", g: "cream3" } as const;
const FRIED: Ramp = ["orange1", "gold2", "gold3", "gold4", "gold5"];

/** A bun top with its pleat swirl, 9×7. */
const MINI_BUN = [
  "...ccc...",
  ".cc5W5oo.",
  "c5WgW5g4o",
  "c5g55g44o",
  "c45544 2o".replace(" ", "3"),
  ".o33322o.",
  "..ooooo..",
];

/** A plain steamed bread, smooth, 10×7. */
const MINI_MANTOU = [
  "...cccc...",
  ".cc5WW5oo.",
  "c5WWW5554o",
  "c5W555544o",
  "c44555433o",
  ".o333322o.",
  "..oooooo..",
];

/** A crescent dumpling, 7×5. */
const MINI_DUMPLING = [
  "..ccc..",
  ".cWgWo.",
  "c5W554o",
  "o3ooo2o",
  ".o...o.",
];

function steamedBuns(p: Px, eaten = false) {
  const basket = part(24, 18, (q) => {
    steamer(q, 12, 9, 11, 4.5, 5, "back", [5, 17]);
    // Half-finished: the liner shows where two buns were, with a torn scrap of skin left on it.
    if (eaten) q.over(() => {
      for (let y = 4; y < 12; y++) for (let x = 2; x < 22; x++) {
        const c = q.get(x, y);
        if ((c === "bamboo2" || c === "bamboo1") && y > 5) q.px(x, y, y === 6 ? "cream3" : "cream4");
      }
      q.px(6, 7, "cream5").px(7, 7, "white").px(6, 8, "cream3");
    });
  });
  p.blit(selout(basket, "bamboo1", "bamboo2"), 0, 0);
  const spots = eaten ? ([[12, 4]] as const) : ([[2, 2], [13, 2], [7, 5]] as const);
  for (const [x, y] of spots) p.blit(part(9, 7, (q) => grid(q, 0, 0, MINI_BUN, DOUGH_KEY)), x, y);
  steamer(p, 12, 9, 11, 4.5, 5, "front");
}

function mantouPlate(p: Px) {
  plate(p, 12, 10, 11, 4.6, { rim: RIMS.dotted, well: 0.62, thick: 2 });
  p.over(() => { p.ellipse(8, 11, 5, 1.4, "blue5"); p.ellipse(16, 13, 5, 1.4, "blue5"); });
  p.blit(part(10, 7, (q) => grid(q, 0, 0, MINI_MANTOU, DOUGH_KEY)), 2, 4);
  p.blit(part(10, 7, (q) => grid(q, 0, 0, MINI_MANTOU, DOUGH_KEY)), 11, 6);
  selout(p, "blue2", "blue3");
}

/** A small peeled tea egg standing up: a clean egg shape netted with crisp brown cracks. 9×11. */
const MINI_TEA_EGG = [
  "...ccc...",
  "..c5hho..",
  ".c5hWh4o.",
  ".c5hv54o.",
  "c55v5v44o",
  "c5v555v4o",
  "c4v45v43o",
  "o44v4V33o",
  ".o4V4332o",
  "..o3322o.",
  "...ooo...",
];

function teaEggs(p: Px) {
  plate(p, 11, 10, 10, 4.2, { rim: RIMS.plain, well: 0.7 });
  p.over(() => { p.ellipse(7, 12, 4, 1.2, "blue5"); p.ellipse(15, 12.5, 4.5, 1.2, "blue5"); });
  grid(p, 2, 1, MINI_TEA_EGG, { c: "oak2", o: "wood2", h: "cream5", W: "white", "5": "cream5", "4": "cream4", "3": "oak5", "2": "oak4", v: "oak3", V: "wood4" });
  grid(p, 11, 6, [
    "..cccc..",
    ".cWwwbo.",
    "cbwyywbo",
    "obwYYwbo",
    ".oeeeeo.",
    "..oooo..",
  ], { c: "oak2", o: "wood3", b: "oak3", W: "white", w: "cream5", y: "gold4", Y: "gold3", e: "oak4" });
  selout(p, "blue2", "blue3");
}

/** Soy milk in a ribbed glass on a saucer, the spoon standing in it; no bowl, so it never reads as congee. */
function soyMilk(p: Px) {
  plate(p, 10, 17, 9, 3, { rim: RIMS.banded, well: 0.6, thick: 1 });
  p.over(() => p.ellipse(9.5, 17.5, 4.5, 1.1, "blue5"));
  // The spoon's handle, standing up out of the glass behind the rim.
  grid(p, 11, 0, ["..oo", ".obo", "obo.", "ob.."], { o: "blue2", b: "white" });
  p.blit(tumbler(20, 21, 9.5, 4, 17, 4.6, 3.9, 1.6, { headroom: 1.5, base: 2, ribs: 2, fill: ["cream3", "cream4", "cream5", "white"] }), 0, 0);
  p.px(6, 4, "white").px(7, 4, "white").px(11, 5, "cream3");
  // A bead of milk down the outside.
  p.px(14, 5, "cream5").px(14, 6, "cream4").px(14, 7, "cream5").px(14, 8, "cream4");
}

/** The congee bowl at table scale: a solid blue collar, a hairline, a single carp. */
const smallCarp = (depth: number): BodyPattern => (u, t, lit) => {
  const py = t * depth, ink = lit ? "blue3" : "blue2";
  if (py < 1.6) return ink;
  if (py > 2.4 && py < 3) return lit ? "blue4" : "blue3";
  if (py > 3.6 && py < 5.6 && u > -0.55 && u < 0.05) return Math.abs(u + 0.5) < 0.06 ? "white" : ink;
  if (py > depth - 1) return ink;
  return undefined;
};

function congee(p: Px) {
  bowl(p, 12, 5, 11, 4.2, 8, { belly: 0.86, body: smallCarp(8) });
  surface(p, 12.3, 5.6, 9.4, 3, ["cream3", "cream5", "white"]);
  // Century egg, scallion, pickle.
  grid(p, 11, 3, [".oo.", "objo", ".oo."], { o: "brown1", b: "brown2", j: "jade2" });
  for (const [x, y] of [[6, 5], [16, 6], [9, 7], [15, 4]] as const) p.px(x, y, "leaf4").px(x + 1, y, "leaf2");
  p.px(18, 5, "gold2").px(19, 5, "oak3");
  selout(p, "blue2", "blue3");
}

function friedDough(p: Px, eaten = false) {
  // A sheet of greaseproof paper with one oil spot showing through.
  p.poly([[1, 6], [24, 2], [27, 9], [4, 13]], "cream5");
  p.over(() => { p.poly([[4, 13], [27, 9], [27, 10], [4, 14]], "cream3"); p.ellipse(20, 9, 2, 1, "oak5"); });
  // Half-finished: one stick gone, the other bitten short, crumbs of crust on the paper.
  const end = eaten ? 15 : 24;
  const sticks = part(28, 14, (q) => {
    tube(q, [[3.5, 9], [end, 9 - (end - 3.5) * 0.195]], (t) => 1.9 + 0.35 * Math.sin(t * 27), FRIED, [0.1, 0.34, 0.62, 0.88]);
    if (!eaten) tube(q, [[3, 6.5], [23.5, 2.5]], (t) => 1.9 + 0.35 * Math.sin(t * 27 + 2), FRIED, [0.1, 0.34, 0.62, 0.88]);
    if (!eaten) q.over(() => { for (let x = 4; x < 23; x++) q.px(x, Math.round(7.9 - (x - 3.5) * 0.195), x % 4 === 0 ? "gold1" : "orange1"); });
    // The bitten end: airy pale crumb.
    if (eaten) q.over(() => q.px(end - 1, 6, "cream4").px(end - 1, 7, "gold5").px(end - 2, 7, "cream4").px(end - 1, 8, "gold4"));
    selout(q, "wood2", "gold1");
  });
  p.blit(sticks, 0, 0);
  if (eaten) p.px(19, 8, "gold3").px(21, 6, "gold2").px(22, 7, "gold4");
}

function dumplings(p: Px, eaten = false) {
  plate(p, 21.5, 3.6, 4.2, 1.8, { rim: RIMS.plain, well: 0.7, thick: 1 });
  p.ellipse(21.7, 3.7, 2.6, 1, "brown1");
  p.px(23, 3, "red3");
  plate(p, 12, 9, 11.5, 4.8, { rim: RIMS.banded, well: 0.68 });
  // Half-finished: three left, a smear of vinegar where the others were dipped and dragged.
  if (eaten) p.over(() => p.rows(13, 7, [".sss..", "sSSsss", "..ss.."], { s: "wood3", S: "wood2" }));
  const spots = eaten ? ([[3, 4], [9, 3], [5, 8]] as const) : ([[3, 4], [9, 3], [15, 4], [5, 8], [11, 8], [17, 8]] as const);
  for (const [x, y] of spots) p.blit(part(7, 5, (q) => grid(q, 0, 0, MINI_DUMPLING, { ...DOUGH_KEY, g: "cream3" })), x, y);
  selout(p, "blue2", "blue3");
}

export default defineSprites({
  /** 包子: three buns in a small bamboo steamer with its lid off. */
  "food/bun": { w: 24, h: 18, anchor: [12, 17], draw: (p) => steamedBuns(p) },
  /** 馒头: two plain steamed breads on the dotted plate. */
  "food/bread": { w: 24, h: 16, anchor: [12, 15], draw: mantouPlate },
  /** 鸡蛋: a whole tea egg standing and a halved one in a plain dish. */
  "food/egg": { w: 22, h: 16, anchor: [11, 15], draw: teaEggs },
  /** 豆浆: soy milk in a ribbed glass on a saucer, spoon standing in it. */
  "food/milk": { w: 20, h: 21, anchor: [10, 20], draw: soyMilk },
  /** 粥: congee in the carp bowl with egg and scallion. */
  "food/porridge": { w: 24, h: 18, anchor: [12, 17], draw: congee },
  /** 油条: a twinned pair of fried dough sticks on greaseproof paper. */
  "food/youtiao": { w: 28, h: 15, anchor: [14, 14], draw: (p) => friedDough(p) },
  /** Mid-meal: one bun left on the liner. */
  "food/bun-eaten": { w: 24, h: 18, anchor: [12, 17], draw: (p) => steamedBuns(p, true) },
  /** Mid-meal: one stick left, bitten short. */
  "food/youtiao-eaten": { w: 28, h: 15, anchor: [14, 14], draw: (p) => friedDough(p, true) },
  /** Mid-meal: three dumplings left and a vinegar smear. */
  "food/dumpling-eaten": { w: 26, h: 16, anchor: [12, 15], draw: (p) => dumplings(p, true) },
  /** 饺子: six dumplings on the banded plate, a dish of black vinegar beside. */
  "food/dumpling": { w: 26, h: 16, anchor: [12, 15], draw: (p) => dumplings(p) },
});
