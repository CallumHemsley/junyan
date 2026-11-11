/**
 * Crates stacked against the lane walls: the bistro's empties waiting for the bottle man, the
 * grocer's spare boxes, cardboard flattened and tied for the old man who collects it. One sprite per
 * map instance, sized to its footprint; the stacks differ by instance, not by variant alone.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { mapProps, propSpriteId } from "../../world/maps.ts";
import {
  BLUE, BROWN_GLASS, GREEN_GLASS, JADE, art, autoOutline, bottleNeck, cardboardPile, plasticCrate, seedOf,
  townFoot, townFrame, woodCrate, type Ramp,
} from "./_helpers.ts";

/** Faded yellow beer-crate plastic. */
const YELLOW: Ramp = ["gold1", "gold2", "gold3", "gold4"];

/** A crate's well filled with bottle necks in two staggered rows; `gap` leaves one slot empty. */
function bottles(p: Px, x: number, y: number, w: number, glass: Ramp, gap = -1, capless = false): void {
  let k = 0;
  for (let row = 0; row < 2; row++)
    for (let bx = x + 1 + row * 2; bx + 3 <= x + w; bx += 5, k++) {
      if (k === gap) continue;
      bottleNeck(p, bx, y - 6 + row * 2, 7, glass, capless ? null : row ? "steel5" : "steel4");
    }
}

/** A standing empty bottle on the ground, 5×14, its foot at (x, y). */
function standingBottle(p: Px, x: number, y: number, glass: Ramp): void {
  art(p, x, y - 13, [
    ".12.",
    ".13.",
    ".13.",
    ".13.",
    "1134",
    "2344",
    "2344",
    "2333",
    "2333",
    "2333",
    "2333",
    "2333",
    "1222",
    ".11.",
  ], { "1": glass[0], "2": glass[1], "3": glass[2], "4": glass[4] });
}

type Stack = (p: Px, w: number, g: number, seed: number) => void;

/**
 * The bistro's empties, two stacks wide: a wooden crate under a blue crate of green beer bottles
 * (one missing, drunk on the step by the cook), two yellow crates beside them, and a stack of
 * flattened cartons tied with string, left for the cardboard man.
 */
const longA: Stack = (p, w, g, seed) => {
  woodCrate(p, 1, g - 22, 26, 5, 17, { seed });
  const top = plasticCrate(p, 2, g - 37, 24, 4, 11, BLUE);
  bottles(p, top.wellX, top.wellY + 1, top.wellW, GREEN_GLASS, 3);
  plasticCrate(p, 28, g - 15, 22, 4, 11, YELLOW);
  const y2 = plasticCrate(p, 29, g - 29, 22, 4, 10, YELLOW);
  bottles(p, y2.wellX, y2.wellY + 1, y2.wellW, BROWN_GLASS, -1, true);
  cardboardPile(p, 52, g - 11, Math.min(18, w - 53), 3, seed);
  standingBottle(p, w - 6, g, GREEN_GLASS);
};

/**
 * The grocer's corner: a jade crate under a wooden one set down crooked, a bundle of cartons
 * leaning on them, and a plastic crate of empty soy-sauce bottles to go back to the wholesaler.
 */
const longB: Stack = (p, w, g, seed) => {
  cardboardPile(p, 2, g - 14, 20, 4, seed + 3);
  plasticCrate(p, 22, g - 16, 22, 4, 12, JADE);
  // The wooden crate on top, pushed back and a little skew: its left rail sits one pixel higher.
  woodCrate(p, 23, g - 34, 21, 5, 13, { seed: seed + 1, slats: 2 });
  p.px(23, g - 34, null).px(43, g - 34, "oak2");
  const t = plasticCrate(p, 45, g - 16, Math.min(18, w - 46), 4, 12, BLUE);
  bottles(p, t.wellX, t.wellY + 1, t.wellW, BROWN_GLASS, 1);
  // A bottle-crate's twin: a lone bottle on the wooden crate's top.
  standingBottle(p, 30, g - 34, BROWN_GLASS);
};

/** Single tile: a wooden crate of brown vinegar bottles under a sheet of folded cardboard. */
const shortA: Stack = (p, w, g, seed) => {
  woodCrate(p, 2, g - 18, w - 4, 5, 13, { seed, slats: 2 });
  bottles(p, 4, g - 17, w - 8, BROWN_GLASS, 2);
  // A carton flap thrown over half the crate.
  art(p, 12, g - 22, [
    "....oooooooooooo",
    "..ooOOOOOOOOOOod",
    "ooOOOOOOOOOOOood",
    "ddddddddddddddd.",
  ], { o: "oak4", O: "oak5", d: "oak2" });
};

/** Single tile: a blue crate on a yellow one, a green bottle left standing on top. */
const shortB: Stack = (p, w, g) => {
  plasticCrate(p, 3, g - 14, w - 6, 4, 10, YELLOW);
  const t = plasticCrate(p, 3, g - 27, w - 6, 4, 9, BLUE, { slots: true });
  standingBottle(p, 18, t.wellY + 3, GREEN_GLASS);
  // A cigarette-box sized square of cardboard tucked in the slot of the lower crate.
  p.rect(9, g - 9, 4, 3, "oak4").hline(9, g - 9, 4, "oak5");
};

const STACKS: Record<string, Stack> = {
  "town.crates-0": longA,
  "town.crates-1": longB,
  "town.crates-2": shortA,
  "town.crates-3": shortB,
};

export default defineSprites(Object.fromEntries(mapProps("all", "crates").map((prop, i) => {
  const f = townFrame(prop, f0Rise(prop.width));
  const stack = STACKS[prop.id] ?? (prop.width > 1.5 ? (i % 2 ? longB : longA) : i % 2 ? shortB : shortA);
  return [propSpriteId(prop.map, prop.id), {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: Math.round(f.w / 2) - 1, ry: 4, dy: -4 },
    draw: (p: Px) => {
      stack(p, f.w, f.gy, seedOf(prop.id));
      autoOutline(p, { map: { oak: "wood1", gold: "wood1", jade: "jade1", blue: "blue1", cream: "ink2", rose: "rose1", wood: "wood1" } });
    },
  }];
})));

/** Long stacks are two crates high; single-tile stacks a little less. */
function f0Rise(width: number): number {
  return width > 1.5 ? 18 : 14;
}
