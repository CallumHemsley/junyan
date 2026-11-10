/**
 * The kitchen floor: cream octagon tiles with small jade diamond insets where four octagons meet,
 * the classic old-shop pattern, laid when the shop opened. Quiet on purpose: the stove and counter
 * stand on it. Octagons sit on a 16px pitch with 1px stone grout; a few catch the window in their glaze.
 * Every variant tiles with every other. Tiles anchor at their top-left corner.
 *
 * Suggested mix: a ×4, b ×2, g ×2, then c, d once each; e is the drain by the sink, f the grease by the stove.
 *
 * Threshold tiles are kitchen tiles with a dull brass strip, screwed to a wooden bed, along the edge
 * that meets the oak: `threshold-h` along the bottom (oak to the south), `threshold-v` along the left
 * (oak to the west), `threshold-corner` both (the kitchen's south-west tile).
 */
import { defineSprites, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

type Kind = "octagon" | "diamond" | "grout";
type Inset = { lit: Color; face: Color; shade: Color };
const JADE: Inset = { lit: "jade5", face: "jade4", shade: "jade3" };
/** The replacement diamond from a different batch: a shade too pale and minty. */
const WRONG_JADE: Inset = { lit: "jade6", face: "jade5", shade: "jade4" };

/** What sits at tile pixel (x, y): a diamond centred on every 16px grid corner, grout, or octagon. */
function kindAt(x: number, y: number): Kind {
  const u = ((x % 16) + 16) % 16, v = ((y % 16) + 16) % 16;
  const du = u <= 8 ? u : u - 16, dv = v <= 8 ? v : v - 16;
  const md = Math.abs(du) + Math.abs(dv);
  if (md <= 3) return "diamond";
  if (md === 4 || u === 0 || v === 0) return "grout";
  return "octagon";
}

/**
 * The whole tile. Octagons are lit along the edges that face up and left (they meet grout there) and
 * shaded along the edges facing down and right. `glints` lists which of the four octagons (0 top-left,
 * 1 top-right, 2 bottom-left, 3 bottom-right) hold a small window reflection.
 */
function octagons(p: Px, glints: readonly number[] = [], inset: (cx: number, cy: number) => Inset = () => JADE) {
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const k = kindAt(x, y);
    if (k === "grout") { p.px(x, y, "stone4"); continue; }
    if (k === "diamond") {
      const cx = Math.round(x / 16) * 16, cy = Math.round(y / 16) * 16;
      const ins = inset(cx % 32, cy % 32);
      const du = x - cx, dv = y - cy, md = Math.abs(du) + Math.abs(dv);
      p.px(x, y, md === 3 && du + dv < 0 ? ins.lit : md === 3 && du + dv > 0 ? ins.shade : ins.face);
      continue;
    }
    const upLeft = kindAt(x, y - 1) !== "octagon" || kindAt(x - 1, y) !== "octagon";
    const downRight = kindAt(x, y + 1) !== "octagon" || kindAt(x + 1, y) !== "octagon";
    p.px(x, y, upLeft ? "cream4" : downRight ? "cream2" : "cream3");
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
  /** Clean, one octagon catching the window. */
  "tile/floor-kitchen-a": tile((p) => octagons(p, [0])),

  /** Clean, the window caught in another octagon. */
  "tile/floor-kitchen-g": tile((p) => octagons(p, [3])),

  /** One octagon crazed with a fine net of hairlines in its glaze, as old glaze does. */
  "tile/floor-kitchen-b": tile((p) => {
    octagons(p, []);
    p.over(() => block(p, 19, 18, [
      "...k.........",
      "...k....k....",
      "..k.kk.k.....",
      ".k....k......",
      "k.....k...k..",
      "......k.kk...",
      ".....k.k.....",
      "...kk........",
      "..k..k.......",
      ".k....k......",
    ], K, "crazing"));
  }),

  /** A cracked octagon someone filled with grout rather than replace: a grey seam with a lumpy edge. */
  "tile/floor-kitchen-c": tile((p) => {
    octagons(p, [1]);
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

  /** One jade diamond replaced from a different batch: too pale, its grout ring still fresh. */
  "tile/floor-kitchen-d": tile((p) => {
    octagons(p, [2], (cx, cy) => (cx === 16 && cy === 16 ? WRONG_JADE : JADE));
    for (let y = 11; y < 22; y++) for (let x = 11; x < 22; x++) if (Math.abs(x - 16) + Math.abs(y - 16) === 4) p.px(x, y, "stone5");
  }),

  /** By the sink: a round floor drain set where four octagons meet, its grate ringed with old grime. */
  "tile/floor-kitchen-e": tile((p) => {
    octagons(p, []);
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

  /** By the stove: a grease spot soaked into the glaze and grout, and an octagon corner chipped by a dropped wok. */
  "tile/floor-kitchen-f": tile((p) => {
    octagons(p, [0]);
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

  "tile/threshold-h": tile((p) => { octagons(p, []); stripBottom(p); }),
  "tile/threshold-v": tile((p) => { octagons(p, []); stripLeft(p); }),
  "tile/threshold-corner": tile((p) => {
    octagons(p, []);
    stripBottom(p);
    stripLeft(p, 28);
    block(p, 0, 28, ["mmm", "mmm", "ddd"], BRASS, "mitre");
  }),
});
