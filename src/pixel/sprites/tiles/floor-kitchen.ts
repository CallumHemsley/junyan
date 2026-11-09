/**
 * The kitchen floor: glazed ceramic squares, cream and jade in a checker, set in stone grout.
 * Laid when the shop opened; some squares have been replaced over the years and never quite matched.
 * Squares are 15px with 1px grout on their right and bottom (16px pitch), so every variant tiles with
 * every other. Tiles anchor at their top-left corner.
 *
 * Suggested mix: a ×5, b ×2, then c, d once each; e is the drain by the sink, f the grease by the stove.
 *
 * Threshold tiles are kitchen tiles with a brass strip let in along the edge that meets the oak:
 * `threshold-h` along the bottom (oak to the south), `threshold-v` along the left (oak to the west),
 * `threshold-corner` both (the kitchen's south-west tile).
 */
import { defineSprites, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

type Glaze = { lit: Color; face: Color; shade: Color; glint: Color };
const CREAM: Glaze = { lit: "cream5", face: "cream4", shade: "cream3", glint: "white" };
const JADE: Glaze = { lit: "jade6", face: "jade5", shade: "jade4", glint: "jade6" };
/** The replacement jade from a different batch: paler and a touch too minty. */
const WRONG_JADE: Glaze = { lit: "white", face: "jade6", shade: "jade5", glint: "white" };

/**
 * One glazed square with its grout. The glaze is lit along the top and down the start of the left
 * edge, pools a little darker along the bottom and right, and holds a small reflection of the window.
 */
function square(p: Px, x: number, y: number, g: Glaze, glint = 0, grout: Color = "stone4") {
  p.rect(x, y, 15, 15, g.face);
  p.hline(x, y, 14, g.lit).vline(x, y + 1, 4, g.lit).px(x + 1, y + 1, g.lit);
  p.hline(x + 1, y + 14, 14, g.shade).vline(x + 14, y + 5, 9, g.shade).px(x + 13, y + 13, g.shade);
  // The window's reflection, a little different in each square: hand-laid glaze is never flat.
  const glints = [
    ["..ww", ".w..", "w..."],
    ["...w", "..w.", ".w..", "w..."],
    [".ww.", "w...", "....", "w..."],
    ["..w", ".w.", "w.."],
  ];
  p.rows(x + 3, y + 2, glints[glint % glints.length], { w: g.glint });
  p.vline(x + 15, y, 16, grout).hline(x, y + 15, 16, grout);
}

function checker(p: Px) {
  square(p, 0, 0, CREAM, 0);
  square(p, 16, 0, JADE, 1);
  square(p, 0, 16, JADE, 2);
  square(p, 16, 16, CREAM, 3);
}

const K: Legend = {
  W: "white", C: "cream5", c: "cream4", k: "cream3", K: "cream2", m: "cream1",
  J: "jade6", j: "jade5", q: "jade4", Q: "jade3",
  g: "stone4", G: "stone3", s: "stone2", h: "stone5", B: "blue6", b: "blue5",
  y: "bamboo4", Y: "bamboo3", z: "bamboo2",
};

const BRASS: Legend = { L: "gold5", l: "gold4", m: "gold3", d: "gold2", D: "gold1" };
const STRIP_H = [
  "lllllllllllLLLLLLLLLLlllllllllll",
  "mmmmldmmmmmmLLLLLLLLmmmmmmldmmmm",
  "mmmmdDmmmmmmmLLLLLLmmmmmmmdDmmmm",
  "dddddddddddddddddddddddddddddddd",
];
const stripBottom = (p: Px) => block(p, 0, 28, STRIP_H, BRASS, "strip-h");
/** The same strip turned to run north–south: lit on its west edge, shaded on its east. */
function stripLeft(p: Px, rows = 32) {
  const cols = STRIP_H.map((r) => [...r]);
  const turned = Array.from({ length: rows }, (_, y) => {
    const lit = cols[0][y], a = cols[1][y], b = cols[2][y];
    return `${lit}${a}${b}d`;
  });
  block(p, 0, 0, turned, BRASS, "strip-v");
}

const tile = (draw: (p: Px) => void) => ({ w: 32, h: 32, anchor: [0, 0] as const, layer: "floor" as const, draw });

export default defineSprites({
  /** The clean checker. */
  "tile/floor-kitchen-a": tile(checker),

  /** One cream square crazed with a fine net of hairlines in the glaze, as old glaze does. */
  "tile/floor-kitchen-b": tile((p) => {
    checker(p);
    p.over(() => block(p, 17, 17, [
      "....k.........",
      "....k.....k...",
      "...k.kk..k....",
      "..k....kk.....",
      "kk......k.....",
      "........k..kk.",
      ".......k.kk...",
      "......k.......",
      "...kkk........",
      "..k...k.......",
      ".k.....k......",
      ".......k......",
    ], K, "crazing"));
  }),

  /** A cracked square someone filled with grout rather than replace: a grey seam with a lumpy edge. */
  "tile/floor-kitchen-c": tile((p) => {
    checker(p);
    p.over(() => block(p, 1, 1, [
      ".........G....",
      "........Gg....",
      ".......Gg.....",
      ".......G......",
      "......gG......",
      "......G.......",
      ".....gG.......",
      ".....G........",
      "....GGg.......",
      "...G..G.......",
      "..Gg...Gg.....",
      ".G......G.....",
      "G.......gG....",
      "..........G...",
    ], K, "filled-crack"));
  }),

  /** A jade square replaced from a different batch: a shade too pale, its grout still fresh. */
  "tile/floor-kitchen-d": tile((p) => {
    checker(p);
    square(p, 16, 0, WRONG_JADE, 0, "stone5");
    p.vline(15, 0, 16, "stone5");
  }),

  /** By the sink: a round floor drain set where four squares meet, its grate ringed with old grime. */
  "tile/floor-kitchen-e": tile((p) => {
    checker(p);
    block(p, 9, 10, [
      "....GGGGGG....",
      "..GGssssssGG..",
      ".GsshhhhhhssG.",
      "GsshssssssshsG",
      "GshsShShShShsG",
      "GshsShShShShsG",
      "GshsShShShShsG",
      "GsshssssssshsG",
      ".GsshhhhhhssG.",
      "..GGssssssGG..",
      "....GGGGGG....",
    ], { ...K, S: "steel1", h: "steel4", s: "steel3", G: "stone3" }, "drain");
    // Grime gathered in the grout lines leading to it.
    p.hline(5, 15, 4, "stone3").hline(23, 15, 4, "stone3").vline(15, 6, 4, "stone3").vline(15, 21, 4, "stone3");
  }),

  /** By the stove: a grease spot soaked into the grout, and a corner chipped off by a dropped wok. */
  "tile/floor-kitchen-f": tile((p) => {
    checker(p);
    block(p, 11, 10, [
      "......yyyy.......",
      "...yyyYYYYyy.....",
      ".yyYYYYzYYYYyy...",
      "..yyYYYYYYYYYyyy.",
      "....yyyYYYyyy....",
      ".........yy...y..",
    ], K, "grease");
    block(p, 27, 26, [
      "...Kk",
      "..Kmk",
      ".Kmmk",
      "kkkkk",
    ], K, "chip");
  }),

  "tile/threshold-h": tile((p) => { checker(p); stripBottom(p); }),
  "tile/threshold-v": tile((p) => { checker(p); stripLeft(p); }),
  "tile/threshold-corner": tile((p) => {
    checker(p);
    stripBottom(p);
    stripLeft(p, 28);
    // Mitre: the lit edges meet at the outside corner.
    block(p, 0, 28, ["lll.", "lmm.", "lmd.", "ddd."], BRASS, "mitre");
  }),
});
