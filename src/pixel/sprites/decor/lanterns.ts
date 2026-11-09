/**
 * Red paper lanterns. They hang above everyone (layer `over`); the anchor is the hook at the
 * top of the cord, so place them at the ceiling or lintel point they hang from.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art } from "./_helpers.ts";

/** Paper bodies, hand-shaded: digits run red2 (1) to gold4 (5), lit on the upper-left shoulder. */
const BODY_BIG = [
  "....oooooo....",
  "..oo443322oo..",
  ".o3455433221o.",
  "o345543332211o",
  "o345433322211o",
  "o344333222211o",
  "o333332222211o",
  "o233322222111o",
  "o223222221111o",
  "o122222211111o",
  ".o1222211111o.",
  "..oo111111oo..",
  "....oooooo....",
];
/** Bamboo ribs: the columns each body row's meridians cross. */
const RIBS_BIG: number[][] = [[], [5, 8], [3, 5, 8, 10], [2, 4, 7, 9, 11], [2, 4, 7, 9, 11], [2, 4, 7, 9, 11], [2, 4, 7, 9, 11],
  [2, 4, 7, 9, 11], [2, 4, 7, 9, 11], [2, 4, 7, 9, 11], [3, 5, 8, 10], [5, 8], []];
const BODY_SMALL = [
  "..oooo..",
  ".o4432o.",
  "o345321o",
  "o343221o",
  "o332211o",
  "o222111o",
  ".o1111o.",
  "..oooo..",
];
const RIBS_SMALL: number[][] = [[], [3, 5], [2, 5], [2, 5], [2, 5], [2, 5], [3, 5], []];
const TONES: Record<string, Color> = { o: "red1", 1: "red2", 2: "red3", 3: "red4", 4: "red5", 5: "gold4" };
const DARKER: Record<string, string> = { 5: "4", 4: "3", 3: "2", 2: "1", 1: "o", o: "o" };

/** A lantern body with its ribs and brass caps; `x` is the body's left edge. Returns the bottom row. */
function lantern(p: Px, x: number, top: number, body: readonly string[], ribs: readonly number[][], cap: number) {
  const rows = body.map((row, j) => [...row].map((c, i) => (ribs[j].includes(i) && c !== "." ? DARKER[c] : c)).join(""));
  art(p, x, top + 1, rows, { ...TONES });
  const w = body[0].length, left = x + Math.floor(w / 2) - cap;
  // Caps: short brass cylinders, lit left, the top one shading the paper just under it.
  art(p, left, top, ["a" + "b".repeat(cap * 2 - 2) + "c", "d" + "e".repeat(cap * 2 - 2) + "f"], { a: "gold5", b: "gold4", c: "gold3", d: "gold3", e: "gold2", f: "gold1" });
  const bottom = top + body.length;
  art(p, left, bottom, ["a" + "b".repeat(cap * 2 - 2) + "c", "d" + "e".repeat(cap * 2 - 2) + "f"], { a: "gold4", b: "gold3", c: "gold2", d: "gold2", e: "gold1", f: "wood1" });
  return bottom + 1;
}

const TASSEL = [
  ".kK.",
  ".rR.",
  ".kK.",
  "GgGq",
  "GgGq",
  "GgGq",
  "GgGq",
  "G.gq",
  "..g.",
];
const TASSEL_SMALL = [".K", "rR", "Gq", "Gq", "Gq", "g."];
const TASSEL_LEGEND = { k: "gold2", K: "gold3", r: "red3", R: "red4", G: "gold4", g: "gold3", q: "gold2" } as const;

export default defineSprites({
  /**
   * The big round red lantern by the door. Four frames at 3 fps: the body swings a pixel each
   * way and the tassel follows a frame behind. Anchor is the hook at the top of the cord.
   */
  "decor/lantern-red": {
    w: 16, h: 30, anchor: [8, 0], layer: "over", frames: 4, fps: 3,
    draw: (p, frame) => {
      const body = [0, 1, 0, -1][frame], tassel = [-1, 0, 1, 0][frame];
      const bottom = lantern(p, 1 + body, 3, BODY_BIG, RIBS_BIG, 3);
      p.vline(8, 0, 1, "red2").px(8 + (body > 0 ? 1 : body < 0 ? -1 : 0), 1, "red2").px(8 + body, 2, "red2");
      art(p, 6 + tassel, bottom, TASSEL, TASSEL_LEGEND);
    },
  },
  /** A small round lantern for a string or a corner; only its tassel stirs. */
  "decor/lantern-small": {
    w: 10, h: 19, anchor: [5, 0], layer: "over", frames: 4, fps: 3,
    draw: (p, frame) => {
      const tassel = [0, 1, 0, -1][frame];
      const bottom = lantern(p, 1, 2, BODY_SMALL, RIBS_SMALL, 2);
      p.vline(5, 0, 2, "red2");
      art(p, 4 + (frame === 2 ? 1 : 0) * 0 + Math.max(0, tassel) - Math.max(0, -tassel), bottom, TASSEL_SMALL, TASSEL_LEGEND);
    },
  },
});
