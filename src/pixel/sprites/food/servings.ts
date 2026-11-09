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
import { bowl, plate, RIMS, steamer, surface, type BodyPattern } from "./_ware.ts";

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

function steamedBuns(p: Px) {
  const basket = part(24, 18, (q) => steamer(q, 12, 9, 11, 4.5, 5, "back", [5, 17]));
  p.blit(selout(basket, "bamboo1", "bamboo2"), 0, 0);
  for (const [x, y] of [[2, 2], [13, 2], [7, 5]] as const) p.blit(part(9, 7, (q) => grid(q, 0, 0, MINI_BUN, DOUGH_KEY)), x, y);
  steamer(p, 12, 9, 11, 4.5, 5, "front");
}

function mantouPlate(p: Px) {
  plate(p, 12, 10, 11, 4.6, { rim: RIMS.dotted, well: 0.62, thick: 2 });
  p.over(() => { p.ellipse(8, 11, 5, 1.4, "blue5"); p.ellipse(16, 13, 5, 1.4, "blue5"); });
  p.blit(part(10, 7, (q) => grid(q, 0, 0, MINI_MANTOU, DOUGH_KEY)), 2, 4);
  p.blit(part(10, 7, (q) => grid(q, 0, 0, MINI_MANTOU, DOUGH_KEY)), 11, 6);
  selout(p, "blue2", "blue3");
}

function teaEggs(p: Px) {
  plate(p, 11, 9, 10, 4.2, { rim: RIMS.wave, well: 0.7 });
  p.ellipse(11.5, 10, 6, 2, "wood2");
  grid(p, 3, 3, [
    "..cccc..",
    ".chhv5o.",
    "c5vh5v4o",
    "c45v4v3o",
    ".o3v32o.",
    "..oooo..",
  ], { c: "wood3", o: "brown1", h: "cream5", "5": "cream4", "4": "oak5", "3": "oak4", "2": "oak3", v: "wood4" });
  grid(p, 11, 5, [
    "..cccc..",
    ".cWwwbo.",
    "cbwyywbo",
    "obwYYwbo",
    ".oeeeeo.",
    "..oooo..",
  ], { c: "oak2", o: "wood3", b: "oak3", W: "white", w: "cream5", y: "gold4", Y: "gold3", e: "oak4" });
  selout(p, "blue2", "blue3");
}

/** The milk bowl's pattern at table scale: a line under the lip, a row of blooms, a foot band. */
const smallPeony = (depth: number): BodyPattern => (u, t, lit) => {
  const py = t * depth, ink = lit ? "blue3" : "blue2";
  if (py > 0.8 && py < 1.8) return ink;
  if (py > 3.2 && py < 5.2 && Math.abs(((u + 1) * 3) % 1 - 0.5) < 0.18) return lit ? "blue2" : "blue1";
  if (py > 3.6 && py < 4.8 && Math.abs(((u + 1) * 3) % 1 - 0.5) < 0.34) return ink;
  if (py > depth - 1) return ink;
  return undefined;
};

function soyMilk(p: Px) {
  bowl(p, 11, 5, 10, 3.8, 9, { belly: 0.8, body: smallPeony(9) });
  surface(p, 11.3, 5.6, 8.4, 2.6, ["cream3", "cream4", "cream5"]);
  p.hline(5, 5, 3, "white");
  grid(p, 14, 0, ["...oo", "..obo", ".obo.", "obWo.", ".oo.."], { o: "blue2", b: "blue3", W: "white" });
  selout(p, "blue2", "blue3");
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

function friedDough(p: Px) {
  // A sheet of greaseproof paper with one oil spot showing through.
  p.poly([[1, 6], [24, 2], [27, 9], [4, 13]], "cream5");
  p.over(() => { p.poly([[4, 13], [27, 9], [27, 10], [4, 14]], "cream3"); p.ellipse(20, 9, 2, 1, "oak5"); });
  const sticks = part(28, 14, (q) => {
    tube(q, [[3.5, 9], [24, 5]], (t) => 1.9 + 0.35 * Math.sin(t * 27), FRIED, [0.1, 0.34, 0.62, 0.88]);
    tube(q, [[3, 6.5], [23.5, 2.5]], (t) => 1.9 + 0.35 * Math.sin(t * 27 + 2), FRIED, [0.1, 0.34, 0.62, 0.88]);
    q.over(() => { for (let x = 4; x < 23; x++) q.px(x, Math.round(7.9 - (x - 3.5) * 0.195), x % 4 === 0 ? "gold1" : "orange1"); });
    selout(q, "wood2", "gold1");
  });
  p.blit(sticks, 0, 0);
}

function dumplings(p: Px) {
  plate(p, 21.5, 3.6, 4.2, 1.8, { rim: RIMS.plain, well: 0.7, thick: 1 });
  p.ellipse(21.7, 3.7, 2.6, 1, "brown1");
  p.px(23, 3, "red3");
  plate(p, 12, 9, 11.5, 4.8, { rim: RIMS.banded, well: 0.68 });
  for (const [x, y] of [[3, 4], [9, 3], [15, 4], [5, 8], [11, 8], [17, 8]] as const)
    p.blit(part(7, 5, (q) => grid(q, 0, 0, MINI_DUMPLING, { ...DOUGH_KEY, g: "cream3" })), x, y);
  selout(p, "blue2", "blue3");
}

export default defineSprites({
  /** 包子: three buns in a small bamboo steamer with its lid off. */
  "food/bun": { w: 24, h: 18, anchor: [12, 17], draw: steamedBuns },
  /** 馒头: two plain steamed breads on the dotted plate. */
  "food/bread": { w: 24, h: 16, anchor: [12, 15], draw: mantouPlate },
  /** 鸡蛋: a whole and a halved tea egg in the wave-rim dish with a little tea. */
  "food/egg": { w: 22, h: 15, anchor: [11, 14], draw: teaEggs },
  /** 豆浆: soy milk in the peony bowl, spoon in. */
  "food/milk": { w: 22, h: 19, anchor: [11, 18], draw: soyMilk },
  /** 粥: congee in the carp bowl with egg and scallion. */
  "food/porridge": { w: 24, h: 18, anchor: [12, 17], draw: congee },
  /** 油条: a twinned pair of fried dough sticks on greaseproof paper. */
  "food/youtiao": { w: 28, h: 15, anchor: [14, 14], draw: friedDough },
  /** 饺子: six dumplings on the banded plate, a dish of black vinegar beside. */
  "food/dumpling": { w: 26, h: 16, anchor: [12, 15], draw: dumplings },
});
