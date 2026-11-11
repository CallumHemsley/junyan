/**
 * Food on the waiter's tray, ids `food/tray-<foodId>/<action>-down`: the seven dishes at tray scale
 * (about half a table serving), small enough that three fit on the board between the waiter's
 * thumbs. Each keeps its table serving's crockery and silhouette so the two read as the same dish:
 * the bamboo steamer, the dotted mantou plate, the tea-egg dish, the ribbed soy-milk glass, the carp
 * congee bowl, the youtiao on greaseproof paper, the banded dumpling plate.
 *
 * They are drawn as actors beside the waiter (`trayActors` in `src/world/pixel/cafe.ts` places
 * them), so each one animates on the waiter's `carry-idle` and `carry-walk` beats and rides the same
 * body bob as the tray in his hands (`carryBob` in `char/_hero-poses.ts`), on the same number of
 * frames at the same fps. Every sprite is a 12×12 box with the dish centred and its bottom on the
 * anchor row, one spare row above and below for the bob. Every dish is 11 wide with
 * the anchor on its middle column, so a left-facing layout mirrors a right-facing offset `dx` to
 * `-1 - dx` (the waiter's frame is symmetric about the edge between columns 15 and 16).
 */
import { defineSprites, type Legend, type Px, type SpriteSet } from "../../kit/index.ts";
import { HERO_ACTIONS, carryBob, type HeroAction } from "../char/_hero-poses.ts";

/** Sprite box, art pixels: exactly one dish wide. The dish's bottom row sits on `BASE` when the body is level. */
export const CARRIED_BOX = { w: 11, h: 12 } as const;
const BASE = 10;
/** The actions the waiter carries with; each tray dish follows the same frames. */
export const CARRY_ACTIONS = ["carry-idle", "carry-walk"] as const satisfies readonly HeroAction[];

const DOUGH = { k: "oak2", K: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3" } as const;
const BAMBOO = { a: "bamboo1", b: "bamboo2", c: "bamboo3", d: "bamboo4", e: "bamboo5" } as const;
const CHINA = { o: "blue2", u: "blue3", U: "blue4", w: "white", v: "cream5", V: "cream4", n: "blue5" } as const;

type Dish = { rows: readonly string[]; legend: Legend };

/** 包子: two pleated buns peeping over the rim of a lidless steamer, rattan binding round its foot. */
const BUN: Dish = {
  rows: [
    "..kkk.kkk..",
    ".kW54kW54K.",
    "bk5W4k5W4Kb",
    "beeeeeeeedb",
    "adcdcdcdcca",
    "acdcdcdcdba",
    "abbbbbbbbba",
    ".aaaaaaaaa.",
  ],
  legend: { ...DOUGH, ...BAMBOO },
};

/** 馒头: two smooth steamed breads, no pleats, on a white plate with a dotted blue rim. */
const BREAD: Dish = {
  rows: [
    ".kkkk.kkkk.",
    "kWW55kWW55K",
    "kW554kW554K",
    "k5543k5543K",
    "oK33KKK33Ko",
    "owKKwwwKKwo",
    ".ounununuo.",
    "..ooooooo..",
  ],
  legend: { ...DOUGH, ...CHINA },
};

/** 茶叶蛋: two peeled tea eggs, netted with brown cracks, in a plain little dish with a puddle of brine. */
const EGG: Dish = {
  rows: [
    "..kkk.kkk..",
    ".k1c2k1c2K.",
    ".kc12kc23K.",
    ".k21ck2c3K.",
    "ok232k323Ko",
    "owKKKwKKKwo",
    ".ouwwwwwuo.",
    "..ooooooo..",
  ],
  legend: { ...CHINA, k: "wood2", K: "wood2", "1": "oak5", "2": "oak4", "3": "oak3", c: "cream4" },
};

/** 豆浆: soy milk in a ribbed glass on a banded saucer, the spoon handle standing out of it. */
const MILK: Dish = {
  rows: [
    "......oo...",
    ".ggggobog..",
    "gWWwwbowWg.",
    "gW5555554g.",
    "gw5355354g.",
    "gw5355354g.",
    "gw5355354g.",
    "ogw44444goo",
    "oUuuggguuuo",
    ".ooooooooo.",
  ],
  legend: { ...DOUGH, ...CHINA, g: "steel3", b: "white" },
};

/** 粥: white congee in the blue-collared carp bowl, a dark nugget of century egg and green scallion. */
const PORRIDGE: Dish = {
  rows: [
    ".ooooooooo.",
    "owvvvvvvvwo",
    "ouWvlpvvlVu",
    "ouuvvppvVuu",
    "ouuuuuuuuuo",
    ".owwwuwwwo.",
    ".owuwwwwwo.",
    "..ouuuuuo..",
    "...ooooo...",
  ],
  legend: { ...CHINA, W: "white", l: "leaf4", p: "brown1" },
};

/** 油条: two golden fried-dough sticks, twinned, lying on a square of greaseproof paper. */
const YOUTIAO: Dish = {
  rows: [
    "..ffffffff.",
    ".fGgGGgGGgf",
    "ffhhhhhhhhf",
    "fGgGGgGGgf.",
    "fhhhghhhhfq",
    "pffffffffpq",
    "qpppppppppq",
    ".qqqqqqqqq.",
  ],
  legend: { f: "orange1", g: "gold3", G: "gold5", h: "gold2", p: "cream5", q: "cream3" },
};

/** 饺子: three crescent dumplings, pleats up, on a plate with a blue band. */
const DUMPLING: Dish = {
  rows: [
    ".kkkk.kkkk.",
    "kWW55kWW54K",
    "K5kkkkkkk4K",
    "okWWW5554Ko",
    "owK54443Kwo",
    ".ouKKKKKuo.",
    "..ooooooo..",
  ],
  legend: { ...DOUGH, ...CHINA },
};

export const CARRIED_DISHES: Readonly<Record<string, Dish>> = {
  bun: BUN, bread: BREAD, egg: EGG, milk: MILK, porridge: PORRIDGE, youtiao: YOUTIAO, dumpling: DUMPLING,
};

/** Draw a dish filling the box's width with its bottom row on `BASE + bob`. */
function drawDish(p: Px, dish: Dish, bob: number) {
  p.rows(0, BASE + bob - dish.rows.length + 1, dish.rows, dish.legend);
}

const sprites: SpriteSet = {};
for (const [foodId, dish] of Object.entries(CARRIED_DISHES)) {
  if (dish.rows.some((row) => row.length !== CARRIED_BOX.w)) throw new Error(`food/tray-${foodId}: every row must be ${CARRIED_BOX.w} wide`);
  if (dish.rows.length > BASE) throw new Error(`food/tray-${foodId}: at most ${BASE} rows`);
  for (const action of CARRY_ACTIONS) {
    const bob = carryBob(action);
    sprites[`food/tray-${foodId}/${action}-down`] = {
      ...CARRIED_BOX,
      anchor: [(CARRIED_BOX.w - 1) / 2, BASE],
      frames: bob.length,
      fps: HERO_ACTIONS[action].fps,
      draw: (p, frame) => drawDish(p, dish, bob[frame]),
    };
  }
}

export default defineSprites(sprites);
