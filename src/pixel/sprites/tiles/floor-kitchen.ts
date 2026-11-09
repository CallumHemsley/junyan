/**
 * Kitchen floor: small glazed ceramic squares, cream and jade in a checker, on a stone grout grid.
 * Squares are 7px with 1px grout on their right and bottom (8px pitch), so every variant tiles with
 * every other. Tiles anchor at their top-left corner.
 *
 * Threshold tiles are kitchen tiles with a brass strip let in along the edge that meets the oak:
 * `threshold-h` along the bottom (oak to the south), `threshold-v` along the left (oak to the west),
 * `threshold-corner` both (the kitchen's south-west tile).
 */
import { defineSprites, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

/** Cream: W glint, C lit bevel, c body, k shade bevel, K crack. Jade: J lit, j body, q shade, Q deep. Grout g, wet G, fresh h. */
const CERAMIC: Legend = {
  W: "white", C: "cream5", c: "cream4", k: "cream3", K: "cream2",
  J: "jade6", j: "jade5", q: "jade4", Q: "jade3",
  g: "stone4", G: "stone3", h: "stone5",
  B: "blue6", y: "bamboo4", Y: "bamboo3",
};

const CREAM = [
  "CCCCCccg",
  "CWcccccg",
  "Cccccccg",
  "cccccccg",
  "cccccckg",
  "cccccckg",
  "ckkkkkkg",
  "gggggggg",
];
const JADE = CREAM.map((row) => row.replace(/C/g, "J").replace(/W/g, "J").replace(/c/g, "j").replace(/k/g, "q"));

/** The clean checker: cream top-left and bottom-right, jade on the other diagonal. */
function checker(p: Px) {
  block(p, 0, 0, 8, 8, CREAM, CERAMIC, "cream");
  block(p, 8, 0, 8, 8, JADE, CERAMIC, "jade");
  block(p, 0, 8, 8, 8, JADE, CERAMIC, "jade");
  block(p, 8, 8, 8, 8, CREAM, CERAMIC, "cream");
}

const square = (p: Px, x: number, y: number, rows: readonly string[], name: string) => block(p, x, y, 8, 8, rows, CERAMIC, name);

/** Brass strip legend: lit edge, body, front face, deep shadow, worn bright, screw. */
const BRASS: Legend = { L: "gold5", l: "gold4", m: "gold3", d: "gold2", D: "gold1" };

function stripBottom(p: Px) {
  block(p, 0, 13, 16, 3, [
    "llllLLLLLLllllll",
    "mmmDmmmLLmmmDmmm",
    "dddddddddddddddd",
  ], BRASS, "strip-h");
}
function stripLeft(p: Px, rows = 16) {
  const col = ["lmd", "lmd", "lmd", "lDd", "lmd", "Lmd", "LLd", "LLd", "LLd", "Lmd", "lmd", "lDd", "lmd", "lmd", "lmd", "lmd"];
  block(p, 0, 0, 3, rows, col.slice(0, rows), BRASS, "strip-v");
}

const tile = (draw: (p: Px) => void) => ({ w: 16, h: 16, anchor: [0, 0] as const, layer: "floor" as const, draw });

export default defineSprites({
  /** Clean checker. */
  "tile/floor-kitchen-a": tile(checker),

  /** A cream square with a hairline crack and a chipped corner. */
  "tile/floor-kitchen-b": tile((p) => {
    checker(p);
    square(p, 0, 0, [
      "CCKCCccg",
      "CWKccccg",
      "CccKcccg",
      "cccKcccg",
      "cccKKckg",
      "ccKcckKg",
      "ckKkkkGg",
      "gggggggg",
    ], "cracked");
  }),

  /** A darker jade square: a replacement that never quite matched. */
  "tile/floor-kitchen-c": tile((p) => {
    checker(p);
    square(p, 0, 8, [
      "jjjjjqqg",
      "jjqqqqqg",
      "jqqqqqqg",
      "qqqqqqqg",
      "qqqqqqQg",
      "qqqqqqQg",
      "qQQQQQQg",
      "gggggggg",
    ], "replaced");
  }),

  /** A damp patch: wet glaze and grout a step darker, the window's light caught along its edge. */
  "tile/floor-kitchen-d": tile((p) => {
    checker(p);
    const wet: Partial<Record<string, "cream3" | "jade4" | "stone3" | "jade3" | "cream2">> = {
      white: "cream3", cream5: "cream3", cream4: "cream3", cream3: "cream2", jade6: "jade4", jade5: "jade4", jade4: "jade3", stone4: "stone3",
    };
    const mask = [
      "................",
      "................",
      "................",
      ".......####.....",
      ".....########...",
      "....##########..",
      "...###########..",
      "...############.",
      "....###########.",
      ".....#########..",
      "......######....",
      "........###.....",
      "................",
      "................",
      "................",
      "................",
    ];
    p.each((x, y, c) => (mask[y][x] === "#" && c && wet[c] ? (wet[c] as never) : undefined));
    // The sheen: a broken lit rim on the upper-left edge of the water.
    block(p, 0, 0, 16, 16, [
      "................",
      "................",
      "................",
      "................",
      ".......WW.......",
      ".....B..........",
      "....W...........",
      "................",
      "....B...........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ], CERAMIC, "sheen");
  }),

  /** A grease spot by the stove, soaked into the grout. */
  "tile/floor-kitchen-e": tile((p) => {
    checker(p);
    block(p, 0, 0, 16, 16, [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      ".........yy.....",
      "........yYYy....",
      ".........yYyy...",
      "..........yy....",
      "................",
      "............y...",
      "................",
      "................",
      "................",
    ], CERAMIC, "grease");
  }),

  "tile/threshold-h": tile((p) => { checker(p); stripBottom(p); }),
  "tile/threshold-v": tile((p) => { checker(p); stripLeft(p); }),
  "tile/threshold-corner": tile((p) => { checker(p); stripBottom(p); stripLeft(p, 13); p.px(0, 13, "gold4").px(1, 13, "gold4").px(2, 14, "gold3"); }),
});
