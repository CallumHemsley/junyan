/**
 * The kitchen floor: plain glazed quarry squares behind the counter, plainer than the dining mosaic
 * so the two rooms read apart. 16px squares on stone grout in two close creams, laid in a loose
 * checker; a few catch the window in their glaze. Every variant tiles with every other.
 * Tiles anchor at their top-left corner.
 *
 * Suggested mix: a ×4, b ×2, g ×2, then c, d once each; e is the drain by the sink, f the grease by the stove.
 *
 * Threshold tiles are kitchen tiles with a dull brass strip, screwed to a wooden bed, along the edge
 * that meets the dining floor: `threshold-h` along the bottom (dining to the south), `threshold-v`
 * along the left (dining to the west), `threshold-corner` both (the kitchen's south-west tile).
 */
import { defineSprites, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

type Glaze = { lit: Color; face: Color; shade: Color };
const PALE: Glaze = { lit: "cream4", face: "cream3", shade: "cream2" };
const WARM: Glaze = { lit: "cream4", face: "stone5", shade: "stone4" };
/** The replacement square from a different batch: too white. */
const WRONG: Glaze = { lit: "cream5", face: "cream4", shade: "cream3" };

/**
 * The whole tile: four squares, pale and warm on the diagonals, lit along their top-left edges and
 * shaded on the bottom-right. `glints` lists which squares (0 top-left … 3 bottom-right) hold a small
 * reflection of the window. `glaze(i)` may swap one square's glaze.
 */
function squares(p: Px, glints: readonly number[] = [], glaze: (i: number) => Glaze | undefined = () => undefined, grout: (i: number) => Color = () => "stone3") {
  for (let i = 0; i < 4; i++) {
    const x0 = (i % 2) * 16, y0 = (i >> 1) * 16, g = glaze(i) ?? (i === 0 || i === 3 ? PALE : WARM);
    p.rect(x0, y0, 16, 16, g.face);
    p.hline(x0 + 1, y0 + 1, 14, g.lit).vline(x0 + 1, y0 + 2, 6, g.lit);
    p.hline(x0 + 2, y0 + 15, 14, g.shade).vline(x0 + 15, y0 + 8, 7, g.shade);
    p.hline(x0, y0, 16, grout(i)).vline(x0, y0, 16, grout(i));
  }
  const shine = [["..ww", ".w..", "w..."], ["..w", ".w.", "w.."]];
  for (const g of glints) p.rows((g % 2) * 16 + 5, (g >> 1) * 16 + 4, shine[g % 2], { w: "cream5" });
}

const K: Legend = {
  W: "white", C: "cream5", c: "cream4", k: "cream3", K: "cream2", m: "cream1",
  g: "stone4", G: "stone3", s: "stone2", h: "stone5",
  y: "bamboo4", Y: "bamboo3", z: "bamboo2",
};

/** Dull brass on a wooden bed: polished bright only in the middle where feet cross it. */
const BRASS: Legend = { L: "gold4", l: "gold3", m: "gold2", d: "gold1", w: "wood2" };
const STRIP_H = [
  "mmmllmmmmmmlLLLLLLLLlmmmmmmllmmm",
  "mmmmlmmmmmmmlLLLLLLlmmmmmmmlmmmm",
  "ddddddddddddddlllddddddddddddddd",
  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
];
/** Screw heads, two per strip: a slot across a lit dome. */
const SCREWS = [5, 26];
function stripBottom(p: Px) {
  block(p, 0, 28, STRIP_H, BRASS, "strip-h");
  for (const x of SCREWS) p.px(x, 29, "gold3").px(x + 1, 29, "gold1").px(x, 30, "gold1");
}
/** The same strip turned to run north–south: the wooden bed on its east side, against the tiles. */
function stripLeft(p: Px, rows = 32) {
  for (let y = 0; y < rows; y++) {
    const polished = y >= 11 && y <= 20;
    p.px(0, y, polished ? "gold4" : y % 9 === 3 ? "gold3" : "gold2");
    p.px(1, y, polished ? "gold3" : "gold2");
    p.px(2, y, polished && y > 13 && y < 18 ? "gold3" : "gold1");
    p.px(3, y, "wood2");
  }
  for (const y of SCREWS) if (y < rows) p.px(1, y, "gold3").px(1, y + 1, "gold1").px(2, y, "gold1");
}

const tile = (draw: (p: Px) => void) => ({ w: 32, h: 32, anchor: [0, 0] as const, layer: "floor" as const, draw });

export default defineSprites({
  /** Clean, one square catching the window. */
  "tile/floor-kitchen-a": tile((p) => squares(p, [0])),

  /** Clean, the window caught in another square. */
  "tile/floor-kitchen-g": tile((p) => squares(p, [3])),

  /** One square crazed with a fine net of hairlines in its glaze, as old glaze does. */
  "tile/floor-kitchen-b": tile((p) => {
    squares(p, []);
    p.over(() => block(p, 19, 18, [
      "...K.........",
      "...K....K....",
      "..K.KK.K.....",
      ".K....K......",
      "K.....K...K..",
      "......K.KK...",
      ".....K.K.....",
      "...KK........",
      "..K..K.......",
      ".K....K......",
    ], K, "crazing"));
  }),

  /** A cracked square someone filled with grout rather than replace: a grey seam with a lumpy edge. */
  "tile/floor-kitchen-c": tile((p) => {
    squares(p, [1]);
    p.over(() => block(p, 3, 2, [
      "........G.",
      ".......Gg.",
      "......Gg..",
      "......G...",
      ".....gG...",
      ".....G....",
      "....gG....",
      "....G.....",
      "...GGg....",
      "..G..G....",
      ".Gg...Gg..",
      "G.......G.",
    ], K, "filled-crack"));
  }),

  /** One square replaced from a different batch: too white, its grout still fresh. */
  "tile/floor-kitchen-d": tile((p) => squares(p, [2], (i) => (i === 1 ? WRONG : undefined), (i) => (i === 1 ? "stone5" : "stone3"))),

  /** By the sink: a round floor drain set where four squares meet, its grate ringed with old grime. */
  "tile/floor-kitchen-e": tile((p) => {
    squares(p, []);
    block(p, 9, 11, [
      "....GGGGGG....",
      "..GGssssssGG..",
      ".GsshhhhhhssG.",
      "GsshSSSSSSshsG",
      "GshShShShShhsG",
      "GshShShShShhsG",
      "GsshSSSSSShssG",
      ".GsshhhhhhssG.",
      "..GGssssssGG..",
      "....GGGGGG....",
    ], { ...K, S: "steel1", h: "steel4", s: "steel3", G: "stone3" }, "drain");
    // Grime gathered in the grout lines leading to it.
    p.hline(3, 16, 5, "stone3").hline(24, 16, 5, "stone3").vline(16, 4, 6, "stone3").vline(16, 22, 6, "stone3");
  }),

  /** By the stove: a grease spot soaked into the glaze and grout, and a square's corner chipped by a dropped wok. */
  "tile/floor-kitchen-f": tile((p) => {
    squares(p, [0]);
    block(p, 18, 4, [
      ".....yyyy...",
      "..yyyYYYyy..",
      ".yYYYzYYYYy.",
      "..yyYYYYyyy.",
      "....yyy.....",
      "..........y.",
    ], K, "grease");
    block(p, 26, 26, ["..KK", ".Kmk", "Kmkk"], K, "chip");
  }),

  "tile/threshold-h": tile((p) => { squares(p, []); stripBottom(p); }),
  "tile/threshold-v": tile((p) => { squares(p, []); stripLeft(p); }),
  "tile/threshold-corner": tile((p) => {
    squares(p, []);
    stripBottom(p);
    stripLeft(p, 28);
    block(p, 0, 28, ["mmm", "mmm", "ddd"], BRASS, "mitre");
  }),
});
